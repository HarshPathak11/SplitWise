import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ExpenseCard from "./expenseCard"; // Ensure this component is styled properly
import { FaArrowLeft } from "react-icons/fa";
import Cookies from "js-cookie";
import axios from "axios";

const AllExpensesPage = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const [searchQuery, setSearchQuery] = useState("");

  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const userId = Cookies.get("id"); // Get userId from cookies
    if (!userId) return;

    const fetchExpenses = async () => {
      try {
        setLoading(true);
        const response = await axios.post(`${API_BASE}/user/all-expenses`, {
          userId,
        });
        if (response.data?.expenses) {
          // Sort by createdAt descending (latest first)
          const sortedExpenses = response.data.expenses.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setExpenses(sortedExpenses);
        }
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

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
          {/* Top Row: Back & Title (Smaller Header) */}
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
                {/* Mobile-only count dot */}
                <span className="md:hidden flex h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
              </h1>
            </div>
          </div>

          {/* Bottom Row: Search & Stats (Responsive Grid) */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or category..."
                className="block w-full bg-zinc-900/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-inner"
              />
            </div>

            {/* Stats Badge (Compact on Mobile) */}
            {!loading && (
              <div className="flex items-center justify-between sm:justify-start gap-3 px-4 py-2.5 rounded-xl bg-zinc-900/50 border border-white/5 backdrop-blur-md shrink-0">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                  Total Records
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-white leading-none">
                    {expenses.length}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
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
            ) : filteredExpenses.length === 0 ? (
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
                  No Matches Found
                </h3>
                <p className="text-zinc-500 text-xs mt-1">
                  Try adjusting your search filters.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredExpenses.map((expense) => (
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

                {/* List End Marker */}
                <div className="py-6 flex justify-center">
                  <div className="h-1 w-12 bg-zinc-800/50 rounded-full"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllExpensesPage;
