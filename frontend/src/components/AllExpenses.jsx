import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ExpenseCard from "./expenseCard";
import { FaArrowLeft } from "react-icons/fa";
import Cookies from "js-cookie";
import api from "../utils/api";

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 300;

const AllExpensesPage = () => {
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // Data
  const [expenses, setExpenses] = useState([]);
  const [totalCount, setTotalCount] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState(""); // debounced value actually sent to API

  // Pagination
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searching, setSearching] = useState(false);

  // Refs
  const loaderRef = useRef(null);
  const debounceTimer = useRef(null);

  // ── Debounced search ──
  useEffect(() => {
    // Clear previous timer
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    const trimmed = searchQuery.trim();

    // If search didn't actually change, skip
    if (trimmed === activeSearch) return;

    debounceTimer.current = setTimeout(() => {
      setActiveSearch(trimmed);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchQuery]);

  // ── When activeSearch changes, reset list and fetch from server ──
  useEffect(() => {
    // Skip the initial mount (handled by fetchInitial)
    if (loading) return;

    const searchExpenses = async () => {
      const userId = Cookies.get("id");
      if (!userId) return;

      setSearching(true);
      setCursor(null);
      setHasMore(true);

      try {
        const params = { limit: PAGE_SIZE };
        if (activeSearch) params.search = activeSearch;

        const response = await api.post(
          `${API_BASE}/user/all-expenses?${new URLSearchParams(params)}`,
          { userId }
        );

        const results = response.data?.expenses || [];
        setExpenses(results);
        setCursor(response.data.nextCursor);
        setHasMore(Boolean(response.data.nextCursor));
        if (response.data.totalCount !== undefined) {
          setTotalCount(response.data.totalCount);
        }
      } catch (error) {
        console.error("Error searching expenses:", error);
      } finally {
        setSearching(false);
      }
    };

    searchExpenses();
  }, [activeSearch]);

  // ── Load next page (scroll-triggered) ──
  const loadExpenses = useCallback(async () => {
    if (!hasMore || loadingMore || searching || loading) return;

    const userId = Cookies.get("id");
    if (!userId) return;

    setLoadingMore(true);

    try {
      const params = { limit: PAGE_SIZE };
      if (cursor) params.cursor = cursor;
      if (activeSearch) params.search = activeSearch;

      const response = await api.post(
        `${API_BASE}/user/all-expenses?${new URLSearchParams(params)}`,
        { userId }
      );

      const newExpenses = response.data?.expenses || [];
      setExpenses((prev) => {
        const existingIds = new Set(prev.map((e) => e._id));
        const unique = newExpenses.filter((e) => !existingIds.has(e._id));
        return [...prev, ...unique];
      });
      setCursor(response.data.nextCursor);
      setHasMore(Boolean(response.data.nextCursor));
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [cursor, hasMore, loadingMore, searching, activeSearch]);

  // ── Fetch initial page + count on mount ──
  useEffect(() => {
    const fetchInitial = async () => {
      const userId = Cookies.get("id");
      if (!userId) { setLoading(false); return; }

      try {
        const response = await api.post(
          `${API_BASE}/user/all-expenses?${new URLSearchParams({ limit: PAGE_SIZE })}`,
          { userId }
        );
        const firstPage = response.data?.expenses || [];
        setExpenses(firstPage);
        setCursor(response.data.nextCursor);
        setHasMore(Boolean(response.data.nextCursor));
        if (response.data.totalCount !== undefined) {
          setTotalCount(response.data.totalCount);
        }
      } catch (error) {
        console.error("Error fetching initial expenses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  // ── IntersectionObserver for infinite scroll ──
  useEffect(() => {
    if (loading || loadingMore || searching || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadExpenses();
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loaderRef.current, hasMore, loading, loadingMore, searching]);

  // ── Scroll fallback ──
  useEffect(() => {
    const onScroll = () => {
      const bottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;
      if (bottom) loadExpenses();
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [cursor, hasMore, loadingMore, searching]);

  const isSearchActive = activeSearch.length > 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30 relative overflow-hidden flex flex-col">
      {/* --- BACKGROUND FX --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-fuchsia-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col h-full flex-1">
        {/* --- CONTROL HEADER --- */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Top Row: Back & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="group p-2 rounded-full bg-zinc-900/50 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all duration-300 backdrop-blur-md shadow-lg"
              title="Back"
            >
              <FaArrowLeft className="text-sm text-zinc-400 group-hover:text-indigo-400 transition-colors" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight uppercase flex items-center gap-2">
                Transaction Archive
                <span className="md:hidden flex h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
              </h1>
            </div>
          </div>

          {/* Bottom Row: Search & Stats */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {searching ? (
                  <div className="w-4 h-4 border-2 border-zinc-600 border-t-indigo-400 rounded-full animate-spin"></div>
                ) : (
                  <svg
                    className="h-4 w-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                )}
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or category..."
                className="block w-full bg-zinc-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-9 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-white transition-colors"
                  title="Clear search"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Stats Badge */}
            {!loading && totalCount !== null && (
              <div className="flex items-center justify-between sm:justify-start gap-3 px-4 py-2.5 rounded-xl bg-zinc-900/50 border border-white/5 backdrop-blur-md shrink-0">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                  {isSearchActive ? "Results" : "Total Records"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-white leading-none">
                    {totalCount}
                  </span>
                  <div className={`w-1.5 h-1.5 rounded-full ${hasMore ? "bg-indigo-500 animate-pulse" : "bg-emerald-500"}`}></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- CONTENT LIST --- */}
        <div className="flex-1 bg-zinc-900/30 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm relative shadow-inner">
          <div className="absolute inset-0 overflow-y-auto p-3 sm:p-4 custom-scrollbar">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-2 border-zinc-800 border-t-indigo-500 rounded-full animate-spin"></div>
                <span className="text-[10px] font-mono text-zinc-500 animate-pulse uppercase tracking-widest">
                  Accessing Database...
                </span>
              </div>
            ) : searching ? (
              <div className="h-full flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-2 border-zinc-800 border-t-indigo-500 rounded-full animate-spin"></div>
                <span className="text-[10px] font-mono text-zinc-500 animate-pulse uppercase tracking-widest">
                  Searching...
                </span>
              </div>
            ) : expenses.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                <div className="w-16 h-16 bg-zinc-800/50 rounded-2xl flex items-center justify-center mb-4 border border-dashed border-zinc-700">
                  <svg
                    className="w-8 h-8 text-zinc-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-zinc-300 font-bold text-sm">
                  {isSearchActive ? "No Results Found" : "No Expenses Yet"}
                </h3>
                <p className="text-zinc-500 text-xs mt-1">
                  {isSearchActive
                    ? "Try a different search term."
                    : "Start recording expenses to see them here."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <ExpenseCard
                    key={expense._id}
                    title={expense.title}
                    category={expense.category}
                    subcategory={expense.subcategory}
                    time={expense.createdAt}
                    description={""}
                    amount={expense.amount}
                    iconColor={"bg-indigo-500"}
                    paidBy={expense.paidBy}
                    beneficiaries={expense.owedBy}
                  />
                ))}

                {/* Sentinel for IntersectionObserver */}
                <div ref={loaderRef} className="h-1 w-full"></div>

                {/* Loading more indicator */}
                {loadingMore && (
                  <div className="py-6 flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-zinc-800 border-t-indigo-500 rounded-full animate-spin"></div>
                    <span className="text-[10px] font-mono text-zinc-500 animate-pulse uppercase tracking-widest">
                      Loading more...
                    </span>
                  </div>
                )}

                {/* List End Marker */}
                {!hasMore && !loadingMore && (
                  <div className="py-6 flex justify-center">
                    <div className="h-1 w-12 bg-zinc-800/50 rounded-full"></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllExpensesPage;
