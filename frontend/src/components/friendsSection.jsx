import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import FriendCard from "./FriendCard";
import axios from "axios";
import toast from "react-hot-toast";

const FriendsSection = ({ user }) => {
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user?.friends) {
      setFriends(user.friends); // Initial load
    }
  }, [user]);

  // 🔁 POLLING: Update balances every 2 seconds
  useEffect(() => {
    const fetchUpdatedBalances = async () => {
      try {
        const res = await axios.post(
          // "https://fairfare-0hyl.onrender.com/user/get-updated-friend-balances",
          "http://localhost:8000/user/get-updated-friend-balances",
          { userId: user?._id }
        );

        const updatedData = res.data; // [{ friendId, balance }]
        // Assuming `setFriends` updates the friends list with the new balances
        setFriends((prevFriends) => {
          return prevFriends.map((friend) => {
            const updatedBalance = updatedData.find(
              (balance) =>
                balance.friendId.toString() === friend.friend?._id.toString()
            );
            return updatedBalance
              ? { ...friend, balance: updatedBalance.balance }
              : friend;
          });
        });
      } catch (err) {
        console.error("Error fetching updated friend balances:", err);
      }
    };

    const interval = setInterval(() => {
      fetchUpdatedBalances();
    }, 2000); // Every 2 seconds

    return () => clearInterval(interval); // Cleanup
  }, [user?._id]);

  const handleDeleteFriend = async (friendIdToDelete) => {
    try {
      const res = await axios.delete(
        `https://fairfare-0hyl.onrender.com/user/remove-friend`,
        {
          data: {
            userId: user?._id,
            friendId: friendIdToDelete,
          },
        }
      );

      if (res.status === 200) {
        setFriends((prev) =>
          prev.filter((f) => f.friend?._id !== friendIdToDelete)
        );
        toast.success("Friend removed successfully!");
      }
    } catch (error) {
      console.error("Failed to delete friend:", error);
      toast.error("Could not delete friend. Try again.");
    }
  };

  const filteredFriends = friends.filter((f) =>
    f.friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateFriendBalance = (email, newBalance) => {
    setFriends((prev) =>
      prev.map((f) =>
        f.friend.email === email ? { ...f, balance: newBalance } : f
      )
    );
    const updatedUser = { ...user };
    const friendIndex = updatedUser.friends.findIndex(
      (f) => f.friend.email === email
    );
    if (friendIndex !== -1) {
      updatedUser.friends[friendIndex].balance = newBalance;
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  // Split and sort
  const sortedFriends = [
    // 1. Friends with non-zero balance, sorted alphabetically by name
    ...filteredFriends
      .filter((f) => f.balance !== 0)
      // 1. Friends with non-zero balance, sorted by descending balance
      .sort((a, b) => b.balance - a.balance),
    // 2. Friends with zero balance, sorted alphabetically by name
    ...filteredFriends
      .filter((f) => f.balance === 0)
      .sort((a, b) => {
        const nameA =
          a.friend && a.friend.username ? a.friend.username.toLowerCase() : "";
        const nameB =
          b.friend && b.friend.username ? b.friend.username.toLowerCase() : "";

        return nameA.localeCompare(nameB);
      }),
  ];

  return (
    <div className="backdrop-blur-lg bg-gray-800/30 sm:p-4 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 flex-1 p-2 mb-auto">
      <div className="flex justify-between items-center mb-2 sm:mb-1">
        <h2 className="text-lg sm:text-xl mb-2 font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#00F5FF] to-[#00FFA3] mr-12">
          Friends
        </h2>
        <div className="flex items-center mb-2 gap-2 ml-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search friend's name"
            className="bg-gray-700/50 text-white px-2 py-1 rounded-lg border border-gray-600/30 focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
          />
          <Link to="/addFriend">
            <button
              type="button"
              className="p-2 rounded-full bg-blue-600 hover:bg-blue-900 text-white transition-colors"
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
      </div>

      {/* Scrollable Friends List */}
      <div
        className={`space-y-2 ${
          filteredFriends.length > 4
            ? "overflow-y-auto max-h-[331px] pr-1 custom-scrollbar"
            : ""
        }`}
      >
        {sortedFriends.length === 0 ? (
          <p className="text-red-500 text-center font-semibold">
            You have no friends as always.
          </p>
        ) : (
          sortedFriends.map((f, index) => (
            <FriendCard
              key={f.friend?._id || index}
              friend={f.friend}
              balance={f.balance}
              index={index}
              handleDeleteFriend={() => handleDeleteFriend(f.friend?._id)}
              updateFriendBalance={handleUpdateFriendBalance}
            />
          ))
        )}
      </div>
    </div>
  );
};

FriendsSection.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    friends: PropTypes.arrayOf(
      PropTypes.shape({
        friend: PropTypes.shape({
          _id: PropTypes.string.isRequired,
          username: PropTypes.string.isRequired,
          email: PropTypes.string,
        }),
        balance: PropTypes.number,
      })
    ),
  }).isRequired,
};

export default FriendsSection;
