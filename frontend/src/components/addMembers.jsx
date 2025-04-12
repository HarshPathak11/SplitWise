import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const AddMembers = () => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      
      if (storedUser) {
        const user = JSON.parse(storedUser);
  
        if (user.user.friends.length > 0) {
          const friendList = Object.values(user.user.friends);
          setFriends(friendList);
        }
      }
    } catch (err) {
      console.error("Error parsing user from localStorage:", err);
    }
  }, []);
  
  useEffect(() => {
      try {
        const storedUser = localStorage.getItem("user");
        const existingTripMembers = JSON.parse(localStorage.getItem("tripMembers")) || [];
    
        if (storedUser) {
          const user = JSON.parse(storedUser);
          const allFriends = user.user.friends || [];
    
          const notAlreadyAdded = allFriends.filter(
            (f) => !existingTripMembers.includes(f.name)
          );
    
          setFriends(notAlreadyAdded);
        }
      } catch (err) {
        console.error("Error loading friends:", err);
      }
    }, []);
    


const handleSelect = (friend) => {
    if (selectedFriends.some((f) => f._id === friend._id)) {
      setSelectedFriends((prev) => prev.filter((f) => f._id !== friend._id));
    } else {
      setSelectedFriends((prev) => [friend, ...prev]);
    }
    setSearch("");
  };

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    navigate("/tripDetails", {
      state: {
        selectedMembers: selectedFriends.map((f) => f.name),
      },
    });
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 py-6">
      {/* Back Button */}
      <button
        className="flex items-center text-white mb-6 hover:text-gray-300"
        onClick={() => navigate('/tripDetails')}
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-4 text-center">Add Members</h1>

        {/* Search */}
        <input
          type="text"
          placeholder="Search friends..."
          className="w-full px-4 py-2 rounded-lg bg-[#121212] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Selected Friends */}
        {selectedFriends.length > 0 && (
          <div className="mt-4">
            <p className="text-gray-300 mb-2">Selected:</p>
            <div className="flex flex-wrap gap-3">
              {selectedFriends.map((friend) => (
                <span
                  key={friend._id}
                  className="bg-green-700 px-3 py-1 rounded-full text-sm"
                >
                  {friend.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Friend List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {filteredFriends.map((friend) => {
            const isSelected = selectedFriends.some((f) => f._id === friend._id);
            return (
              <div
                key={friend._id}
                onClick={() => handleSelect(friend)}
                className={`cursor-pointer px-4 py-3 rounded-lg border transition 
                  ${
                    isSelected
                      ? "border-green-500 bg-green-800 text-white"
                      : "border-gray-600 bg-[#121212] hover:bg-gray-800"
                  }`}
              >
                {friend.name}
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
