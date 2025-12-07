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
    <div className="relative bg-slate-950 min-h-screen flex flex-col font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      {/* --- ATMOSPHERIC BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      {/* --- HEADER SECTION --- */}
      <div className="relative z-20 px-6 pt-6 pb-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Back Button */}
          <button
            onClick={() => navigate("/dash")}
            className="group flex items-center justify-center w-12 h-12 rounded-full bg-slate-900/50 backdrop-blur-md border border-white/10 text-slate-400 hover:text-white hover:border-white/30 transition-all duration-300 shadow-xl"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>

          {/* Optional: User Avatar or Logo could go here on the right */}
        </div>

        <div className="max-w-2xl mx-auto mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-4">
            <Map className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
              Travel History
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            Trips &{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
              Events
            </span>
          </h1>

          <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
            Manage your shared adventures. Track expenses, settle balances, and
            keep the memories.
          </p>
        </div>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="relative z-20 px-4 mt-8 mb-6">
        <div className="max-w-xl mx-auto group">
          <div className="relative transition-all duration-300 transform group-focus-within:-translate-y-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search past journeys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-12 pr-4 py-4 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all shadow-lg hover:bg-slate-800/60"
            />
          </div>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="relative z-10 flex-1 w-full max-w-3xl mx-auto px-4 pb-20 overflow-y-auto custom-scrollbar">
        {loading ? (
          // Premium Loading State
          <div className="flex flex-col items-center justify-center py-20 opacity-70">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-slate-800 rounded-full"></div>
              <div className="w-12 h-12 border-4 border-cyan-500 rounded-full animate-spin border-t-transparent absolute inset-0"></div>
            </div>
            <p className="mt-4 text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase animate-pulse">
              Syncing Itineraries...
            </p>
          </div>
        ) : trips.length === 0 ? (
          // Premium Empty State
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-slate-900/50 rounded-3xl flex items-center justify-center border border-white/5 mb-6 rotate-3">
              <Layers className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">
              No Adventures Yet
            </h3>
            <p className="text-slate-500 text-sm max-w-xs mb-8">
              {searchQuery
                ? "We couldn't find any trips matching your search."
                : "You haven't created or joined any trips yet."}
            </p>
            {!searchQuery && (
              <button
                onClick={() => navigate("/create-trip")} // Assuming you have this route
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-cyan-500/20 transition-all active:scale-95"
              >
                Plan a New Trip
              </button>
            )}
          </div>
        ) : (
          // Grid Layout
          <div className="grid gap-4 sm:gap-6 pb-10">
            {filteredTrips.map((trip) => (
              // We wrap the TripCard to ensure it sits in the layout correctly
              // The TripCard itself should ideally have a dark/glass background to match
              <div
                key={trip._id}
                className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-900/10"
              >
                <TripCard
                  amount={trip.tripTotal}
                  trip={trip}
                  onClick={() => handleTripClick(trip)}
                />
              </div>
            ))}

            {/* Footer Text */}
            <div className="text-center mt-8 opacity-30">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white">
                End of List
              </p>
            </div>
          </div>
        )}
      </div>

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
