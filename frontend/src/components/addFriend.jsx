import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaTrash } from "react-icons/fa"; // Import the trash icon
import toast from "react-hot-toast";
const API_BASE = import.meta.env.VITE_API_BASE_URL;
import { FaBell } from "react-icons/fa";
import Cookies from "js-cookie";

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
      const res = await axios.get(`${API_BASE}/user/friend-requests/${userId}`);
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
      await axios.post(`${API_BASE}/user/friend-requests/respond`, {
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

        const res = await axios.get(url, { signal: controller.signal });

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
      { email: userObj.email, name: userObj.username, profilePhotoUrl: userObj.profilePhotoUrl },
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

      const response = await axios.post(
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
    <div className="relative bg-[#000000] flex items-center justify-center min-h-screen overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="w-[500px] h-[500px] bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-30 animate-move"></div>
        <div className="w-[400px] h-[400px] bg-gradient-to-r from-blue-500 to-green-500 rounded-full blur-3xl opacity-30 animate-rotate delay-2000"></div>
        <div className="w-[600px] h-[600px] bg-gradient-to-r from-yellow-500 to-red-500 rounded-full blur-3xl opacity-30 animate-move delay-4000"></div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-lg opacity-50 animate-bounce"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full blur-lg opacity-50 animate-bounce delay-3000"></div>
      </div>
      {/* Back to Dashboard Button + Friend Requests Icon */}
      <div className="absolute top-4 left-4">
        <button
          onClick={() => navigate("/dash")}
          className="p-2 rounded-full shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-110 transition-transform duration-300 ease-in-out"
          title="Back to Dashboard"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 sm:h-6 sm:w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      <div className="absolute top-4 right-4" ref={dropdownRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="p-2 rounded-full shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-105 transition-transform duration-300 ease-in-out relative"
          title="Friend Requests"
        >
          <FaBell className="text-white text-xl" />
          {requests.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
              {requests.length}
            </span>
          )}
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-72 bg-gray-800/90 border border-gray-700/60 rounded-lg shadow-lg z-50 p-2 max-h-80 overflow-auto">
            {requests.length === 0 ? (
              <div className="text-gray-300 text-sm p-3">
                No pending requests
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req._id || req.from?._id}
                  className="flex items-center justify-between p-2 rounded hover:bg-white/10"
                >
                  <div>
                    <div className="text-white text-sm font-semibold">
                      {req.from?.username || "Unknown"}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {req.from?.email}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => respond(req.from?._id, "approve")}
                      className="px-2 py-1 text-xs rounded bg-green-500 hover:bg-green-600 text-white"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => respond(req.from?._id, "deny")}
                      className="px-2 py-1 text-xs rounded bg-red-500 hover:bg-red-600 text-white"
                    >
                      Deny
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add Friend Form */}
      <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl h-[50vh] p-6 sm:p-8 bg-glass rounded-lg shadow-lg overflow-y-auto animate-fade-in z-10">
        <h2 className="text-2xl font-bold text-[#00F5FF] mb-6 text-center">
          Add New Friend
        </h2>

        {/* Username search (debounced) */}
        <div className="mb-3 relative">
          <input
            type="text"
            placeholder="Search friend by username..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            className="w-full p-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-sm sm:text-base"
            autoComplete="off"
          />
          {/* Suggestions dropdown */}
          {(suggestions.length > 0 || isSearching) && (
            <div className="absolute left-0 right-0 mt-1 bg-[#0b0b0b] border border-gray-700 rounded-lg shadow-lg z-50 max-h-56 overflow-auto">
              {isSearching && (
                <div className="px-4 py-2 text-sm text-gray-300">
                  Searching...
                </div>
              )}
              {suggestions.map((s) => (
                <div
                  key={s._id}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSuggestionClick(s)}
                  className="px-4 py-2 hover:bg-gray-800 cursor-pointer flex items-center gap-3"
                >
                  <img
                    src={s.profilePhotoUrl}
                    alt={s.username}
                    className="w-8 h-8 rounded-full object-cover border border-gray-600"
                  />
                  <div className="flex flex-col">
                    <div className="font-medium text-white">{s.username}</div>
                    <div className="text-xs text-gray-400">{s.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Friends List */}
        <h3 className="text-base sm:text-lg mt-2 font-semibold mb-3 sm:mb-4 bg-clip-text text-transparent bg-[#00F5FF]">
          Friends List
        </h3>
        <ul className="space-y-2">
          {friends.map((friend, index) => (
            console.log(friend),
            <li
              key={index}
              className="p-2 rounded-lg bg-gray-700/50 border border-gray-600/30 text-white shadow-sm text-sm sm:text-base flex justify-between items-center"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <img
                  src={friend.profilePhotoUrl}
                  alt={friend.username}
                  className="w-8 h-8 rounded-full object-cover border border-gray-600"
                />
                <div className="flex flex-col">
                  <p className="font-semibold">{friend.name ?? friend.email}</p>
                  <p className="text-xs sm:text-sm text-gray-400">
                    {friend.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteFriend(index)}
                className="text-red-500 hover:text-red-700 transition-colors"
                title="Remove Friend"
              >
                <FaTrash className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>

        {/* DONE Button */}
        <button
          onClick={handleDone}
          disabled={friends.length === 0 || loading}
          className={`mt-6 w-full py-2 px-4 rounded-lg text-black ${
            friends.length === 0
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-[#00F5FF] to-[#00FFA3] hover:from-[#00FFA3] hover:to-[#00F5FF]"
          } transition-colors duration-300`}
        >
          {loading ? "Saving..." : "DONE"}
        </button>
      </div>
    </div>
  );
};

export default AddFriend;
