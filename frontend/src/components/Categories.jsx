import Header from "../components/Header";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookie from "js-cookie";

const API_BASE = "http://localhost:8000"; // replace with your backend base URL

export default function Categories() {
  const location = useLocation();
  const categoryName = location.state?.categoryName;

  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch subcategories from backend
  useEffect(() => {
    if (!categoryName) return;
    const userId = Cookie.get("id");

    if(!userId) return;

    const fetchSubcategories = async () => {
      setLoading(true);
      try {
        const response = await axios.post(`${API_BASE}/user/subcategories`, {
          category: categoryName,
          userId: userId,
        });
        // Expected response: { subcategories: [{ name, total }] }
        setSubcategories(response.data.subcategories || []);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubcategories();
  }, [categoryName]);

  return (
    <div className="p-4 bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 min-h-screen">
      <Header title={categoryName || "Select Category"} backPath="/analytics" />

      {loading ? (
        <p className="text-white text-center mt-6">Loading subcategories...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
          {subcategories.length === 0 ? (
            <p className="text-white text-center col-span-full">
              No subcategories found.
            </p>
          ) : (
            subcategories.map((sub, idx) => (
              <div
                key={idx}
                className="flex cursor-pointer flex-col justify-between p-4 rounded-2xl backdrop-blur-md bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-2 border-white/20 hover:scale-105 hover:shadow-lg transition-all duration-300 ease-in-out min-h-[120px]"
              >
                <Link to='/subcategories'>
                <span className="text-white font-semibold text-sm sm:text-base">
                  {sub.name}
                </span>
                <div className="text-right mt-2">
                  <span className="text-white font-bold text-lg">₹{sub.total}</span>
                  <p className="text-white/70 text-xs">View details →</p>
                </div>
                </Link>
              </div>
            ))
          )}
        </div>
      )}

      <div className="mt-8 text-center">
        <div className="inline-flex bg-white/10 backdrop-blur-md rounded-full px-6 py-2 border-2 border-white/20">
          <span className="text-white text-sm">Total Spent: </span>
          <span className="text-white font-bold ml-2">
            ₹{subcategories.reduce((sum, s) => sum + s.total, 0)}
          </span>
        </div>
      </div>
    </div>
  );
}
