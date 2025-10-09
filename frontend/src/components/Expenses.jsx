import Header from "../components/Header";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookie from "js-cookie";

export default function Expenses() {
  const location = useLocation();
  const { category, subcategory, total } = location.state || {};
  const userId = Cookie.get("id");
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const group = location?.state?.group;

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 Search term state

  // Fetch expenses from backend
  useEffect(() => {
    if (!userId) return;

    const fetchExpenses = async () => {
      setLoading(true);
      try {
        if (group && Array.isArray(group.expenses)) {
          // console.log("Group object found in state, deriving subcategories from group.expenses");
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
          const response = await axios.post(
            `${API_BASE}/group/expenses-by-subcategory`,
            { category: category, groupId: group._id, subcategory: subcategory }
          );
          if (response.data?.expenses) {
            // console.log("Group sub categories:", response.data.expenses);
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
  }, [userId, category, subcategory, API_BASE]);

  // Filter expenses based on search term
  const filteredExpenses = expenses.filter((exp) =>
    exp.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="p-4 bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 min-h-screen">
      <Header title={`${subcategory || "Expenses"}`} backPath="/categories" />

      <div className="ml-10 mr-10 sm:ml-20 sm:mr-20">
        {/* Search Bar */}
        <div className="mt-6 mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // 🔍 Update state as user types
              className="w-full p-3 sm:p-4 rounded-2xl backdrop-blur-md bg-white/10 border-2 border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
            />
          </div>
        </div>

        {/* Total Expenses */}
        <div className="mt-6 p-3 sm:p-4 rounded-2xl backdrop-blur-md bg-white/10 border-2 border-white/20">
          <div className="flex justify-between items-center text-white">
            <span className="font-semibold">Total Expenses:</span>
            <span className="font-bold text-lg">₹{total}</span>
          </div>
        </div>

        {/* Expenses List */}
        <div className="space-y-3 mt-4">
          {loading ? (
            <p className="text-white text-center mt-4">Loading expenses...</p>
          ) : filteredExpenses.length === 0 ? (
            <p className="text-white text-center mt-4">No expenses found.</p>
          ) : (
            filteredExpenses.map((exp) => (
              <div
                key={exp._id}
                className={`flex justify-between items-center p-3 sm:p-4 rounded-xl sm:rounded-2xl backdrop-blur-md bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-white/20 hover:scale-[1.02] transition-all duration-300 cursor-pointer`}
                onClick={() => console.log("Expense clicked:", exp.title)}
              >
                <div className="flex flex-col">
                  <span className="text-white font-medium text-sm sm:text-base">
                    {exp.title}
                  </span>
                  <span className="text-white/70 text-xs mt-1">
                    {new Date(exp.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span className="text-white font-bold text-base sm:text-lg">
                  ₹{exp.amount}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
