import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FriendCard from "./FriendCard"; // ✅ adjust path as needed
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FixedSizeList as List } from "react-window";

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
        const res = await axios.post(
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

  const handleDeleteFriend = async (friendIdToDelete) => {
    try {
      const res = await axios.delete(`${API_BASE}/user/remove-friend`, {
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
      toast.error("Could not delete friend. Try again.");
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
    <div className="min-h-screen bg-black text-white flex flex-col p-4 sm:p-6">
      {/* Header */}

      <div className="relative flex items-center justify-center mb-4">
        {/* Back Button */}
        <div className="absolute left-4 mb-3 cursor-pointer mt-3.5 z-50">
          <button
            onClick={handleBack}
            className="p-2 rounded-full shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-105 transition-transform duration-300 ease-in-out"
            title="Back to Dashboard"
          >
            <FaArrowLeft className="text-white text-xl" />
          </button>
        </div>

        {/* Centered Heading */}
        <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00F5FF] to-[#00FFA3] text-center">
          Your Friends
        </h1>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search friend..."
          className="flex-1 bg-gray-800/60 text-white px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00FFA3]"
        />
        <Link to="/addFriend">
          <button
            className="p-2 rounded-full bg-blue-600 hover:bg-blue-900 text-white relative"
            title="Add Friend"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
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

      {/* Friends List */}
      <div
        className={`flex-1 overflow-y-auto space-y-3 pb-4 ${
          sortedFriends.length > 0 ? "custom-scrollbar" : ""
        }`}
      >
        {sortedFriends.length === 0 ? (
          <p className="text-center text-red-400 font-semibold mt-8">
            No friends found 😢
          </p>
        ) : (
          <List
            height={window.innerHeight} // adjust to available space
            itemCount={sortedFriends.length}
            itemSize={70} // height of one FriendCard in px
            width="100%"
            className="custom-scrollbar"
            innerElementType="div"
            style={{ padding: "0.5rem 0" }}
          >
            {({ index, style }) => {
              const f = sortedFriends[index];
              return (
                <div style={style}>
                  <FriendCard
                    key={f.friend?._id || index}
                    friend={f.friend}
                    balance={f.balance}
                    index={index}
                    handleDeleteFriend={() => handleDeleteFriend(f.friend?._id)}
                  />
                </div>
              );
            }}
          </List>
        )}
      </div>
    </div>
  );
};

export default AllFriendsPage;
