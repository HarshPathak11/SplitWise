import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import FriendCard from "./FriendCard"; // Adjust the path if needed

const FriendsSection = ({ user }) => {
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user?.friends) {
      const friendsArray = Object.values(user.friends);
      setFriends(friendsArray);
    }
  }, [user]);

  const handleDeleteFriend = (friendToDelete) => {
    setFriends(friends.filter((friend) => friend.name !== friendToDelete));
  };

  return (
    <div className="backdrop-blur-lg bg-gray-800/30 sm:p-4 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 flex-1 p-2 mb-auto">
      <div className="flex justify-between items-center mb-2 sm:mb-1">
        <h2 className="text-lg sm:text-xl mb-2 font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mr-12">
          Friends
        </h2>
        <div className="flex items-center mb-2 gap-2 ml-auto">
          {/* Search Input */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search friend's name"
            className="bg-gray-700/50 text-white px-2 py-1 rounded-lg border border-gray-600/30 focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
          />

          {/* Add Friend Button */}
          <Link to="/addFriend">
            <button
              type="button"
              className="p-2 rounded-full bg-green-600 hover:bg-green-700 text-white transition-colors"
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
      <div className="space-y-2 overflow-y-auto max-h-[260px] pr-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {friends.filter((friend) =>
          friend.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).length === 0 ? (
          <p className="text-red-500 text-center font-semibold">
            No friends found.
          </p>
        ) : (
          friends
            .filter((friend) =>
              friend.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((friend, index) => (
              <FriendCard
                key={friend._id || index}
                friend={friend}
                index={index}
                handleDeleteFriend={handleDeleteFriend}
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
    friends: PropTypes.object,
  }).isRequired,
};

export default FriendsSection;
