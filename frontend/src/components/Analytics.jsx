import Header from "../components/Header";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Calendar, ChevronDown } from "lucide-react";

export default function Analytics() {
  const [topCategories, setTopCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState("all");
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredCount, setFilteredCount] = useState(null);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const location = useLocation();
  const group = location?.state?.group;

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


        if (group && Array.isArray(group.expenses)) {
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
          <p className="text-blue-400 font-bold">₹{data.value.toLocaleString()}</p>
          <p className="text-gray-400 text-sm">
            {((data.value / totalSpending) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header
          title={
            group?.name ? `Analytics — ${group.name}` : "Your Spend Analytics"
          }
          backPath={group ? `/tripDetails/${group._id}` : "/dash"}
        />

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 backdrop-blur-md rounded-2xl p-6 border-2 border-blue-500/30 shadow-2xl">
            <p className="text-blue-300 text-sm font-medium mb-2">
              Total Spending
            </p>
            <p className="text-white text-3xl font-bold">
              ₹{totalSpending.toLocaleString()}
            </p>
          </div>
          <div className="bg-gradient-to-br from-cyan-900/40 to-cyan-800/20 backdrop-blur-md rounded-2xl p-6 border-2 border-cyan-500/30 shadow-2xl">
            <p className="text-cyan-300 text-sm font-medium mb-2">
              Categories
            </p>
            <p className="text-white text-3xl font-bold">
              {topCategories.length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-sky-900/40 to-sky-800/20 backdrop-blur-md rounded-2xl p-6 border-2 border-sky-500/30 shadow-2xl">
            <p className="text-sky-300 text-sm font-medium mb-2">
              Avg per Category
            </p>
            <p className="text-white text-3xl font-bold">
              ₹
              {topCategories.length > 0
                ? Math.round(totalSpending / topCategories.length).toLocaleString()
                : 0}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900/60 to-blue-900/20 backdrop-blur-md rounded-3xl border-2 border-blue-500/30 shadow-2xl p-6 sm:p-8 mb-8">
          {loading ? (
            <div className="h-64 sm:h-96 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                <p className="text-white/80 font-medium">Loading analytics...</p>
              </div>
            </div>
          ) : topCategories.length === 0 ? (
            <div className="h-64 sm:h-96 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar size={40} className="text-blue-400" />
                </div>
                <p className="text-blue-300 font-semibold text-lg">
                  No data available
                </p>
                <p className="text-gray-400 text-sm">
                  {filteredCount === 0 && timeframe !== "all"
                    ? `No expenses recorded for ${
                        timeframe === "day"
                          ? "today"
                          : timeframe === "week"
                          ? "this week"
                          : "this month"
                      }`
                    : "Start tracking your expenses to see analytics"}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-white font-bold text-xl sm:text-2xl text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Spending Distribution
              </h2>
              <div className="h-80 sm:h-96 lg:h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topCategories}
                      dataKey="total"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius="65%"
                      innerRadius="45%"
                      fill="#8884d8"
                      paddingAngle={3}
                      label={({ name, percent, cx, cy, midAngle, outerRadius, innerRadius }) => {
                        const RADIAN = Math.PI / 180;
                        const showName = percent >= 0.08;

                        if (showName) {
                          const radius = outerRadius + 30;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);

                          return (
                            <g>
                              <text
                                x={x}
                                y={y - 8}
                                fill="white"
                                textAnchor={x > cx ? 'start' : 'end'}
                                dominantBaseline="central"
                                className="text-xs sm:text-sm font-bold drop-shadow-lg"
                              >
                                {name.length > 15 ? name.substring(0, 12) + '...' : name}
                              </text>
                              <text
                                x={x}
                                y={y + 8}
                                fill="#60A5FA"
                                textAnchor={x > cx ? 'start' : 'end'}
                                dominantBaseline="central"
                                className="text-xs sm:text-sm font-semibold"
                              >
                                {`${(percent * 100).toFixed(1)}%`}
                              </text>
                            </g>
                          );
                        } else if (percent >= 0.03) {
                          const radius = (innerRadius + outerRadius) / 2;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);

                          return (
                            <text
                              x={x}
                              y={y}
                              fill="white"
                              textAnchor="middle"
                              dominantBaseline="central"
                              className="text-xs font-bold drop-shadow-lg"
                            >
                              {`${(percent * 100).toFixed(0)}%`}
                            </text>
                          );
                        }
                        return null;
                      }}
                    >
                      {topCategories.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          className="hover:opacity-80 transition-opacity duration-300 cursor-pointer"
                          stroke="rgba(15, 23, 42, 0.8)"
                          strokeWidth={3}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {topCategories.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-white font-bold text-lg sm:text-xl mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
              Category Breakdown
            </h3>
            <div className="grid gap-3">
              {topCategories.map((category, index) => {
                const percentage = (category.total / totalSpending) * 100;
                return (
                  <Link
                    key={category.name}
                    to="/subcategories"
                    state={{ category: category.name, group }}
                    className="group relative overflow-hidden bg-gradient-to-r from-gray-900/60 to-blue-900/20 backdrop-blur-md rounded-2xl p-5 border-2 border-blue-500/20 hover:border-blue-400/50 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full shadow-lg"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        ></div>
                        <span className="text-white font-semibold text-base sm:text-lg">
                          {category.name}
                        </span>
                      </div>
                      <span className="text-white font-bold text-lg sm:text-xl">
                        ₹{category.total.toLocaleString()}
                      </span>
                    </div>

                    <div className="relative">
                      <div className="w-full h-2 bg-gray-800/60 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 shadow-lg"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        ></div>
                      </div>
                      <span className="text-blue-300 text-sm font-medium mt-1 block">
                        {percentage.toFixed(1)}% of total spending
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
