import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaTrash } from "react-icons/fa"; // Import the trash icon
import toast from "react-hot-toast";
const API_BASE = import.meta.env.VITE_API_BASE_URL;
import { FaBell } from "react-icons/fa";
import Cookies from "js-cookie";
import {
  ArrowLeft,
  Search,
  UserPlus,
  Bell,
  X,
  Check,
  Trash2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import api from "../utils/api";
const AddFriend = () => {
  const navigate = useNavigate();

  const [friends, setFriends] = useState([]); // { email, name? }
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Debounce + suggestions
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]); // [{ _id, username, email }]
  const [isSearching, setIsSearching] = useState(false);
  const controllerRef = useRef(null);

  const userId = Cookies.get("id");

  const fetchRequests = async () => {
    try {
      if (!userId) return;
      const res = await api.get(`${API_BASE}/user/friend-requests/${userId}`);
      setRequests(res.data || []);
    } catch (e) {
      // console.error(e);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [userId]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const respond = async (fromUserId, action) => {
    try {
      await api.post(`${API_BASE}/user/friend-requests/respond`, {
        userId,
        fromUserId,
        action,
      });
      await fetchRequests();
      toast.success(
        action === "approve"
          ? "Friend request accepted"
          : "Friend request denied"
      );
    } catch (e) {
      // console.error(e);
    }
  };

  // Debounce the search value
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(search.trim());
    }, 300); // 300ms debounce
    return () => clearTimeout(t);
  }, [search]);

  // Fetch suggestions when debouncedQuery changes
  useEffect(() => {
    if (!debouncedQuery) {
      setSuggestions([]);
      setIsSearching(false);
      // abort any inflight request
      if (controllerRef.current) {
        controllerRef.current.abort();
        controllerRef.current = null;
      }
      return;
    }

    // Cancel previous request if any
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    const controller = new AbortController();
    controllerRef.current = controller;

    const fetchSuggestions = async () => {
      setIsSearching(true);
      try {
        // replace with your real backend endpoint if different
        const url = `${API_BASE}/user/search?username=${encodeURIComponent(
          debouncedQuery
        )}`;

        const res = await api.get(url, { signal: controller.signal });

        // support either { users: [...] } or just [...]
        const users = res.data?.users ?? res.data ?? [];
        // Limit suggestions, map to expected shape
        const mapped = (users || [])
          .filter((u) => u._id !== userId) // exclude self
          .slice(0, 8)
          .map((u) => ({
            _id: u._id,
            username: u.username,
            email: u.email,
            profilePhotoUrl: u.profilePhotoUrl || "/userIcon.png", // fallback if no photo
          }));

        setSuggestions(mapped);
      } catch (err) {
        if (axios.isCancel(err) || err.name === "CanceledError") {
          // request was aborted — ignore
        } else {
          console.error("Error fetching suggestions:", err);
        }
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    };

    fetchSuggestions();

    return () => {
      // cleanup: abort when effect re-runs or component unmounts
      controller.abort();
      controllerRef.current = null;
    };
  }, [debouncedQuery]);

  const handleSuggestionClick = (userObj) => {
    // userObj: { _id, username, email }
    if (!userObj?.email) {
      toast.error("Selected user has no email associated.");
      return;
    }

    if (friends.some((f) => f.email === userObj.email)) {
      toast.error("This friend is already added.");
      // clear input & suggestions optionally
      setSearch("");
      setSuggestions([]);
      return;
    }

    setFriends((prev) => [
      ...prev,
      {
        email: userObj.email,
        name: userObj.username,
        profilePhotoUrl: userObj.profilePhotoUrl,
      },
    ]);
    // Clear search and suggestions after selection
    setSearch("");
    setDebouncedQuery("");
    setSuggestions([]);
  };

  const handleDeleteFriend = (index) => {
    const updatedFriends = friends.filter((_, i) => i !== index);
    setFriends(updatedFriends);
  };

  const handleDone = async () => {
    if (!userId) {
      toast.error("User not loaded. Please wait a moment.");
      return;
    }

    if (friends.length === 0) {
      toast.error("Please add at least one friend before proceeding.");
      return;
    }
    try {
      setLoading(true);

      const response = await api.post(
        `${API_BASE}/user/friend-requests/send`,
        {
          fromUserId: userId,
          toEmail: friends.map((f) => f.email),
        }
      );

      if (response.status === 200) {
        const results = response.data.results || [];

        results.map((r) => {
          r.reason ? toast.success(`(${r.reason})`) : "";
        });

        // ✅ Clear the list after successful attempt
        setFriends([]);
      } else {
        toast.error(`Failed to add friends: ${response.data.message}`);
      }
    } catch (err) {
      console.error("Error sending friend requests:", err);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-slate-950 min-h-screen flex items-center justify-center font-sans selection:bg-cyan-500/30 overflow-hidden p-4">
      {/* --- ATMOSPHERIC BACKGROUND --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      {/* --- TOP NAVIGATION BAR --- */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-50">
        {/* Back Button */}
        <button
          onClick={() => navigate("/dash")}
          className="group flex items-center justify-center w-12 h-12 rounded-full bg-slate-900/50 backdrop-blur-md border border-white/10 text-slate-400 hover:text-white hover:border-white/30 transition-all duration-300 shadow-xl"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </button>

        {/* Notifications / Friend Requests */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className={`group flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-md border transition-all duration-300 shadow-xl ${
              open || requests.length > 0
                ? "bg-slate-800 border-cyan-500/50 text-cyan-400"
                : "bg-slate-900/50 border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            <Bell
              className={`w-5 h-5 ${
                requests.length > 0 ? "animate-swing" : ""
              }`}
            />
            {requests.length > 0 && (
              <span className="absolute top-0 right-0 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            )}
          </button>

          {/* Requests Dropdown Panel */}
          {open && (
            <div className="absolute right-0 mt-3 w-80 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-down origin-top-right ring-1 ring-black/5">
              <div className="px-4 py-3 border-b border-white/5 bg-white/5 flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Incoming Requests
                </span>
                <span className="text-xs font-mono text-cyan-500">
                  {requests.length}
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                {requests.length === 0 ? (
                  <div className="py-8 text-center px-6">
                    <div className="mx-auto w-10 h-10 mb-3 bg-slate-800/50 rounded-full flex items-center justify-center">
                      <Bell className="w-4 h-4 text-slate-600" />
                    </div>
                    <p className="text-slate-400 text-sm">All caught up!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {requests.map((req) => (
                      <div
                        key={req._id || req.from?._id}
                        className="p-4 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                            {req.from?.username?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-white truncate">
                              {req.from?.username}
                            </h4>
                            <p className="text-xs text-slate-400 truncate">
                              {req.from?.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => respond(req.from?._id, "approve")}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                          >
                            <Check className="w-3 h-3" /> Accept
                          </button>
                          <button
                            onClick={() => respond(req.from?._id, "deny")}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 border border-red-500/20 transition-all"
                          >
                            <X className="w-3 h-3" /> Ignore
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- MAIN INTERFACE --- */}
      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center">
            <div className="inline-flex items-center justify-center gap-2 mb-4 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                Invite Members
              </span>
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Build Your Squad
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Search for friends to start splitting expenses.
            </p>
          </div>

          {/* Search Section */}
          <div className="px-6 sm:px-8 relative z-30">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative flex items-center bg-slate-950 border border-white/10 rounded-xl px-4 py-3 shadow-inner focus-within:border-cyan-500/50 transition-colors">
                <Search className="w-5 h-5 text-slate-500 mr-3" />
                <input
                  type="text"
                  placeholder="Search by username..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-slate-600 focus:outline-none text-sm"
                  autoComplete="off"
                />
                {isSearching && (
                  <div className="w-4 h-4 border-2 border-slate-600 border-t-cyan-500 rounded-full animate-spin"></div>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {(suggestions.length > 0 ||
                (isSearching && search.length > 0)) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar ring-1 ring-black/20">
                  {suggestions.map((s) => (
                    <div
                      key={s._id}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSuggestionClick(s)}
                      className="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-center gap-3 transition-colors group/item"
                    >
                      <img
                        src={s.profilePhotoUrl}
                        alt={s.username}
                        className="w-10 h-10 rounded-full object-cover border border-white/10 group-hover/item:border-cyan-500/50 transition-colors"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">
                            {s.username}
                          </span>
                          <ShieldCheck className="w-3 h-3 text-cyan-500" />
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          {s.email}
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center group-hover/item:bg-cyan-500 group-hover/item:border-cyan-500 transition-all">
                        <UserPlus className="w-3 h-3 text-slate-400 group-hover/item:text-white" />
                      </div>
                    </div>
                  ))}
                  {suggestions.length === 0 && !isSearching && (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No users found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Selected Friends List */}
          <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 custom-scrollbar">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Selected ({friends.length})
              </span>
              {friends.length > 0 && (
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Ready to Add
                </span>
              )}
            </div>

            {friends.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl bg-white/5">
                <Sparkles className="w-6 h-6 text-slate-600 mb-2 opacity-50" />
                <p className="text-xs text-slate-500">
                  No friends selected yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {friends.map((friend, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-white/5 group hover:border-white/10 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <img
                          src={friend.profilePhotoUrl}
                          alt={friend.username}
                          className="w-10 h-10 rounded-full object-cover border border-white/10"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 border-2 border-slate-900">
                          <Check className="w-2 h-2 text-black" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-white truncate">
                          {friend.name ?? friend.username}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {friend.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteFriend(index)}
                      className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer / Action */}
          <div className="p-6 sm:p-8 pt-4 bg-slate-950/30 border-t border-white/5">
            <button
              onClick={handleDone}
              disabled={friends.length === 0 || loading}
              className={`w-full py-4 rounded-xl font-bold tracking-widest uppercase text-xs transition-all duration-300 shadow-lg ${
                friends.length === 0
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5"
                  : "bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-cyan-500/20 active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Updating List...
                </span>
              ) : (
                "Confirm Selection"
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .animate-swing { animation: swing 2s infinite; transform-origin: top center; }
        @keyframes swing { 20% { transform: rotate(15deg); } 40% { transform: rotate(-10deg); } 60% { transform: rotate(5deg); } 80% { transform: rotate(-5deg); } 100% { transform: rotate(0deg); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
      `}</style>
    </div>
  );
};

export default AddFriend;
