import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookie from "js-cookie";
import {
  Calendar,
  ChevronDown,
  TrendingUp,
  Package,
  ArrowLeft, // New
  Target, // New
  Zap, // New
} from "lucide-react";
import api from "../utils/api";

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

  // Replace your old GRADIENT_COLORS with this palette for the neon effects
  const CYBER_COLORS = [
    "#6366f1", // Indigo
    "#d946ef", // Fuchsia
    "#06b6d4", // Cyan
    "#10b981", // Emerald
    "#8b5cf6", // Violet
    "#f43f5e", // Rose
  ];

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
          const response = await api.post(
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

        const response = await api.post(`${API_BASE}/user/subcategories`, {
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30 relative overflow-hidden p-4 sm:p-6 lg:p-8">
      {/* --- BACKGROUND FX: Deep Space Atmosphere --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* --- HEADER: Sector Analysis Style --- */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/analytics">
            <button className="group p-3 rounded-full bg-zinc-900/50 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all duration-300 backdrop-blur-md shadow-lg shadow-black/20">
              <ArrowLeft className="w-5 h-5 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase flex items-center gap-3">
              {category || "Unknown Sector"}
              {loading && (
                <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-ping"></span>
              )}
            </h1>
            <p className="text-xs text-zinc-500 font-mono tracking-wider uppercase mt-1">
              SECTOR BREAKDOWN // DETAILED ANALYSIS
            </p>
          </div>
        </div>

        {/* --- CONTROL DECK (Filters) --- */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-2 mb-8 backdrop-blur-sm flex flex-col sm:flex-row gap-4 items-center justify-between shadow-lg">
          {/* Timeframe Dial */}
          <div className="relative group w-full sm:w-auto">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-indigo-400">
              <Calendar size={16} />
            </div>
            <select
              value={timeframe}
              onChange={(e) => handleTimeframeChange(e.target.value)}
              className="w-full sm:w-56 appearance-none bg-zinc-900 border border-white/10 text-white pl-10 pr-10 py-3 rounded-xl focus:outline-none focus:border-indigo-500/50 hover:bg-zinc-800 transition-colors cursor-pointer text-sm font-bold uppercase tracking-wide"
            >
              <option value="all">All Time Records</option>
              <option value="day">Daily Cycle</option>
              <option value="week">Weekly Cycle</option>
              <option value="month">Monthly Cycle</option>
              <option value="custom">Custom Parameters</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
            />
          </div>

          {/* Date Range Inputs (Holographic Slide Down) */}
          {showCustomDatePicker && (
            <div className="flex gap-2 w-full sm:w-auto animate-in fade-in slide-in-from-top-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-zinc-900 border border-white/10 text-zinc-300 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 w-full font-mono"
              />
              <span className="text-zinc-600 self-center font-bold">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="bg-zinc-900 border border-white/10 text-zinc-300 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 w-full font-mono"
              />
            </div>
          )}
        </div>

        {/* --- HUD STATS (Overview) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Total Spent Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950/30 to-zinc-900/50 border border-indigo-500/20 rounded-2xl p-6 shadow-2xl group">
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(99,102,241,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-shimmer pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 text-indigo-400">
                  <TrendingUp size={20} />
                  <p className="text-xs font-bold uppercase tracking-widest">
                    Sector Volume
                  </p>
                </div>
                <p className="text-4xl sm:text-5xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] font-mono">
                  ₹{totalSpent.toLocaleString()}
                </p>
              </div>
              <div className="opacity-20 group-hover:opacity-40 transition-opacity transform group-hover:scale-110 duration-700">
                <Target size={80} className="text-indigo-500" />
              </div>
            </div>
          </div>

          {/* Subcategories Count Card */}
          <div className="relative overflow-hidden bg-zinc-900/40 border border-white/5 rounded-2xl p-6 shadow-xl hover:bg-zinc-800/40 transition-colors">
            <div className="flex items-center justify-between h-full">
              <div>
                <div className="flex items-center gap-2 mb-2 text-cyan-400">
                  <Package size={20} />
                  <p className="text-xs font-bold uppercase tracking-widest">
                    Active Nodes
                  </p>
                </div>
                <p className="text-4xl sm:text-5xl font-black text-white tracking-tighter font-mono">
                  {subcategories.length}
                </p>
                <p className="text-xs text-zinc-500 mt-2 font-mono">
                  UNIQUE SPENDING POINTS
                </p>
              </div>

              {/* Decorative Visual Bars */}
              <div className="flex gap-1 items-end h-16 opacity-50">
                {[40, 70, 50, 90, 30, 60].map((h, i) => (
                  <div
                    key={i}
                    className="w-2 bg-cyan-900/50 border border-cyan-500/30 rounded-sm transition-all duration-500 hover:bg-cyan-500/50"
                    style={{ height: `${h}%` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- MAIN GRID (Data Blocks) --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 border-4 border-zinc-800 border-t-indigo-500 rounded-full animate-spin"></div>
            <span className="text-xs font-mono text-zinc-500 animate-pulse">
              DECRYPTING SECTOR DATA...
            </span>
          </div>
        ) : (
          <div className="space-y-3">
            {subcategories.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-zinc-900/20">
                <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package size={40} className="text-zinc-600" />
                </div>
                <p className="text-zinc-300 font-bold text-lg uppercase tracking-wide">
                  No Data Signatures Found
                </p>
                <p className="text-zinc-500 text-sm mt-2 font-mono">
                  INITIATE TRANSACTIONS TO POPULATE GRID
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subcategories.map((sub, idx) => {
                  const percentage = (sub.total / maxAmount) * 100;
                  const color = CYBER_COLORS[idx % CYBER_COLORS.length];

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
                      className="group relative block"
                    >
                      <div className="relative h-full flex flex-col justify-between p-6 rounded-2xl bg-zinc-900/40 backdrop-blur-sm border border-white/5 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] hover:-translate-y-1 overflow-hidden">
                        {/* Glowing accent line on top */}
                        <div
                          className="absolute top-0 left-0 h-[2px] w-full transition-all duration-500 opacity-0 group-hover:opacity-100"
                          style={{
                            backgroundColor: color,
                            boxShadow: `0 0 10px ${color}`,
                          }}
                        ></div>

                        {/* Content */}
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-white font-bold text-lg block tracking-tight group-hover:text-indigo-200 transition-colors">
                              {sub.name}
                            </span>
                            <div className="bg-black/30 p-1.5 rounded-lg text-zinc-400 group-hover:text-white transition-colors">
                              <Zap size={14} />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between items-baseline">
                              <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                                Value
                              </span>
                              <span className="text-white font-bold text-2xl font-mono">
                                ₹{sub.total.toLocaleString()}
                              </span>
                            </div>

                            {/* Cyber Progress Bar */}
                            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700 ease-out group-hover:animate-pulse"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: color,
                                  boxShadow: `0 0 8px ${color}`,
                                }}
                              ></div>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-white/5">
                              <span className="text-zinc-500 text-xs font-mono">
                                {((sub.total / totalSpent) * 100).toFixed(1)}%
                                SHARE
                              </span>
                              <span className="text-indigo-400 text-xs font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                Access Logs →
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
