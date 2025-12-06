import Header from "../components/Header";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { 
  Calendar, 
  ChevronDown, 
  Trophy, 
  TrendingUp, 
  Target, 
  ArrowLeft 
} from "lucide-react";

export default function Analytics() {
  const [topCategories, setTopCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredCount, setFilteredCount] = useState(null);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const location = useLocation();
  const group = location?.state?.group;
  const [isLarge, setIsLarge] = useState(false);
  const [timeframe, setTimeframe] = useState(group?.name ? "all" : "month");

  useEffect(() => {
    const handleResize = () => setIsLarge(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const COLORS = [
    "#3B82F6",
    "#06B6D4",
    "#10B981",
    "#F59E0B",
    "#0EA5E9",
    "#8B5CF6",
    "#EC4899",
    "#14B8A6",
    "#F97316",
    "#6366F1",
    "#2DD4BF",
    "#FBBF24",
    "#60A5FA",
    "#A78BFA",
    "#FB923C",
    "#38BDF8",
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
    const fetchTopCategories = async () => {
      try {
        setLoading(true);

        if (group && group._id) {
          const apiStartDate = getDateFilterForAPI();
          const response = await axios.get(
            `${API_BASE}/group/${group._id}/top-categories`,
            {
              params: apiStartDate ? { startDate: apiStartDate, endDate } : {},
            }
          );
          if (response.data?.categories) {
            setTopCategories(response.data.categories);
          }
          return;
        }

        const userId = Cookies.get("id");
        if (!userId) return;

        const apiStartDate = getDateFilterForAPI();
        const response = await axios.post(`${API_BASE}/user/top-categories`, {
          userId,
          ...(apiStartDate && { startDate: apiStartDate, endDate }),
        });
        if (response.data?.categories) {
          setTopCategories(response.data.categories);
        }
        setFilteredCount(null);
      } catch (error) {
        console.error("Error fetching top categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopCategories();
  }, [group, timeframe, startDate, endDate]);

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

  const totalSpending = topCategories.reduce(
    (sum, cat) => sum + (cat.total || 0),
    0
  );

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-blue-500/30 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold mb-1">{data.name}</p>
          <p className="text-blue-400 font-bold">
            ₹{data.value.toLocaleString()}
          </p>
          <p className="text-gray-400 text-sm">
            {((data.value / totalSpending) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30 relative overflow-hidden p-4 sm:p-6 lg:p-8">
      {/* --- BACKGROUND FX: Deep Space/Cyber Atmosphere --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* --- HEADER: Mission Status --- */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={group ? `/tripDetails/${group._id}` : "/dash"}>
            <button className="group p-3 rounded-full bg-zinc-900/50 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all duration-300 backdrop-blur-md shadow-lg shadow-black/20">
              <ArrowLeft className="w-5 h-5 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-lg font-black text-white tracking-tight uppercase flex items-center gap-3">
              {group?.name
                ? `Mission Report: ${group.name}`
                : "Global Statistics"}
              {loading && (
                <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-ping"></span>
              )}
            </h1>
            <p className="text-xs text-zinc-500 font-mono tracking-wider uppercase mt-1">
              FINANCIAL INTELLIGENCE UNIT
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

        {/* --- HUD STATS (Scoreboard) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Main Score: Total Spent */}
          <div className="col-span-1 md:col-span-2 relative overflow-hidden bg-gradient-to-br from-indigo-950/50 to-zinc-900/50 border border-indigo-500/20 rounded-3xl p-6 shadow-2xl group">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(99,102,241,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-shimmer pointer-events-none" />

            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity transform group-hover:scale-110 duration-700">
              <Target size={120} className="text-indigo-500" />
            </div>

            <div className="relative z-10">
              <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                Total Expenditure
              </p>
              <h2 className="text-5xl sm:text-7xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] font-mono">
                ₹{totalSpending.toLocaleString()}
              </h2>
              <div className="mt-4 inline-flex items-center gap-2 text-xs text-zinc-400 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5">
                <span className="text-indigo-300 font-bold font-mono">
                  {filteredCount}
                </span>
                <span className="uppercase tracking-wide">
                  Transactions Logged
                </span>
              </div>
            </div>
          </div>

          {/* Secondary Stats Grid */}
          <div className="grid grid-rows-2 gap-4">
            {/* Stat 1 */}
            <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-zinc-800/40 transition-colors">
              <div>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                  Active Sectors
                </p>
                <p className="text-2xl font-bold text-white font-mono">
                  {topCategories.length}
                </p>
              </div>
              {/* Visual Bars */}
              <div className="flex gap-1 items-end h-8">
                {[40, 70, 50, 90].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-zinc-700 rounded-sm"
                    style={{ height: `${h}%` }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Stat 2 */}
            <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-zinc-800/40 transition-colors">
              <div>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                  Avg. per Sector
                </p>
                <p className="text-2xl font-bold text-white font-mono">
                  ₹
                  {topCategories.length > 0
                    ? Math.round(
                        totalSpending / topCategories.length
                      ).toLocaleString()
                    : 0}
                </p>
              </div>
              <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400 border border-emerald-500/20">
                <TrendingUp size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* --- MAIN VISUALIZER GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: Holographic Chart */}
          <div className="lg:col-span-5 bg-zinc-900/30 border border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center relative min-h-[400px] shadow-inner">
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-zinc-800 border-t-indigo-500 rounded-full animate-spin"></div>
                <span className="text-xs font-mono text-zinc-500 animate-pulse">
                  PROCESSING DATA STREAM...
                </span>
              </div>
            ) : topCategories.length === 0 ? (
              <div className="text-center opacity-50">
                <div className="w-24 h-24 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-zinc-700">
                  <Target size={40} className="text-zinc-600" />
                </div>
                <p className="text-zinc-400 text-sm font-medium">
                  NO DATA SIGNATURE DETECTED
                </p>
              </div>
            ) : (
              <>
                <div className="absolute top-6 left-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    Visual Breakdown
                  </span>
                </div>

                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={topCategories}
                      dataKey="total"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      innerRadius={70}
                      paddingAngle={4}
                      cornerRadius={6}
                      stroke="none"
                    >
                      {topCategories.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          className="outline-none hover:opacity-80 transition-opacity cursor-pointer filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Decorative Center Element */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-dashed border-white/10 pointer-events-none animate-spin-slow flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-zinc-950/80 backdrop-blur-sm border border-white/5 flex items-center justify-center">
                    <span className="text-[10px] text-zinc-600 font-mono">
                      100%
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* RIGHT: Leaderboard (XP Bars) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 mb-4 px-2">
              <Trophy
                size={18}
                className="text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]"
              />
              <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                Top Spenders Leaderboard
              </h3>
            </div>

            <div className="space-y-3">
              {topCategories.map((category, index) => {
                const percentage = (category.total / totalSpending) * 100;
                const color = COLORS[index % COLORS.length];

                return (
                  <Link
                    key={category.name}
                    to="/subcategories"
                    state={{
                      category: category.name,
                      group,
                      timeframe,
                      startDate,
                      endDate,
                    }}
                    className="group relative block"
                  >
                    <div className="relative bg-zinc-900/40 hover:bg-zinc-900/80 border border-white/5 hover:border-indigo-500/30 rounded-xl p-4 transition-all duration-300 overflow-hidden backdrop-blur-sm">
                      {/* "XP Bar" Background Fill */}
                      <div
                        className="absolute inset-0 opacity-10 transition-all duration-1000 ease-out group-hover:opacity-15"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: color,
                        }}
                      ></div>

                      <div className="relative flex justify-between items-center z-10">
                        <div className="flex items-center gap-4">
                          {/* Rank Badge */}
                          <div
                            className={`w-8 h-8 flex items-center justify-center rounded-lg font-black text-sm border ${
                              index === 0
                                ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]"
                                : index === 1
                                ? "bg-zinc-400/10 text-zinc-300 border-zinc-400/30"
                                : index === 2
                                ? "bg-orange-700/10 text-orange-400 border-orange-700/30"
                                : "bg-zinc-800/50 text-zinc-500 border-zinc-700/30"
                            }`}
                          >
                            {index + 1}
                          </div>

                          <div>
                            <h4 className="text-white font-bold text-sm sm:text-base group-hover:text-indigo-300 transition-colors uppercase tracking-tight">
                              {category.name}
                            </h4>

                            {/* Progress Line */}
                            <div className="mt-2 w-32 sm:w-48 h-1 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full shadow-[0_0_8px_currentColor]"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: color,
                                  color: color,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-white font-mono font-bold text-lg tracking-tight">
                            ₹{category.total.toLocaleString()}
                          </p>
                          <p className="text-zinc-500 text-[10px] font-bold uppercase bg-black/30 px-1.5 py-0.5 rounded inline-block mt-1">
                            {percentage.toFixed(1)}% Share
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
