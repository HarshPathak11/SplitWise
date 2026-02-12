import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import FriendCard from "./FriendCard"; // ✅ adjust path as needed
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { FixedSizeList as List } from "react-window";
import api from "../utils/api";
import Cookies from "js-cookie";

const AllFriendsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setFriends(parsedUser.friends || []);
    }
  }, []);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  // Poll for updated balances every 2s
  useEffect(() => {
    if (!user?._id) return;

    const fetchUpdatedBalances = async () => {
      try {
        const res = await api.post(
          `${API_BASE}/user/get-updated-friend-balances`,
          {
            userId: user._id,
          }
        );

        const updatedData = res.data;
        setFriends((prevFriends) =>
          prevFriends.map((friend) => {
            const updatedFriend = updatedData.find(
              (data) =>
                data?.friendId?.toString() === friend?.friend?._id?.toString()
            );

            if (!updatedFriend) return friend;

            return {
              ...friend,
              balance: updatedFriend.balance ?? friend.balance,
              friend: {
                ...friend.friend,
                username: updatedFriend.username ?? friend.friend.username,
                profilePhotoUrl:
                  updatedFriend.profilePhotoUrl ??
                  friend.friend.profilePhotoUrl,
              },
            };
          })
        );
      } catch (err) {
        console.error("Error fetching updated friend balances:", err);
      }
    };

    const interval = setInterval(fetchUpdatedBalances, 2000);
    return () => clearInterval(interval);
  }, [user?._id]);

  useEffect(() => {
    async function getDetails() {
      const userId = Cookies.get("id");

      try {
        if (user) {
          const lastUpdatedAtUser = await api.get(
            `${API_BASE}/user/last-updated-at/${userId}`
          );
          if (
            new Date(lastUpdatedAtUser.data.lastUpdatedAt).getTime() !==
            new Date(user.updatedAt).getTime()
          ) {
            const response = await api.get(`${API_BASE}/user/${userId}`);
            if (response.status === 200) {
              setUser(response.data.user);
              localStorage.setItem("user", JSON.stringify(response.data.user));
            }
          }
        } else {
          const response = await api.get(`${API_BASE}/user/${userId}`);
          if (response.status === 200) {
            setUser(response.data.user);
            localStorage.setItem("user", JSON.stringify(response.data.user));
          }
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    }
    getDetails();
  }, []);

  const handleDeleteFriend = async (friendIdToDelete) => {
    try {
      const res = await api.delete(`${API_BASE}/user/remove-friend`, {
        data: {
          userId: user?._id,
          friendId: friendIdToDelete,
        },
      });

      if (res.status === 200) {
        setFriends((prev) =>
          prev.filter((f) => f.friend?._id !== friendIdToDelete)
        );

        const updatedUser = {
          ...user,
          friends: user.friends.filter(
            (f) => f.friend?._id !== friendIdToDelete
          ),
        };

        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        toast.success("Friend removed successfully!");
      }
    } catch (error) {
      console.error("Failed to delete friend:", error);
      // Extract error message from backend response
      const errorMessage = error.response?.data?.message || "Could not delete friend. Try again.";
      const balance = error.response?.data?.balance;
      
      // Show balance info if available
      if (balance !== undefined) {
        toast.error(`${errorMessage} Current balance: ₹${Math.abs(balance).toFixed(2)}`);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleBack = () => {
    // Always prefer actual browser history if there is one
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    // If no browser history, do a replace to avoid pushing duplicate entries
    const from = location.state?.from;
    if (from) {
      navigate(from, { replace: true });
    } else {
      navigate("/dash", { replace: true });
    }
  };

  const filteredFriends = friends.filter((f) =>
    f.friend?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedFriends = [
    ...filteredFriends
      .filter((f) => f.balance !== 0)
      .sort((a, b) => b.balance - a.balance),
    ...filteredFriends
      .filter((f) => f.balance === 0)
      .sort((a, b) =>
        (a.friend?.username || "").localeCompare(b.friend?.username || "")
      ),
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative font-sans selection:bg-indigo-500/30">
      {/* Background Texture (Consistent with Dashboard) */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      <div className="relative z-10 flex flex-col h-full max-w-2xl mx-auto w-full p-4 sm:p-6">
        {/* --- Header --- */}
        <div className="relative flex items-center justify-center mb-8">
          {/* Back Button */}
          <div className="absolute left-0">
            <button
              onClick={handleBack}
              className="p-2.5 rounded-full bg-zinc-900 border border-white/10 hover:bg-zinc-800 hover:border-white/20 text-zinc-400 hover:text-white transition-all duration-300 shadow-lg shadow-black/20"
              title="Back to Dashboard"
            >
              <FaArrowLeft className="text-sm" />
            </button>
          </div>

          {/* Centered Heading */}
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Your Contacts
          </h1>
        </div>

        {/* --- Search & Add --- */}
        <div className="flex items-center gap-3 mb-6 bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
          <div className="flex-1 flex items-center px-3">
            <svg
              className="w-4 h-4 text-zinc-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search friend..."
              className="w-full bg-transparent text-white text-sm placeholder-zinc-500 focus:outline-none"
            />
          </div>
          <Link to="/addFriend" className="relative group">
            <button
              type="button"
              className="w-9 h-9 md:w-8 md:h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95"
              title="Add New Friend"
            >
              {/* Notification Badge */}
              {user?.requests > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-zinc-900 z-10 animate-pulse">
                  {user?.requests}
                </span>
              )}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 md:h-4 md:w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </Link>
        </div>

        {/* --- Friends List --- */}
        <div className="flex-1 bg-zinc-900/30 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm relative">
          {sortedFriends.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-zinc-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <p className="text-zinc-400 font-medium">No friends found</p>
              <p className="text-zinc-600 text-sm mt-1">
                Try a different search or add a new contact.
              </p>
            </div>
          ) : (
            <div className="h-full w-full">
              <List
                height={window.innerHeight - 200} // Dynamic height calculation (adjust based on header size)
                itemCount={sortedFriends.length}
                itemSize={90} // Increased height for the new expanded card design
                width="100%"
                className="custom-scrollbar px-2"
                innerElementType="div"
              >
                {({ index, style }) => {
                  const f = sortedFriends[index];
                  return (
                    <div
                      style={{
                        ...style,
                        paddingBottom: "8px",
                        paddingTop: "8px",
                        paddingLeft: "8px",
                        paddingRight: "8px",
                      }}
                    >
                      <FriendCard
                        key={f.friend?._id || index}
                        friend={f.friend}
                        balance={f.balance}
                        index={index}
                        handleDeleteFriend={() =>
                          handleDeleteFriend(f.friend?._id)
                        }
                      />
                    </div>
                  );
                }}
              </List>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllFriendsPage;
