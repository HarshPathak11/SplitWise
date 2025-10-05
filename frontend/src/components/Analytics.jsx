import Header from "../components/Header";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Analytics() {
  const [topCategories, setTopCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const COLORS = [
    "#4F46E5", // indigo
    "#06B6D4", // cyan
    "#10B981", // green
    "#F59E0B", // amber
    "#EF4444", // red
    "#8B5CF6", // violet
  ];

  useEffect(() => {
    const userId = Cookies.get("id");
    if (!userId) return;

    const fetchTopCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.post(`${API_BASE}/user/top-categories`, {
          userId,
        });
        if (response.data?.categories) {
          setTopCategories(response.data.categories);
        }
      } catch (error) {
        console.error("Error fetching top categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopCategories();
  }, []);

  return (
    <div className="p-4 bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 min-h-screen">
      <Header title="Your Spend Analytics" backPath="/dash" />

      <div className="h-96 flex flex-col items-center justify-center rounded-2xl backdrop-blur-md bg-gradient-to-br from-gray-800/40 to-gray-900/60 border-2 border-white/20 shadow-2xl mt-4 relative overflow-hidden p-4">
        {loading ? (
          <p className="text-white text-center font-semibold">Loading...</p>
        ) : topCategories.length === 0 ? (
          <p className="text-red-500 text-center font-semibold">
            No category data found.
          </p>
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
                <Tooltip
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
                />
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
              state={{ category: category.name }}
              className="flex justify-between items-center p-4 rounded-2xl backdrop-blur-md bg-white/5 border-2 border-white/20 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300"
            >
              <span className="text-white font-medium">{category.name}</span>
              <span className="text-white font-semibold">₹{category.total}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
