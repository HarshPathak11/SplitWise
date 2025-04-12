import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const AddMembers = () => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);

  // Load friends from localStorage (expected structure: { friends: [{ friend: {...}, balance: 0 }, ...] })
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        // Ensure friends is an array; if not, default to empty array
        const friendList = Array.isArray(user.friends) ? user.friends : [];
        setFriends(friendList);
      }
    } catch (err) {
      console.error("Error parsing user from localStorage:", err);
    }
  }, []);

  // This effect also filters out friends already added in a trip (if stored in localStorage)
  useEffect(() => {
    try {
      const existingTripMembers =
        JSON.parse(localStorage.getItem("tripMembers")) || [];
      // Filter out friends whose username is in the existingTripMembers array.
      // Note: existingTripMembers should be an array of usernames.
      setFriends((prevFriends) =>
        prevFriends.filter(
          (f) => !existingTripMembers.includes(f.friend.username)
        )
      );
    } catch (err) {
      console.error("Error loading friends:", err);
    }
  }, []);

  // Select or deselect friend based on nested _id
  const handleSelect = (friendItem) => {
    if (selectedFriends.some((f) => f.friend._id === friendItem.friend._id)) {
      setSelectedFriends((prev) =>
        prev.filter((f) => f.friend._id !== friendItem.friend._id)
      );
    } else {
      setSelectedFriends((prev) => [friendItem, ...prev]);
    }
    setSearch("");
  };

  // Filter friends based on friend.friend.username
  const filteredFriends = friends.filter((friendItem) =>
    friendItem.friend.username.toLowerCase().includes(search.toLowerCase())
  );

  // For navigation, we pass the selected friends (here using usernames; adjust as needed)
  const handleAdd = () => {
    navigate("/tripDetails", {
      state: {
        // If you prefer the entire friend object, you can pass friendItem.friend instead.
        selectedMembers: selectedFriends.map((f) => f.friend.username),
      },
    });
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 py-6">
      {/* Back Button */}
      <button
        className="flex items-center text-white mb-6 hover:text-gray-300"
        onClick={() => navigate("/tripDetails")}
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-4 text-center">Add Members</h1>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search friends..."
          className="w-full px-4 py-2 rounded-lg bg-[#121212] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Selected Friends Display */}
        {selectedFriends.length > 0 && (
          <div className="mt-4">
            <p className="text-gray-300 mb-2">Selected:</p>
            <div className="flex flex-wrap gap-3">
              {selectedFriends.map((friendItem) => (
                <span
                  key={friendItem.friend._id}
                  className="bg-green-700 px-3 py-1 rounded-full text-sm"
                >
                  {friendItem.friend.username}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Friend List Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {filteredFriends.map((friendItem) => {
            const isSelected = selectedFriends.some(
              (f) => f.friend._id === friendItem.friend._id
            );
            return (
              <div
                key={friendItem.friend._id}
                onClick={() => handleSelect(friendItem)}
                className={`cursor-pointer px-4 py-3 rounded-lg border transition ${
                  isSelected
                    ? "border-green-500 bg-green-800 text-white"
                    : "border-gray-600 bg-[#121212] hover:bg-gray-800"
                }`}
              >
                {friendItem.friend.username}
              </div>
            );
          })}
        </div>

        {/* Add Members Button */}
        <div className="text-center pt-6">
          <button
            className="bg-white text-black font-semibold px-8 py-3 rounded-xl hover:bg-gray-200 transition text-lg"
            onClick={handleAdd}
          >
            Add Selected Members
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMembers;
