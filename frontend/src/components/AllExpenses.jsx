import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ExpenseCard from "./expenseCard";
import { FaArrowLeft } from "react-icons/fa";
import Cookies from "js-cookie";
import api from "../utils/api";
import { motion } from "framer-motion";

const handleScrollTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
};

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 300;

const AllExpensesPage = () => {
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // Data
  const [expenses, setExpenses] = useState([]);
  const [totalCount, setTotalCount] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  // Filters
  const [activeFilter, setActiveFilter] = useState("all"); // "all" | "personal" | "group"
  const [selectedGroups, setSelectedGroups] = useState([]); // [{_id, name}, ...]
  const [groups, setGroups] = useState([]);
  const [showTripPicker, setShowTripPicker] = useState(false);
  const [tripSearch, setTripSearch] = useState("");

  // Pagination
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searching, setSearching] = useState(false);

  // Refs
  const loaderRef = useRef(null);
  const debounceTimer = useRef(null);

  // ── Build query params ──
  const buildParams = useCallback((overrideCursor) => {
    const params = { limit: PAGE_SIZE };
    if (overrideCursor) params.cursor = overrideCursor;
    if (activeSearch) params.search = activeSearch;
    if (activeFilter === "personal") params.filter = "personal";
    if (activeFilter === "group" && selectedGroups.length > 0) {
      params.groupIds = selectedGroups.map((g) => g._id).join(",");
    }
    return params;
  }, [activeSearch, activeFilter, selectedGroups]);

  useEffect(() => {
    handleScrollTop();
  }, []);

  // ── Fetch user's groups on mount ──
  useEffect(() => {
    const fetchGroups = async () => {
      const userId = Cookies.get("id");
      if (!userId) return;
      try {
        const res = await api.get(`${API_BASE}/group/user-groups/${userId}`);
        setGroups(Array.isArray(res.data) ? res.data : res.data?.groups || []);
      } catch (err) {
        console.error("Error fetching groups:", err);
      }
    };
    fetchGroups();
  }, []);

  // ── Debounced search ──
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    const trimmed = searchQuery.trim();
    if (trimmed === activeSearch) return;
    debounceTimer.current = setTimeout(() => setActiveSearch(trimmed), DEBOUNCE_MS);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [searchQuery]);

  // ── Common fetch function (resets list) ──
  const fetchFresh = useCallback(async () => {
    const userId = Cookies.get("id");
    if (!userId) return;

    setSearching(true);
    setCursor(null);
    setHasMore(true);

    try {
      const params = buildParams(null);
      const response = await api.post(
        `${API_BASE}/user/all-expenses?${new URLSearchParams(params)}`,
        { userId }
      );
      const results = response.data?.expenses || [];
      setExpenses(results);
      setCursor(response.data.nextCursor);
      setHasMore(Boolean(response.data.nextCursor));
      if (response.data.totalCount !== undefined) setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setSearching(false);
    }
  }, [buildParams]);

  // ── Re-fetch when search or filter changes ──
  useEffect(() => {
    if (loading) return;
    fetchFresh();
  }, [activeSearch, activeFilter, selectedGroups]);

  // ── Load next page (scroll-triggered) ──
  const loadExpenses = useCallback(async () => {
    if (!hasMore || loadingMore || searching || loading) return;
    const userId = Cookies.get("id");
    if (!userId) return;
    setLoadingMore(true);
    try {
      const params = buildParams(cursor);
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
  }, [cursor, hasMore, loadingMore, searching, buildParams, loading]);

  // ── Initial page + count on mount ──
  useEffect(() => {
    const fetchInitial = async () => {
      const userId = Cookies.get("id");
      if (!userId) { setLoading(false); return; }
      try {
        const response = await api.post(
          `${API_BASE}/user/all-expenses?${new URLSearchParams({ limit: PAGE_SIZE })}`,
          { userId }
        );
        setExpenses(response.data?.expenses || []);
        setCursor(response.data.nextCursor);
        setHasMore(Boolean(response.data.nextCursor));
        if (response.data.totalCount !== undefined) setTotalCount(response.data.totalCount);
      } catch (error) {
        console.error("Error fetching initial expenses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  // ── IntersectionObserver ──
  useEffect(() => {
    if (loading || loadingMore || searching || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadExpenses(); },
      { threshold: 1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => { if (loaderRef.current) observer.unobserve(loaderRef.current); };
  }, [loaderRef.current, hasMore, loading, loadingMore, searching]);

  // ── Scroll fallback ──
  useEffect(() => {
    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) loadExpenses();
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [cursor, hasMore, loadingMore, searching]);

  // ── Helpers ──
  const isFiltered = activeFilter !== "all" || activeSearch.length > 0;

  const handleFilterChange = (filter) => {
    if (filter === activeFilter) return;
    setActiveFilter(filter);
    if (filter !== "group") setSelectedGroups([]);
  };

  const toggleGroup = (group) => {
    setSelectedGroups((prev) => {
      const exists = prev.some((g) => g._id === group._id);
      return exists ? prev.filter((g) => g._id !== group._id) : [...prev, group];
    });
  };

  const removeGroup = (groupId) => {
    setSelectedGroups((prev) => {
      const next = prev.filter((g) => g._id !== groupId);
      if (next.length === 0 && activeFilter === "group") setActiveFilter("all");
      return next;
    });
  };

  const filteredTrips = groups.filter((g) =>
    g.name?.toLowerCase().includes(tripSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30 relative overflow-hidden flex flex-col">
      {/* --- BACKGROUND FX --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-fuchsia-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col h-full flex-1">
        {/* --- HEADER --- */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Back & Title */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
            className="flex items-center gap-3"
          >
            <button
              onClick={() => navigate(-1)}
              className="group p-2 rounded-full bg-zinc-900/50 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all duration-300 backdrop-blur-md shadow-lg"
            >
              <FaArrowLeft className="text-sm text-zinc-400 group-hover:text-indigo-400 transition-colors" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight uppercase flex items-center gap-2">
              Transaction Archive
              <span className="md:hidden flex h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
            </h1>
          </motion.div>

          {/* Filter Pills */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1], delay: 0.1 }}
            className="flex flex-wrap items-center gap-2"
          >
            {[
              { key: "all", label: "All" },
              { key: "personal", label: "Personal" },
              { key: "group", label: "By Trip" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  handleFilterChange(key);
                  if (key === "group") setShowTripPicker(true);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 border ${
                  activeFilter === key
                    ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300 shadow-sm shadow-indigo-500/10"
                    : "bg-zinc-900/50 border-white/5 text-zinc-400 hover:border-white/15 hover:text-zinc-300"
                }`}
              >
                {label}
              </button>
            ))}

            {/* Show + button to add more trips when some are already selected */}
            {activeFilter === "group" && selectedGroups.length > 0 && (
              <button
                onClick={() => setShowTripPicker(true)}
                className="px-2.5 py-1.5 rounded-full text-xs font-medium border border-dashed border-white/10 text-zinc-400 hover:border-indigo-500/40 hover:text-indigo-300 transition-all"
              >
                + Add Trip
              </button>
            )}
          </motion.div>

          {/* Selected Trip Chips */}
          {selectedGroups.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedGroups.map((g) => (
                <span
                  key={g._id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium"
                >
                  {g.name}
                  <button
                    onClick={() => removeGroup(g._id)}
                    className="hover:text-white transition-colors ml-0.5"
                    title={`Remove ${g.name}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Search & Stats Row */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0.8 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {searching ? (
                  <div className="w-4 h-4 border-2 border-zinc-600 border-t-indigo-400 rounded-full animate-spin"></div>
                ) : (
                  <svg className="h-4 w-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {!loading && totalCount !== null && (
              <div className="flex items-center justify-between sm:justify-start gap-3 px-4 py-2.5 rounded-xl bg-zinc-900/50 border border-white/5 backdrop-blur-md shrink-0">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                  {isFiltered ? "Results" : "Total Records"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-white leading-none">{totalCount}</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${hasMore ? "bg-indigo-500 animate-pulse" : "bg-emerald-500"}`}></div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* --- CONTENT LIST --- */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
          className="flex-1 bg-zinc-900/30 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm relative shadow-inner"
        >
          <div className="absolute inset-0 overflow-y-auto p-3 sm:p-4 custom-scrollbar">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-2 border-zinc-800 border-t-indigo-500 rounded-full animate-spin"></div>
                <span className="text-[10px] font-mono text-zinc-500 animate-pulse uppercase tracking-widest">Accessing Database...</span>
              </div>
            ) : searching ? (
              <div className="h-full flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-2 border-zinc-800 border-t-indigo-500 rounded-full animate-spin"></div>
                <span className="text-[10px] font-mono text-zinc-500 animate-pulse uppercase tracking-widest">Searching...</span>
              </div>
            ) : activeFilter === "group" && selectedGroups.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                <div className="w-16 h-16 bg-zinc-800/50 rounded-2xl flex items-center justify-center mb-4 border border-dashed border-zinc-700">
                  <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-zinc-300 font-bold text-sm">Select Trips</h3>
                <p className="text-zinc-500 text-xs mt-1">Choose one or more trips to filter expenses.</p>
                <button
                  onClick={() => setShowTripPicker(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-medium hover:bg-indigo-500/30 transition-all"
                >
                  Choose Trips
                </button>
              </div>
            ) : expenses.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                <div className="w-16 h-16 bg-zinc-800/50 rounded-2xl flex items-center justify-center mb-4 border border-dashed border-zinc-700">
                  <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-zinc-300 font-bold text-sm">{isFiltered ? "No Results Found" : "No Expenses Yet"}</h3>
                <p className="text-zinc-500 text-xs mt-1">{isFiltered ? "Try adjusting your search or filters." : "Start recording expenses to see them here."}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <ExpenseCard
                    key={expense._id}
                    _id={expense._id}
                    isPersonal={expense.owedBy.length === 0}
                    onDelete={(id) => setExpenses(prev => prev.filter(e => e._id !== id))}
                    title={expense.title}
                    category={expense.category}
                    subcategory={expense.subcategory}
                    time={expense.createdAt}
                    description={""}
                    amount={expense.amount}
                    iconColor={"bg-indigo-500"}
                    paidBy={expense.paidBy}
                    beneficiaries={expense.owedBy}
                    groupName={expense.group?.name}
                  />
                ))}
                <div ref={loaderRef} className="h-1 w-full"></div>
                {loadingMore && (
                  <div className="py-6 flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-zinc-800 border-t-indigo-500 rounded-full animate-spin"></div>
                    <span className="text-[10px] font-mono text-zinc-500 animate-pulse uppercase tracking-widest">Loading more...</span>
                  </div>
                )}
                {!hasMore && !loadingMore && (
                  <div className="py-6 flex justify-center">
                    <div className="h-1 w-12 bg-zinc-800/50 rounded-full"></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ═══════════ TRIP PICKER POPUP ═══════════ */}
      {showTripPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => { setShowTripPicker(false); setTripSearch(""); }}
        >
          <div
            className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 pb-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Select Trips</h3>
                <button
                  onClick={() => { setShowTripPicker(false); setTripSearch(""); }}
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search within popup */}
              <div className="relative mb-3">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={tripSearch}
                  onChange={(e) => setTripSearch(e.target.value)}
                  placeholder="Search trips..."
                  autoFocus
                  className="block w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            {/* Trip list */}
            <div className="px-5 pb-2 max-h-60 overflow-y-auto custom-scrollbar">
              {filteredTrips.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-zinc-500 text-sm">No trips found</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredTrips.map((g) => {
                    const isSelected = selectedGroups.some((sg) => sg._id === g._id);
                    return (
                      <button
                        key={g._id}
                        onClick={() => toggleGroup(g)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                          isSelected
                            ? "bg-indigo-500/15 border border-indigo-500/30"
                            : "hover:bg-zinc-800/60 border border-transparent"
                        }`}
                      >
                        {/* Checkbox */}
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? "bg-indigo-500 border-indigo-500"
                            : "border-zinc-600"
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium truncate ${isSelected ? "text-indigo-200" : "text-zinc-300"}`}>
                            {g.name}
                          </p>
                          {g.members && (
                            <p className="text-[10px] text-zinc-500 mt-0.5">
                              {g.members.length} member{g.members.length !== 1 ? "s" : ""}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                {selectedGroups.length} trip{selectedGroups.length !== 1 ? "s" : ""} selected
              </span>
              <button
                onClick={() => { setShowTripPicker(false); setTripSearch(""); }}
                className="px-4 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-medium hover:bg-indigo-500/30 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllExpensesPage;
