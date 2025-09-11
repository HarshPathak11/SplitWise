import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaTrash } from "react-icons/fa"; // Import the trash icon
import toast from "react-hot-toast";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const AddFriend = () => {
  const navigate = useNavigate();

  const [friends, setFriends] = useState([]); // { email, name? }
  const [search, setSearch] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Debounce + suggestions
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]); // [{ _id, username, email }]
  const [isSearching, setIsSearching] = useState(false);
  const controllerRef = useRef(null);

  // Load user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

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
          .filter((u) => u._id !== user?._id) // exclude self
          .slice(0, 8)
          .map((u) => ({
            _id: u._id,
            username: u.username,
            email: u.email,
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
      { email: userObj.email, name: userObj.username },
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
    if (!user?.email) {
      toast.error("User not loaded. Please wait a moment.");
      return;
    }

    if (friends.length === 0) {
      toast.error("Please add at least one friend before proceeding.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(`${API_BASE}/user/add-friends`, {
        email: user?.email,
        autoAdd: false,
        friendsArray: friends.map((friend) => friend.email),
      });

      if (response.status === 200) {
        if (response.data.addedFriends?.length === 0) {
          toast.success("Invite sent to your friend(s)!");
        } else {
          toast.success(
            `Successfully added ${
              response.data.addedFriends?.length || 0
            } friend(s)`
          );
        }
        // ✅ Clear the list after successful addition
        setFriends([]);
      } else {
        toast.error(`Failed to add friends: ${response.data.message}`);
      }
    } catch (err) {
      console.error("Error adding friends:", err);
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
      {/* Back to Dashboard Button */}
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
                  onMouseDown={(e) => e.preventDefault()} // prevent input blur
                  onClick={() => handleSuggestionClick(s)}
                  className="px-4 py-3 hover:bg-gray-800 cursor-pointer flex justify-between items-center"
                >
                  <div>
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
            <li
              key={index}
              className="p-2 rounded-lg bg-gray-700/50 border border-gray-600/30 text-white shadow-sm text-sm sm:text-base flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{friend.name ?? friend.email}</p>
                <p className="text-xs sm:text-sm text-gray-400">
                  {friend.email}
                </p>
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
