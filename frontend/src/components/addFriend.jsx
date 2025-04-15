import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaTrash } from "react-icons/fa"; // Import the trash icon
import toast from 'react-hot-toast';

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

    if (newFriendEmail.trim() === "") {
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

      const response = await axios.post(
        "http://192.168.1.5:8000/user/add-friends",
        {
          email: user?.email,
          friendsArray: friends.map((friend) => friend.email),
        }
      );

      if (response.status === 200) {
        if(response.data.addedFriends?.length === 0){
          toast.success("Invite sent to your friend(s)!");          
        }
        else{
        toast.success(`Successfully added ${
            response.data.addedFriends?.length || 0
          } friend(s)`);
      }
        // Optionally redirect or reset the form
      } else {
        toast.error(`Failed to add friends: ${response.data.message}`)
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
      <div className="relative w-full max-w-sm p-8 bg-glass rounded-lg shadow-lg overflow-hidden animate-fade-in z-10">
        <h2 className="text-2xl font-bold text-[#00F5FF] mb-6 text-center">
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
            className="p-2 sm:p-3 rounded-full shadow-lg bg-[#00F5FF] text-black hover:bg-green-400 focus:outline-none focus:shadow-outline transition-transform transform hover:scale-105 flex justify-center ml-auto"
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
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 bg-clip-text text-transparent bg-[#00F5FF]">
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
