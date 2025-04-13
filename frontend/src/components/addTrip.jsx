import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate and Link for navigation
import axios from "axios"; // Import axios for HTTP requests

const AddTrip = () => {
  const navigate = useNavigate(); // Initialize the navigation hook
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [tripName, setTripName] = useState("");
  const [description, setDescription] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectAll, setSelectAll] = useState(false); // State to track "Select All" toggle

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.friends) {
      setFriends(user.friends); // assuming user.friends is an array of friend objects
    }
  }, []);

  // Handle friend selection
  const handleFriendSelection = (friendId) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(selectedFriends.filter((id) => id !== friendId));
    } else {
      setSelectedFriends([...selectedFriends, friendId]);
    }
  };

  // Handle "Select All" toggle
  const handleSelectAll = () => {
    if (selectAll) {
      // Unselect all friends
      setSelectedFriends([]);
    } else {
      // Select all friends
      setSelectedFriends(friends.map((friend) => friend.friend._id));
    }
    setSelectAll(!selectAll); // Toggle the "Select All" state
  };

  const handleAddTrip = async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));
    const tripData = {
      name: tripName,
      description,
      from: fromDate,
      to: toDate,
      members: [user._id, ...selectedFriends],
    };

    try {
      console.log(" sending Trip Data as:", tripData); // Log the trip data for debugging
      if (!tripData.name) {
        alert("Title is required!");
        return;
      }

      const res = await axios.post(
        "http://192.168.1.10:8000/group/create-group",
        tripData
      );
      console.log("Response:", res.data); // Log the response for debugging

      if (res.status !== 200 && res.status !== 201) {
        throw new Error("Failed to create trip");
      }

      console.log("Trip created:", res.data);
      navigate("/dash");
    } catch (error) {
      console.error("Error creating trip:", error);
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

      <div className="absolute top-4 left-4">
        <Link to="/dash">
          <button
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
        </Link>
      </div>

      {/* Add Trip Form */}
      <div className="relative w-full max-w-sm p-8 bg-glass rounded-lg shadow-lg overflow-hidden animate-fade-in z-10">
        <h2 className="text-2xl font-bold text-[#00F5FF] mb-4">Add New Trip</h2>
        <form className="flex flex-col gap-4" onSubmit={handleAddTrip}>
          {/* Trip Name */}
          <input
            type="text"
            placeholder="Enter trip name"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-[#00FFA3] focus:ring-2 focus:ring-[#00FFA3] placeholder-gray-400 text-sm sm:text-base"
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
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-[#00FFA3]"
              />
            </div>
            <div className="w-1/2 pl-2">
              <label className="block text-white mb-2" htmlFor="toDate">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-[#00FFA3]"
              />
            </div>
          </div>

          {/* Trip Description */}
          <textarea
            placeholder="Enter trip description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-[#00FFA3] rows-4 sm:rows-6 placeholder-gray-400 text-sm sm:text-base"
          />

          {/* Add Friends Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Add Friends
            </h3>

            <label className="flex items-center space-x-2 py-3 text-white">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="w-4 h-4"
              />
              <span className="text-sm">Select All</span>
            </label>

            <div className="flex flex-col gap-2">
              {friends.map((friend, index) => (
                <label key={index} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={friend.friend._id}
                    checked={selectedFriends.includes(friend.friend._id)}
                    onChange={() => handleFriendSelection(friend.friend._id)}
                    className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-500 rounded"
                  />
                  <span className="text-sm text-gray-300">
                    {friend.friend.username}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button className="w-full p-2 rounded bg-[#00F5FF] hover:bg-[#00FFA3] text-black transition-colors">
            Add Trip
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTrip;
