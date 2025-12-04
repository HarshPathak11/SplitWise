import Header from "../components/Header";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookie from "js-cookie";
import { Search, Calendar, Receipt, TrendingUp, Filter } from "lucide-react";

export default function Expenses() {
  const location = useLocation();
  const { category, subcategory, timeframe, startDate, endDate } =
    location.state || {};
  const userId = Cookie.get("id");
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const group = location?.state?.group;

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [expandedExpenseId, setExpandedExpenseId] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchExpenses = async () => {
      setLoading(true);
      try {
        if (group && Array.isArray(group.expenses)) {
          const response = await axios.post(
            `${API_BASE}/group/expenses-by-subcategory`,
            {
              category: category,
              groupId: group._id,
              subcategory: subcategory,
              ...(startDate && { startDate, endDate }),
            }
          );
          if (response.data?.expenses) {
            setExpenses(response.data.expenses || []);
          }

          return;
        }

        const response = await axios.post(
          `${API_BASE}/user/expenses-by-subcategory`,
          {
            userId,
            category: category,
            subcategory: subcategory,
            ...(startDate && { startDate, endDate }),
          }
        );
        setExpenses(response.data.expenses || []);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [userId, category, subcategory, API_BASE, startDate, endDate]);

  const filteredExpenses = expenses
    .filter((exp) => exp.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "date") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else if (sortBy === "amount-high") {
        return b.amount - a.amount;
      } else if (sortBy === "amount-low") {
        return a.amount - b.amount;
      }
      return 0;
    });

  // ✅ Calculate total only for the current user’s owed amounts
  const totalAmount = filteredExpenses.reduce((sum, exp) => {
    const owedEntry = exp.owedBy?.find(
      (o) => o.user?._id === userId || o.user === userId
    );
    return sum + (owedEntry?.amount || 0);
  }, 0);

  // ✅ Average based on how many expenses involve this user
  const userExpenses = filteredExpenses.filter((exp) =>
    exp.owedBy?.some((o) => o.user?._id === userId || o.user === userId)
  );

  const averageAmount =
    userExpenses.length > 0 ? totalAmount / userExpenses.length : 0;

  const getTimePeriodLabel = () => {
    if (!timeframe || timeframe === "all") return "All Time";
    if (timeframe === "day") return "Today";
    if (timeframe === "week") return "This Week";
    if (timeframe === "month") return "This Month";
    if (timeframe === "custom" && startDate && endDate) {
      return `${new Date(startDate).toLocaleDateString()} - ${new Date(
        endDate
      ).toLocaleDateString()}`;
    }
    return "All Time";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <Header title={subcategory || "Expenses"} backPath="/subcategories" />

        {timeframe && timeframe !== "all" && (
          <div className="mt-4 mb-6 flex items-center gap-2 bg-blue-900/30 backdrop-blur-sm border border-blue-500/30 rounded-xl px-4 py-3">
            <Calendar size={18} className="text-blue-400" />
            <span className="text-blue-300 text-sm font-medium">
              Showing expenses for: {getTimePeriodLabel()}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 mb-8">
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 backdrop-blur-md rounded-2xl p-5 border-2 border-blue-500/30 shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-blue-400" size={20} />
              <p className="text-blue-300 text-sm font-medium">Your Total Share</p>
            </div>
            <p className="text-white text-2xl font-bold">
              ₹{totalAmount.toLocaleString()}
            </p>
          </div>
          <div className="bg-gradient-to-br from-cyan-900/40 to-cyan-800/20 backdrop-blur-md rounded-2xl p-5 border-2 border-cyan-500/30 shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="text-cyan-400" size={20} />
              <p className="text-cyan-300 text-sm font-medium">Count</p>
            </div>
            <p className="text-white text-2xl font-bold">
              {filteredExpenses.length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-sky-900/40 to-sky-800/20 backdrop-blur-md rounded-2xl p-5 border-2 border-sky-500/30 shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-sky-400" size={20} />
              <p className="text-sky-300 text-sm font-medium">Average</p>
            </div>
            <p className="text-white text-2xl font-bold">
              ₹{Math.round(averageAmount).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl backdrop-blur-md bg-gray-900/60 border-2 border-blue-500/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all"
            />
          </div>
          <div className="relative sm:w-48">
            <Filter
              className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 z-50 pointer-events-none"
              size={20}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full appearance-none pl-12 pr-10 py-3 rounded-xl backdrop-blur-md bg-gray-900/60 border-2 border-blue-500/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all cursor-pointer"
            >
              <option value="date">Latest First</option>
              <option value="amount-high">Highest Amount</option>
              <option value="amount-low">Lowest Amount</option>
            </select>
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white pointer-events-none"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 6L8 10L12 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
              <p className="text-white/80 font-medium">Loading expenses...</p>
            </div>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt size={40} className="text-blue-400" />
            </div>
            <p className="text-blue-300 font-semibold text-lg">
              No expenses found
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {searchTerm
                ? "Try adjusting your search"
                : "Start adding expenses to track your spending"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExpenses.map((exp) => {
              const isRecent =
                new Date().getTime() - new Date(exp.createdAt).getTime() <
                86400000;

              const isExpanded = expandedExpenseId === exp._id;

              return (
                <div
                  key={exp._id}
                  className="group relative overflow-hidden bg-gradient-to-r from-gray-900/60 to-blue-900/20 backdrop-blur-md rounded-2xl p-5 border-2 border-blue-500/20 hover:border-blue-400/50 hover:scale-[1.01] transition-all duration-300 shadow-lg hover:shadow-blue-500/20 cursor-pointer"
                  onClick={() =>
                    setExpandedExpenseId((prev) =>
                      prev === exp._id ? null : exp._id
                    )
                  }
                >
                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Main expense row */}
                  <div className="relative flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                          <Receipt className="text-blue-400" size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold text-base truncate">
                              {exp.title}
                            </span>
                            {isRecent && (
                              <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-xs font-medium">
                                New
                              </span>
                            )}
                          </div>
                          <span className="text-white/60 text-sm block">
                            {new Date(exp.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <span className="text-white font-bold text-xl block">
                        ₹{exp.amount.toLocaleString()}
                      </span>
                      <span className="text-blue-400 text-xs">
                        {((exp.amount / totalAmount) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Extra info shown only when this expense is expanded */}
                  <div
                    className={`transition-all duration-300 overflow-hidden ${
                      isExpanded
                        ? "max-h-40 mt-3 border-t border-blue-500/20 pt-3"
                        : "max-h-0"
                    }`}
                  >
                    {isExpanded && (
                      <div className="space-y-1 animate-fade-in">
                        {exp.paidBy && (
                          <p className="text-xs text-blue-300">
                            <span className="font-medium text-blue-400">
                              Paid by:
                            </span>{" "}
                            {exp.paidBy.username ||
                              exp.paidBy.name ||
                              "Unknown"}
                          </p>
                        )}

                        {exp.owedBy?.length > 0 && (
                          <p className="text-xs text-cyan-300">
                            <span className="font-medium text-cyan-400">
                              Beneficiaries:
                            </span>{" "}
                            {exp.owedBy
                              .map(
                                (o) =>
                                  `${
                                    o.user?.username ||
                                    o.user?.name ||
                                    "Unknown"
                                  } (₹${o.amount})`
                              )
                              .join(", ")}
                          </p>
                        )}

                        {exp?.group && (
                          <p className="text-xs text-sky-300">
                            <span className="font-medium text-sky-400">
                              Group:
                            </span>{" "}
                            {exp.group?.name || "Unnamed Group"}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
