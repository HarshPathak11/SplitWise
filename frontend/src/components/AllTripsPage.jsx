import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TripCard from "./tripCard"; // Ensure this component is styled properly
import Cookies from "js-cookie"; // Import Cookies library
import axios from "axios";
import { ArrowLeft, Search, Map, Layers } from "lucide-react";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const AllTripsPage = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // 🔍 Search query state

  // Fetch trips for the current user
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const userId = Cookies.get("id"); // user ID stored in cookies as "id"
        const currentGroup = localStorage.getItem("currentGroup");
        if (currentGroup) localStorage.removeItem("currentGroup"); // Clear current group from local storage

        if (!userId) {
          console.error("User ID not found in cookies.");
          return;
        }

        const response = await axios.get(
          `${API_BASE}/group/user-groups/${userId}`
        );

        if (Array.isArray(response.data)) {
          // Sort expenses by createdAt in descending order (most recent first)
          const sortedTrips = [...response.data].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setTrips(sortedTrips);
        }
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const handleTripClick = (trip) => {
    navigate(`/tripDetails/${trip._id}`);
  };

  // Filtered trips based on search
  const filteredTrips = trips.filter((trip) =>
    trip.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative bg-zinc-950 min-h-screen flex flex-col font-sans selection:bg-indigo-500/30 overflow-x-hidden text-zinc-100">
      {/* --- BACKGROUND FX --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[20%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-fuchsia-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      {/* --- DASHBOARD HEADER --- */}
      <div className="relative z-20 pt-6 px-4 pb-4">
        <div className="max-w-6xl mx-auto">
          {/* Top Controls */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate("/dash")}
              className="group flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 backdrop-blur-md transition-all duration-300 active:scale-95 shadow-lg"
            >
              <ArrowLeft className="w-4 h-4 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
              <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-200">
                Dashboard
              </span>
            </button>
          </div>

          {/* Title & Search Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
            <div>
              <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 mb-3">
                <Map className="w-3 h-3 text-indigo-400" />
                <span className="text-[10px] font-bold tracking-widest text-indigo-300 uppercase">
                  Travel History
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Trips &{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">
                  Events
                </span>
              </h1>
            </div>

            {/* Search Bar */}
            <div className="w-full md:w-72 group">
              <div className="relative transition-all duration-300 transform group-focus-within:-translate-y-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Filter past journeys..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-2xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:bg-zinc-900/60 focus:border-indigo-500/50 transition-all shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-4 pb-20 overflow-y-auto custom-scrollbar">
        {loading ? (
          // Loading State
          <div className="flex flex-col items-center justify-center py-32 opacity-70">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-zinc-800 rounded-full"></div>
              <div className="w-12 h-12 border-4 border-indigo-500 rounded-full animate-spin border-t-transparent absolute inset-0"></div>
            </div>
            <p className="mt-4 text-[10px] font-bold tracking-widest text-zinc-500 uppercase animate-pulse">
              Syncing Itineraries...
            </p>
          </div>
        ) : trips.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-white/5 rounded-3xl bg-zinc-900/20 mt-4 mx-auto max-w-2xl">
            <div className="w-20 h-20 bg-zinc-900/80 rounded-2xl flex items-center justify-center border border-white/10 mb-6 shadow-xl rotate-3">
              <Layers className="w-10 h-10 text-zinc-600" />
            </div>
            <h3 className="text-white font-bold text-xl mb-2">
              No Adventures Yet
            </h3>
            <p className="text-zinc-500 text-sm max-w-xs mb-8">
              {searchQuery
                ? "We couldn't find any trips matching your search."
                : "You haven't created or joined any trips yet."}
            </p>
            {!searchQuery && (
              <button
                onClick={() => navigate("/create-trip")}
                className="px-6 py-2.5 rounded-xl bg-zinc-800 text-indigo-400 border border-indigo-900/30 font-semibold text-sm hover:bg-zinc-700 hover:text-indigo-300 transition-all"
              >
                Start Planning
              </button>
            )}
          </div>
        ) : (
          // Grid Layout for TripCards
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredTrips.map((trip) => (
              <div
                key={trip._id}
                className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10"
              >
                <TripCard
                  amount={trip.tripTotal}
                  trip={trip}
                  onClick={() => handleTripClick(trip)}
                />
              </div>
            ))}

            {/* End of List Indicator */}
            <div className="col-span-full text-center mt-12 opacity-30">
              <div className="flex items-center justify-center gap-4">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-zinc-600"></div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                  End of List
                </p>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-zinc-600"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scrollbar Styles */}
      <style>{`
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.2);
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    `}</style>
    </div>
  );
};

export default AllTripsPage;
