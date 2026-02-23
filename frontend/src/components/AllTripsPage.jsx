import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TripCard from "./tripCard";
import Cookies from "js-cookie";
import { ArrowLeft, Search, Map, Layers, Archive, RotateCcw } from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const AllTripsPage = () => {
  const navigate = useNavigate();
  const [activeTrips, setActiveTrips] = useState([]);
  const [archivedTrips, setArchivedTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("active"); // "active" | "archived"
  const [searchQuery, setSearchQuery] = useState("");
  const [unarchivingId, setUnarchivingId] = useState(null);
  const [restoreTargetId, setRestoreTargetId] = useState(null); // trip pending restore confirmation
  const [archiveTargetId, setArchiveTargetId] = useState(null); // trip pending archive confirmation
  const [swipeState, setSwipeState] = useState({}); // { [tripId]: offsetX }
  const swipeRef = useRef({ startX: 0, tripId: null, swiping: false });
  const longPressTimer = useRef(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const userId = Cookies.get("id");
        const currentGroup = localStorage.getItem("currentGroup");
        if (currentGroup) localStorage.removeItem("currentGroup");
        if (!userId) return;

        const [activeRes, archivedRes] = await Promise.all([
          api.get(`${API_BASE}/group/user-groups/${userId}`),
          api.get(`${API_BASE}/group/user-groups/${userId}?archived=true`),
        ]);

        const sort = (arr) =>
          [...arr].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (Array.isArray(activeRes.data)) setActiveTrips(sort(activeRes.data));
        if (Array.isArray(archivedRes.data)) setArchivedTrips(sort(archivedRes.data));
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

  const handleUnarchive = async (tripId) => {
    setRestoreTargetId(null);
    setUnarchivingId(tripId);
    try {
      const userId = Cookies.get("id");
      await api.put(`${API_BASE}/group/unarchive/${tripId}`, { userId: userId });
      // Move from archived → active
      const trip = archivedTrips.find((t) => t._id === tripId);
      setArchivedTrips((prev) => prev.filter((t) => t._id !== tripId));
      if (trip) setActiveTrips((prev) => [trip, ...prev]);
      toast.success("Group unarchived!");
    } catch (err) {
      console.error("Unarchive error:", err);
      toast.error("Failed to unarchive group.");
    } finally {
      setUnarchivingId(null);
    }
  };

  const handleArchive = async (tripId) => {
    setArchiveTargetId(null);
    try {
      const userId = Cookies.get("id");
      await api.put(`${API_BASE}/group/archive/${tripId}`, { userId });
      const trip = activeTrips.find((t) => t._id === tripId);
      setActiveTrips((prev) => prev.filter((t) => t._id !== tripId));
      if (trip) setArchivedTrips((prev) => [trip, ...prev]);
      toast.success("Group archived!");
    } catch (err) {
      console.error("Archive error:", err);
      toast.error("Failed to archive group.");
    }
  };

  // --- Swipe + long-press gesture handlers for mobile ---
  const SWIPE_THRESHOLD = 0.30; // 30% of tile width triggers archive

  const handleTouchStart = useCallback((tripId, e) => {
    const touch = e.touches[0];
    swipeRef.current = { startX: touch.clientX, tripId, swiping: false };
    // Also start long-press timer
    longPressTimer.current = setTimeout(() => {
      if (!swipeRef.current.swiping) setArchiveTargetId(tripId);
    }, 600);
  }, []);

  const handleTouchMove = useCallback((e) => {
    const touch = e.touches[0];
    const dx = touch.clientX - swipeRef.current.startX;
    // If horizontal movement > 10px, treat as swipe (cancel long-press)
    if (Math.abs(dx) > 10) {
      swipeRef.current.swiping = true;
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
      setSwipeState((prev) => ({ ...prev, [swipeRef.current.tripId]: dx }));
    }
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    const { tripId, swiping } = swipeRef.current;
    if (swiping && tripId) {
      const tile = e.currentTarget;
      const tileWidth = tile?.offsetWidth || 300;
      const currentOffset = swipeState[tripId] || 0;
      // Check if swipe exceeded threshold
      if (Math.abs(currentOffset) > tileWidth * SWIPE_THRESHOLD) {
        setArchiveTargetId(tripId);
      }
    }
    // Snap back
    if (tripId) setSwipeState((prev) => ({ ...prev, [tripId]: 0 }));
    swipeRef.current = { startX: 0, tripId: null, swiping: false };
  }, [swipeState]);

  const trips = tab === "active" ? activeTrips : archivedTrips;
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

      {/* --- HEADER --- */}
      <div className="relative z-20 pt-6 px-4 pb-4">
        <div className="max-w-6xl mx-auto">
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

          {/* Title & Search */}
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
              <div className="relative transition-all duration-300">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Filter past journeys..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 bg-zinc-900/40 border border-white/5 rounded-2xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:bg-zinc-900/60 focus:border-indigo-500/50 transition-all shadow-lg"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* --- TABS --- */}
          <div className="flex items-center gap-1 mt-5 bg-zinc-900/50 rounded-xl p-1 w-fit border border-white/5">
            <button
              onClick={() => setTab("active")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === "active"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Active
              {activeTrips.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${tab === "active" ? "bg-white/20" : "bg-zinc-800 text-zinc-400"}`}>
                  {activeTrips.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab("archived")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === "archived"
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-900/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              Archived
              {archivedTrips.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${tab === "archived" ? "bg-white/20" : "bg-zinc-800 text-zinc-400"}`}>
                  {archivedTrips.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-4 pb-20 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-70">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-zinc-800 rounded-full"></div>
              <div className="w-12 h-12 border-4 border-indigo-500 rounded-full animate-spin border-t-transparent absolute inset-0"></div>
            </div>
            <p className="mt-4 text-[10px] font-bold tracking-widest text-zinc-500 uppercase animate-pulse">
              Syncing Itineraries...
            </p>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-white/5 rounded-3xl bg-zinc-900/20 mt-4 mx-auto max-w-2xl">
            <div className="w-20 h-20 bg-zinc-900/80 rounded-2xl flex items-center justify-center border border-white/10 mb-6 shadow-xl rotate-3">
              {tab === "archived" ? (
                <Archive className="w-10 h-10 text-zinc-600" />
              ) : (
                <Layers className="w-10 h-10 text-zinc-600" />
              )}
            </div>
            <h3 className="text-white font-bold text-xl mb-2">
              {tab === "archived" ? "No Archived Trips" : "No Adventures Yet"}
            </h3>
            <p className="text-zinc-500 text-sm max-w-xs mb-8">
              {searchQuery
                ? "We couldn't find any trips matching your search."
                : tab === "archived"
                ? "Groups you archive will appear here."
                : "You haven't created or joined any trips yet."}
            </p>
            {!searchQuery && tab === "active" && (
              <button
                onClick={() => navigate("/addTrip")}
                className="px-6 py-2.5 rounded-xl bg-zinc-800 text-indigo-400 border border-indigo-900/30 font-semibold text-sm hover:bg-zinc-700 hover:text-indigo-300 transition-all"
              >
                Start Planning
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredTrips.map((trip) => (
              <div
                key={trip._id}
                className="flex flex-col gap-1"
                {...(tab === "active" ? {
                  onDoubleClick: (e) => { e.preventDefault(); setArchiveTargetId(trip._id); },
                } : {})}
              >
                {/* Swipe wrapper — active tab only */}
                <div className="relative overflow-hidden rounded-xl">
                  {/* Reveal background behind the tile — only visible during swipe */}
                  {tab === "active" && (swipeState[trip._id] || 0) !== 0 && (
                    <div className="absolute inset-0 flex items-center justify-between px-6 bg-amber-600/20 rounded-xl">
                      <div className={`flex items-center gap-2 transition-opacity ${(swipeState[trip._id] || 0) > 0 ? 'opacity-100' : 'opacity-0'}`}>
                        <Archive className="w-5 h-5 text-amber-400" />
                        <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">Archive</span>
                      </div>
                      <div className={`flex items-center gap-2 transition-opacity ${(swipeState[trip._id] || 0) < 0 ? 'opacity-100' : 'opacity-0'}`}>
                        <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">Archive</span>
                        <Archive className="w-5 h-5 text-amber-400" />
                      </div>
                    </div>
                  )}
                  <div
                    style={{
                      transform: `translateX(${swipeState[trip._id] || 0}px)`,
                      transition: swipeRef.current.swiping && swipeRef.current.tripId === trip._id
                        ? 'none'
                        : 'transform 0.3s ease-out',
                    }}
                    {...(tab === "active" ? {
                      onTouchStart: (e) => handleTouchStart(trip._id, e),
                      onTouchMove: handleTouchMove,
                      onTouchEnd: handleTouchEnd,
                    } : {})}
                    className="relative transform hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
                  >
                    <TripCard
                      amount={trip.tripTotal}
                      trip={trip}
                      onClick={() => {
                        if (!swipeRef.current.swiping) handleTripClick(trip);
                      }}
                    />
                  </div>
                </div>
                {/* Restore button — only visible in archived tab */}
                {tab === "archived" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setRestoreTargetId(trip._id); }}
                    disabled={unarchivingId === trip._id}
                    title="Unarchive group"
                    className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-amber-600/10 hover:bg-amber-600/20 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wide transition-all disabled:opacity-50"
                  >
                    <RotateCcw className="w-3 h-3" />
                    {unarchivingId === trip._id ? "Restoring..." : "Restore Group"}
                  </button>
                )}
              </div>
            ))}

            {/* End of List */}
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

      <style>{`
      .custom-scrollbar::-webkit-scrollbar { width: 6px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>

      {/* --- RESTORE CONFIRMATION MODAL --- */}
      {restoreTargetId && (() => {
        const trip = archivedTrips.find((t) => t._id === restoreTargetId);
        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-emerald-500/30 p-6 rounded-2xl max-w-sm w-full shadow-2xl shadow-emerald-900/10">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                <RotateCcw className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Restore this group?</h3>
              <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                <span className="text-zinc-200 font-semibold">{trip?.name}</span> will be moved back to your active trips list.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setRestoreTargetId(null)}
                  className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 font-medium hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUnarchive(restoreTargetId)}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-900/20 transition-all"
                >
                  Restore
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* --- ARCHIVE CONFIRMATION MODAL --- */}
      {archiveTargetId && (() => {
        const trip = activeTrips.find((t) => t._id === archiveTargetId);
        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-amber-500/30 p-6 rounded-2xl max-w-sm w-full shadow-2xl shadow-amber-900/10">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                <Archive className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Archive this group?</h3>
              <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                <span className="text-zinc-200 font-semibold">{trip?.name}</span> will be moved to your archived trips. You can restore it anytime.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setArchiveTargetId(null)}
                  className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 font-medium hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleArchive(archiveTargetId)}
                  className="flex-1 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg shadow-amber-900/20 transition-all"
                >
                  Archive
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default AllTripsPage;
