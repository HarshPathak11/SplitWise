import Header from "../components/Header";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export default function Analytics() {
  const [topCategories, setTopCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const userId = Cookies.get("id"); // get userId from cookies
    if (!userId) return;

    const fetchTopCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.post(`${API_BASE}/user/top-categories`, { userId });
        if (response.data?.categories) {
          // Expecting backend to return top 4 categories sorted by recent expense
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

      <div className="h-64 flex flex-col items-center justify-center rounded-2xl backdrop-blur-md bg-gradient-to-br from-gray-800/40 to-gray-900/60 border-2 border-white/20 shadow-2xl mt-4 relative overflow-hidden">
        {/* Construction elements */}
        <div className="absolute top-0 left-0 w-full bg-yellow-400/20 py-1 text-center">
          <span className="text-yellow-300 text-sm font-bold uppercase tracking-wider">
            Under Construction
          </span>
        </div>

        <div className="absolute -top-2 -right-2 w-16 h-16 bg-yellow-400/30 rounded-full"></div>
        <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-yellow-400/20 rounded-full"></div>

        {/* Main content */}
        <div className="text-6xl mb-4 animate-pulse">🚧</div>
        <p className="text-white font-bold text-2xl bg-gradient-to-r from-yellow-500/30 to-orange-500/30 px-8 py-4 rounded-2xl backdrop-blur-md border-2 border-yellow-400/40 shadow-lg">
          📊 Analytics Coming Soon
        </p>
        <p className="text-gray-300 mt-3 text-sm max-w-md text-center">
          We're working hard to bring you detailed spending insights and
          visualizations
        </p>
      </div>

      {/* Top Categories */}
      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="text-white text-center font-semibold">Loading...</p>
        ) : topCategories.length === 0 ? (
          <p className="text-red-500 text-center font-semibold">
            No category data found.
          </p>
        ) : (
          topCategories.map((category) => (
            <Link
              key={category.name}
              to="/subcategories"
              state={{ category: category.name }}
              className="flex justify-between items-center p-4 rounded-2xl backdrop-blur-md bg-white/5 border-2 border-white/20 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300"
            >
              <span className="text-white font-medium">{category.name}</span>
              <span className="text-white font-semibold">₹{category.total}</span>
            </Link>
          ))
        )}
      </div>

      {/* <div className="mt-6 text-right">
        <Link
          to="/categories"
          className="text-white bg-gradient-to-r from-indigo-600/30 to-purple-600/30 px-4 py-2 rounded-xl backdrop-blur-md border-2 border-white/30 hover:from-indigo-700/40 hover:to-purple-700/40 transition-all duration-300 inline-block"
        >
          View more →
        </Link>
      </div> */}
    </div>
  );
}
