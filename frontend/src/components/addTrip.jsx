import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import useNavigate and Link for navigation

const AddTrip = () => {
  const navigate = useNavigate(); // Initialize the navigation hook

  // State for friends list and selected friends
  const [friends] = useState(["Alice", "Bob", "Charlie", "David"]); // Example friends list
  const [selectedFriends, setSelectedFriends] = useState([]);

  // Handle friend selection
  const handleFriendSelection = (friend) => {
    if (selectedFriends.includes(friend)) {
      setSelectedFriends(selectedFriends.filter((f) => f !== friend));
    } else {
      setSelectedFriends([...selectedFriends, friend]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8 ">
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

      {/* Add Trip Form */}
      <div className="bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-lg shadow-lg border border-white/20 w-full max-w-sm sm:max-w-md">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Add New Trip
        </h2>
        <form className="flex flex-col gap-4">
          {/* Trip Name */}
          <input
            type="text"
            placeholder="Enter trip name"
            className="p-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-sm sm:text-base"
          />

          {/* From and To Date Section */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* From Date */}
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-gray-300">
                From
              </label>
              <input
                type="date"
                className="w-full p-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-sm sm:text-base"
              />
            </div>

            {/* To Date */}
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-gray-300">
                To
              </label>
              <input
                type="date"
                className="w-full p-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Trip Description */}
          <textarea
            placeholder="Enter trip description"
            className="p-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-sm sm:text-base resize-none"
            rows="4"
          ></textarea>

          {/* Add Friends Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Add Friends
            </h3>
            <div className="flex flex-col gap-2">
              {friends.map((friend, index) => (
                <label key={index} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={friend}
                    checked={selectedFriends.includes(friend)}
                    onChange={() => handleFriendSelection(friend)}
                    className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-500 rounded"
                  />
                  <span className="text-sm text-gray-300">{friend}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="p-3 rounded-full shadow-lg bg-gradient-to-r from-blue-800 via-sky-500 to-indigo-900 hover:from-purple-500 hover:via-blue-600 hover:to-green-600 text-white transition-transform duration-300 ease-in-out hover:scale-110 w-full flex justify-center">
            <Link className="w-full flex justify-center" to="/dash">
              <button >
                Add Trip
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTrip;