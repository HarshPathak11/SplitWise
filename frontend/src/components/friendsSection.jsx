// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import PropTypes from "prop-types";
// import FriendCard from "./FriendCard";
// import axios from "axios";

// const FriendsSection = ({ user }) => {
//   const [friends, setFriends] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");

//   useEffect(() => {
//     if (user?.friends) {
//       setFriends(user.friends); // friends is an array
//     }
//   }, [user]);
//   // console.log(friends, "friends");

//   const handleDeleteFriend = async (friendIdToDelete) => {
//     try {
//       const currentUser = JSON.parse(localStorage.getItem("user"));
//       const userId = currentUser?._id;

//       const res = await axios.delete(
//         `http://192.168.1.5:8000/user/remove-friend`,
//         {
//           data: {
//             userId,
//             friendId: friendIdToDelete,
//           },
//         }
//       );

//       if (res.status === 200) {
//         // Remove from frontend state
//         setFriends((prev) =>
//           prev.filter((f) => f.friend?._id !== friendIdToDelete)
//         );
//         setFriends((prev) =>
//           prev.filter((f) => f.friend?._id !== friendIdToDelete)
//         );
//         alert("Friend removed successfully");
//       }
//     } catch (error) {
//       console.error("Failed to delete friend:", error);
//       alert("Could not delete friend. Try again.");
//     }
//   };

//   const filteredFriends = friends.filter((f) =>
//     f.friend.username.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const handleUpdateFriendBalance = (email, newBalance) => {
//     setFriends((prev) =>
//       prev.map((f) =>
//         f.friend.email === email ? { ...f, balance: newBalance } : f
//       )
//     );
//   };

//   return (
//     <div className="backdrop-blur-lg bg-gray-800/30 sm:p-4 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 flex-1 p-2 mb-auto">
//       <div className="flex justify-between items-center mb-2 sm:mb-1">
//         <h2 className="text-lg sm:text-xl mb-2 font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#00F5FF] to-[#00FFA3] mr-12">
//           Friends
//         </h2>
//         <div className="flex items-center mb-2 gap-2 ml-auto">
//           <input
//             type="text"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             placeholder="Search friend's name"
//             className="bg-gray-700/50 text-white px-2 py-1 rounded-lg border border-gray-600/30 focus:outline-none focus:border-blue-500 text-xs sm:text-sm"
//           />
//           <Link to="/addFriend">
//             <button
//               type="button"
//               className="p-2 rounded-full bg-blue-600 hover:bg-blue-900 text-white transition-colors"
//               title="Add Friend"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-5 w-5"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//                 strokeWidth={2}
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M12 4v16m8-8H4"
//                 />
//               </svg>
//             </button>
//           </Link>
//         </div>
//       </div>

//       {/* Scrollable Friends List */}
//       <div
//         className={`space-y-2 ${
//           filteredFriends.length > 4
//             ? "overflow-y-auto max-h-[260px] pr-1 custom-scrollbar"
//             : ""
//         }`}
//       >
//         {filteredFriends.length === 0 ? (
//           <p className="text-red-500 text-center font-semibold">
//             No friends found.
//           </p>
//         ) : (
//           filteredFriends.map((f, index) => (
//             <FriendCard
//               key={f.friend?._id}
//               friend={f.friend}
//               balance={f.balance}
//               index={index}
//               handleDeleteFriend={() => handleDeleteFriend(f.friend?._id)}
//               updateFriendBalance={handleUpdateFriendBalance}
//             />
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// FriendsSection.propTypes = {
//   user: PropTypes.shape({
//     _id: PropTypes.string.isRequired,
//     friends: PropTypes.arrayOf(
//       PropTypes.shape({
//         friend: PropTypes.shape({
//           _id: PropTypes.string.isRequired,
//           username: PropTypes.string.isRequired,
//           email: PropTypes.string,
//         }),
//         balance: PropTypes.number,
//       })
//     ),
//   }).isRequired,
// };

// export default FriendsSection;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import FriendCard from "./FriendCard";
import axios from "axios";

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
          "http://192.168.1.5:8000/user/get-updated-friend-balances",
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
        `http://192.168.1.5:8000/user/remove-friend`,
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
        alert("Friend removed successfully");
      }
    } catch (error) {
      console.error("Failed to delete friend:", error);
      alert("Could not delete friend. Try again.");
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
  };

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
            ? "overflow-y-auto max-h-[260px] pr-1 custom-scrollbar"
            : ""
        }`}
      >
        {filteredFriends.length === 0 ? (
          <p className="text-red-500 text-center font-semibold">
            No friends found.
          </p>
        ) : (
          filteredFriends.map((f, index) => (
            <FriendCard
              key={f.friend?._id}
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
