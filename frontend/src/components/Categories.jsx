import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookie from "js-cookie";
import { Package, TrendingUp, Layers } from "lucide-react";
import api from "../utils/api";

const handleScrollTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
};

const API_BASE = "http://localhost:8000"; // replace with your backend base URL

export default function Categories() {
  const location = useLocation();
  const categoryName = location.state?.categoryName;

  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleScrollTop();
  }, []);

  // Fetch subcategories from backend
  useEffect(() => {
    if (!categoryName) return;
    const userId = Cookie.get("id");

    if (!userId) return;

    const fetchSubcategories = async () => {
      setLoading(true);
      try {
        const response = await api.post(`${API_BASE}/user/subcategories`, {
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans relative overflow-hidden p-4 sm:p-6 lg:p-8">
      {/* --- BACKGROUND FX --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[10%] left-[30%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col min-h-[calc(100vh-4rem)]">
        {/* Header Component */}
        <div className="mb-8">
          <Header
            title={categoryName || "Sector Analysis"}
            backPath="/analytics"
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-grow">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-2 border-zinc-800 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="text-zinc-500 font-mono text-xs animate-pulse tracking-widest">
                LOADING DATA STREAMS...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {subcategories.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-3xl bg-zinc-900/20">
                  <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
                    <Package size={32} className="text-zinc-600" />
                  </div>
                  <p className="text-zinc-400 font-mono text-sm uppercase tracking-wider">
                    No active sub-sectors found.
                  </p>
                </div>
              ) : (
                subcategories.map((sub, idx) => (
                  <div
                    key={idx}
                    className="group relative flex flex-col justify-between p-1 rounded-2xl transition-all duration-300 ease-out hover:-translate-y-1"
                  >
                    {/* Gradient Border Effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute inset-[1px] bg-zinc-900 rounded-2xl z-0"></div>

                    {/* Card Content */}
                    <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                      <Link to="/subcategories" className="block h-full">
                        <div className="flex items-start justify-between mb-6">
                          <span className="text-zinc-100 font-bold text-lg leading-tight group-hover:text-indigo-300 transition-colors">
                            {sub.name}
                          </span>
                          <div className="p-2 rounded-lg bg-zinc-800/50 text-zinc-500 group-hover:text-white group-hover:bg-indigo-500/20 transition-all">
                            <Layers size={16} />
                          </div>
                        </div>

                        <div className="mt-auto">
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-1">
                                Volume
                              </p>
                              <span className="text-white font-black text-2xl font-mono block">
                                ₹{sub.total.toLocaleString()}
                              </span>
                            </div>
                            <div className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                              <span className="text-indigo-400 text-xs font-bold uppercase">
                                View →
                              </span>
                            </div>
                          </div>

                          {/* Decorative Progress Line */}
                          <div className="w-full h-1 bg-zinc-800 rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-indigo-500 w-1/3 group-hover:w-full transition-all duration-700 ease-out"></div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* --- TOTAL STATS HUD (Floating Bottom) --- */}
        <div className="mt-8 flex justify-center sticky bottom-6 z-20">
          <div className="flex items-center gap-4 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:border-indigo-500/50 transition-colors group">
            <div className="p-2 bg-indigo-500/10 rounded-full text-indigo-400">
              <TrendingUp size={18} />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
              <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">
                Total Sector Output
              </span>
              <span className="text-white font-black text-xl font-mono group-hover:text-indigo-300 transition-colors">
                ₹
                {subcategories
                  .reduce((sum, s) => sum + s.total, 0)
                  .toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
