import Header from "../components/Header";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  PieChart,
  Pie,
  Cell,
  // Tooltip,
  // Legend,
  ResponsiveContainer,
} from "recharts";

export default function Analytics() {
  const [topCategories, setTopCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState("all"); // 'day' | 'week' | 'month' | 'all' (default all time)
  const [filteredCount, setFilteredCount] = useState(null);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const location = useLocation();
  const group = location?.state?.group;

  const COLORS = [
    "#4F46E5", // indigo
    "#06B6D4", // cyan
    "#10B981", // green
    "#F59E0B", // amber
    "#EF4444", // red
    "#8B5CF6", // violet
  ];

  useEffect(() => {
    const fetchTopCategories = async () => {
      try {
        setLoading(true);
        // If a group object is provided via navigation state, derive categories from group.expenses
        if (group && Array.isArray(group.expenses)) {
          // compute timeframe start
          // const now = new Date();
          // let startDate = null;
          // if (timeframe === "day") {
          //   startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          // } else if (timeframe === "week") {
          //   startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          // } else {
          //   // month -> start of current month
          //   startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          // }

          // const filtered = group.expenses.filter((exp) => {
          //   try {
          //     const d = new Date(exp.createdAt || exp.updatedAt || exp.date);
          //     return d >= startDate;
          //   } catch (e) {
          //     return false;
          //   }
          // });

          // track filtered count for message rendering
        //   setFilteredCount(filtered.length);

        //   const map = {};
        //   filtered.forEach((exp) => {
        //     const name =
        //       exp.category && exp.category !== "null"
        //         ? exp.category
        //         : exp.subcategory && exp.subcategory !== "null"
        //         ? exp.subcategory
        //         : exp.title || "Uncategorized";
        //     const amount = Number(exp.amount) || 0;
        //     map[name] = (map[name] || 0) + amount;
        //   });
        //   const categories = Object.keys(map).map((name) => ({
        //     name,
        //     total: map[name],
        //   }));
        //   categories.sort((a, b) => b.total - a.total);
        //   setTopCategories(categories);
        //   return;

          // fetch from backend for group top categories
          const response = await axios.get(
            `${API_BASE}/group/${group._id}/top-categories`
          );
          if (response.data?.categories) {
            // console.log("Group top categories:", response.data.categories);
            setTopCategories(response.data.categories);
          }

        return;

        }

        // Fallback to user-level top categories
        const userId = Cookies.get("id");
        if (!userId) return;

        const response = await axios.post(`${API_BASE}/user/top-categories`, {
          userId,
        });
        if (response.data?.categories) {
          setTopCategories(response.data.categories);
        }
        // no group -> clear filteredCount so we don't show timeframe-specific messages
        setFilteredCount(null);
      } catch (error) {
        console.error("Error fetching top categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopCategories();
  }, [group, timeframe]);

  return (
    <div className="p-4 bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 min-h-screen">
      <Header
        title={
          group?.name ? `Analytics — ${group.name}` : "Your Spend Analytics"
        }
        backPath={group ? `/tripDetails/${group._id}` : "/dash"}
      />

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-3">
          <div className="text-white/80 text-sm">View:</div>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-gray-800 text-white px-3 py-2 rounded-md border border-white/20"
          >
            <option value="all">All Time</option>
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      <div className="h-96 flex flex-col items-center justify-center rounded-2xl backdrop-blur-md bg-gradient-to-br from-gray-800/40 to-gray-900/60 border-2 border-white/20 shadow-2xl mt-4 relative overflow-hidden p-4">
        {loading ? (
          <p className="text-white text-center font-semibold">Loading...</p>
        ) : topCategories.length === 0 ? (
          filteredCount === 0 && timeframe !== "all" ? (
            <p className="text-red-500 text-center font-semibold">
              {timeframe === "day"
                ? "No expenses in the past day"
                : timeframe === "week"
                ? "No expenses in the past week"
                : "No expenses in the past month"}
            </p>
          ) : (
            <p className="text-red-500 text-center font-semibold">
              No category data found.
            </p>
          )
        ) : (
          <>
            <h2 className="text-white font-bold text-lg mb-4">
              Spending Distribution by Category
            </h2>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topCategories}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(1)}%`
                  }
                >
                  {topCategories.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                {/* <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "0.5rem",
                    color: "white",
                  }}
                />
                <Legend
                  wrapperStyle={{ color: "white" }}
                  verticalAlign="bottom"
                  height={36}
                /> */}
              </PieChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* Category List */}
      {topCategories.length > 0 && (
        <div className="mt-6 space-y-3">
          {topCategories.map((category) => (
            <Link
              key={category.name}
              to="/subcategories"
              state={{ category: category.name, group }}
              className="flex justify-between items-center p-4 rounded-2xl backdrop-blur-md bg-white/5 border-2 border-white/20 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300"
            >
              <span className="text-white font-medium">{category.name}</span>
              <span className="text-white font-semibold">
                ₹{category.total}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
