import Header from "../components/Header";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookie from "js-cookie";
import { Calendar, ChevronDown, TrendingUp, Package } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function Subcategories() {
  const location = useLocation();
  const { category } = location.state || {};

  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState("all");
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const group = location?.state?.group;

  // Initialize filters from navigation state if provided
  useEffect(() => {
    const incomingTimeframe = location?.state?.timeframe;
    const incomingStart = location?.state?.startDate;
    const incomingEnd = location?.state?.endDate;
    if (incomingTimeframe) {
      setTimeframe(incomingTimeframe);
      if (incomingTimeframe === "custom") {
        setShowCustomDatePicker(true);
        if (incomingStart) setStartDate(incomingStart);
        if (incomingEnd) setEndDate(incomingEnd);
      } else {
        setShowCustomDatePicker(false);
      }
    }
  }, []);

  const GRADIENT_COLORS = [
    "from-blue-500/40 to-cyan-500/20",
    "from-cyan-500/40 to-teal-500/20",
    "from-teal-500/40 to-emerald-500/20",
    "from-emerald-500/40 to-green-500/20",
    "from-green-500/40 to-lime-500/20",
    "from-lime-500/40 to-yellow-500/20",
    "from-yellow-500/40 to-amber-500/20",
    "from-amber-500/40 to-orange-500/20",
    "from-orange-500/40 to-red-500/20",
    "from-red-500/40 to-pink-500/20",
    "from-pink-500/40 to-purple-500/20",
    "from-purple-500/40 to-indigo-500/20",
  ];

  const getDateFilterForAPI = () => {
    if (timeframe === "custom" && startDate) {
      return startDate;
    }

    const now = new Date();
    let filterDate = null;

    switch (timeframe) {
      case "day":
        filterDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "week":
        filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        filterDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        return null;
    }

    return filterDate ? filterDate.toISOString().split("T")[0] : null;
  };

  useEffect(() => {
    if (!category) return;
    const userId = Cookie.get("id");

    if (!userId) return;

    const fetchSubcategories = async () => {
      setLoading(true);
      try {
        if (group && group._id) {
          const apiStartDate = getDateFilterForAPI();
          const response = await axios.post(
            `${API_BASE}/group/sub-categories`,
            {
              category: category,
              groupId: group._id,
              ...(apiStartDate && { startDate: apiStartDate, endDate }),
            }
          );
          if (response.data?.subcategories) {
            setSubcategories(response.data.subcategories);
          }

          return;
        }

        const apiStartDate = getDateFilterForAPI();

        const response = await axios.post(`${API_BASE}/user/subcategories`, {
          category: category,
          userId: userId,
          ...(apiStartDate && { startDate: apiStartDate, endDate }),
        });
        setSubcategories(response.data.subcategories || []);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubcategories();
  }, [category, timeframe, startDate, endDate]);

  const handleTimeframeChange = (value) => {
    setTimeframe(value);
    if (value !== "custom") {
      setShowCustomDatePicker(false);
      setStartDate("");
      setEndDate("");
    } else {
      setShowCustomDatePicker(true);
    }
  };

  const totalSpent = subcategories.reduce((sum, s) => sum + s.total, 0);
  const maxAmount = Math.max(...subcategories.map((s) => s.total), 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header title={category || "Select Category"} backPath="/analytics" />

        <div className="mt-6 mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 text-blue-300 font-medium">
              <Calendar size={20} />
              <span className="text-sm">Time Period:</span>
            </div>
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={timeframe}
                onChange={(e) => handleTimeframeChange(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-gray-900/60 backdrop-blur-sm text-white px-4 py-3 pr-10 rounded-xl border-2 border-blue-500/30 hover:border-blue-400/50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 cursor-pointer font-medium"
              >
                <option value="all">All Time</option>
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="custom">Custom Range</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none"
                size={20}
              />
            </div>
          </div>

          {showCustomDatePicker && (
            <div className="bg-gray-900/40 backdrop-blur-sm border-2 border-blue-500/30 rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-blue-300 text-sm font-medium mb-2">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-gray-800/60 text-white px-4 py-2.5 rounded-lg border-2 border-blue-500/30 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-blue-300 text-sm font-medium mb-2">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="w-full bg-gray-800/60 text-white px-4 py-2.5 rounded-lg border-2 border-blue-500/30 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 backdrop-blur-md rounded-2xl p-6 border-2 border-blue-500/30 shadow-2xl">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="text-blue-400" size={24} />
              <p className="text-blue-300 text-sm font-medium">Total Spent</p>
            </div>
            <p className="text-white text-3xl font-bold">
              ₹{totalSpent.toLocaleString()}
            </p>
          </div>
          <div className="bg-gradient-to-br from-cyan-900/40 to-cyan-800/20 backdrop-blur-md rounded-2xl p-6 border-2 border-cyan-500/30 shadow-2xl">
            <div className="flex items-center gap-3 mb-2">
              <Package className="text-cyan-400" size={24} />
              <p className="text-cyan-300 text-sm font-medium">Subcategories</p>
            </div>
            <p className="text-white text-3xl font-bold">
              {subcategories.length}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
              <p className="text-white/80 font-medium">
                Loading subcategories...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {subcategories.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package size={40} className="text-blue-400" />
                </div>
                <p className="text-blue-300 font-semibold text-lg">
                  No subcategories found
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Start adding expenses to see breakdown
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subcategories.map((sub, idx) => {
                  const percentage = (sub.total / maxAmount) * 100;
                  return (
                    <Link
                      key={idx}
                      to="/expenses"
                      state={{
                        category: category,
                        subcategory: sub.name,
                        total: sub.total,
                        group: group,
                        timeframe: timeframe,
                        startDate: getDateFilterForAPI(),
                        endDate: endDate,
                      }}
                      className="group"
                    >
                      <div
                        className={`relative overflow-hidden h-full flex flex-col justify-between p-6 rounded-2xl backdrop-blur-md bg-gradient-to-br ${
                          GRADIENT_COLORS[idx % GRADIENT_COLORS.length]
                        } border-2 border-white/20 hover:border-white/40 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 min-h-[140px]`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        <div className="relative z-10">
                          <span className="text-white font-bold text-lg block mb-3">
                            {sub.name}
                          </span>

                          <div className="space-y-2">
                            <div className="flex justify-between items-baseline">
                              <span className="text-white/70 text-sm">
                                Amount
                              </span>
                              <span className="text-white font-bold text-2xl">
                                ₹{sub.total.toLocaleString()}
                              </span>
                            </div>

                            <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-white/60 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-white/60 text-xs">
                                {((sub.total / totalSpent) * 100).toFixed(1)}%
                                of total
                              </span>
                              <span className="text-white/80 text-xs group-hover:text-white transition-colors">
                                View details →
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
