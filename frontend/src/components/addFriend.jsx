import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaTrash } from "react-icons/fa"; // Import the trash icon

const AddFriend = () => {
  const navigate = useNavigate();

  const [friends, setFriends] = useState([]);
  const [newFriendEmail, setNewFriendEmail] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load friends from localStorage when the component mounts
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleAddFriend = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if ( newFriendEmail.trim() === "") {
      setError("All fields are required. Please fill in both name and email.");
      return;
    }

    if (!emailRegex.test(newFriendEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (friends.some((friend) => friend.email === newFriendEmail)) {
      setError("This friend is already added.");
      return;
    }
    const trimmedEmail = newFriendEmail.trim();

    setFriends([...friends, { email: trimmedEmail }]);
    setNewFriendEmail("");
    setError("");
  };

  const handleDeleteFriend = (index) => {
    const updatedFriends = friends.filter((_, i) => i !== index);
    setFriends(updatedFriends);
  };

  const handleDone = async () => {

    if (!user.user?.email) {
      alert("User not loaded. Please wait a moment.");
      return;
    }

    if (friends.length === 0) {
      alert("Please add at least one friend before proceeding.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post("http://localhost:8000/add-friends", {
        email: user.user?.email,
        friendsArray: friends.map((friend) => friend.email),
      });

      if (response.status === 200) {
        alert(
          `Successfully added ${
            response.data.addedFriends?.length || 0
          } friend(s)`
        );
        // Optionally redirect or reset the form
        navigate("/dash");
      } else {
        alert(`Failed to add friends: ${response.data.message}`);
      }
    } catch (err) {
      console.error("Error adding friends:", err);
      alert("An error occurred while adding friends.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8">
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
      <div className="bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-lg shadow-lg border border-white/20 w-full max-w-sm sm:max-w-md">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Add New Friend
        </h2>
        <div className="flex flex-col gap-3 mb-4 sm:mb-6">
          <input
            type="email"
            placeholder="Enter friend's email"
            value={newFriendEmail}
            disabled={loading}
            onChange={(e) => setNewFriendEmail(e.target.value)}
            className="p-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-sm sm:text-base"
          />
          {error && <p className="text-red-500 text-xs sm:text-sm">{error}</p>}
          <button
            onClick={handleAddFriend}
            disabled={loading}
            className="p-2 sm:p-3 rounded-full shadow-lg bg-gradient-to-r from-blue-800 via-sky-500 to-indigo-900 text-white transition-transform duration-300 ease-in-out hover:scale-110 w-16 sm:w-20 flex justify-center ml-auto"
            title="Add Friend"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 sm:h-5 sm:w-5"
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
        </div>

        {/* Friends List */}
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Friends List
        </h3>
        <ul className="space-y-2">
          {friends.map((friend, index) => (
            <li
              key={index}
              className="p-2 rounded-lg bg-gray-700/50 border border-gray-600/30 text-white shadow-sm text-sm sm:text-base flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{friend.name}</p>
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
          className={`mt-6 w-full py-2 px-4 rounded-lg text-white ${
            friends.length === 0
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-800 via-sky-500 to-indigo-900 hover:from-purple-500 hover:via-blue-600 hover:to-green-600"
          } transition-colors duration-300`}
        >
          {loading ? "Saving..." : "DONE"}
        </button>
      </div>
    </div>
  );
};

export default AddFriend;
