import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

const RemoveMembers = () => {
  const navigate = useNavigate();
  const [tripMembers, setTripMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isRemoving, setIsRemoving] = useState(false);
  const { groupId } = useParams();

useEffect(() => {
  try {
    const storedUser = localStorage.getItem("user");
    const existingTripMembers =
      JSON.parse(localStorage.getItem("tripMembers")) || [];

    if (storedUser) {
      const user = JSON.parse(storedUser);
      const currentUserId = user._id;

      const membersList = existingTripMembers
        .filter((m) => m._id !== currentUserId) // Exclude current user
        .map((m) => ({
          _id: m._id,
          username: m.username,
        }));

      setTripMembers(membersList); // Reusing 'friends' as trip members list
    }
  } catch (err) {
    console.error("Error loading trip members:", err);
  }
}, []);


  const handleSelect = (member) => {
    if (selectedMembers.some((m) => m._id === member._id)) {
      setSelectedMembers((prev) => prev.filter((m) => m._id !== member._id));
    } else {
      setSelectedMembers((prev) => [member, ...prev]);
    }
    setSearch("");
  };

  const filteredMembers = tripMembers.filter((member) =>
    member.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      if (!groupId || selectedMembers.length === 0) return;

      const memberIds = selectedMembers.map((m) => m._id);

      const res = await axios.post(
        `https://fairfare-0hyl.onrender.com/group/remove-members/${groupId}`,
        // `http://localhost:8000/group/remove-members/${groupId}`,
        {
          members: memberIds,
        }
      );

      if (res.status !== 200) {
        toast.error("Failed to remove members. Try again.");
        // console.log("Failed to remove members:", res.data.message);
        throw new Error(res.data.message || "Failed to remove members");
        
      }

      const updatedGroup = res.data;
      localStorage.setItem("currentGroup", JSON.stringify(updatedGroup));
      localStorage.setItem(
        "tripMembers",
        JSON.stringify(updatedGroup.members || [])
      );
      toast.success("Member(s) removed successfully!");

      navigate(-1);
    } catch (err) {
      console.error("Failed to remove members:", err.message);
      toast.error(
        err.response?.data?.message || "Could not remove members. Try again."
      );
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 py-6">
      <button
        className="flex items-center text-white mb-6 hover:text-gray-300"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-4 text-center">Remove Members</h1>

        <input
          type="text"
          placeholder="Search members..."
          className="w-full px-4 py-2 rounded-lg bg-[#121212] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {selectedMembers.length > 0 && (
          <div className="mt-4">
            <p className="text-gray-300 mb-2">Selected:</p>
            <div className="flex flex-wrap gap-3">
              {selectedMembers.map((member) => (
                <span
                  key={member._id}
                  className="bg-red-700 px-3 py-1 rounded-full text-sm"
                >
                  {member.username}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {filteredMembers.map((member) => {
            const isSelected = selectedMembers.some(
              (m) => m._id === member._id
            );
            return (
              <div
                key={member._id}
                onClick={() => handleSelect(member)}
                className={`cursor-pointer px-4 py-3 rounded-lg border transition ${
                  isSelected
                    ? "border-red-500 bg-red-800 text-white"
                    : "border-gray-600 bg-[#121212] hover:bg-gray-800"
                }`}
              >
                {member.username}
              </div>
            );
          })}
        </div>

        <div className="text-center pt-6">
          <button
            disabled={selectedMembers.length === 0 || isRemoving}
            className={`${
              selectedMembers.length === 0 || isRemoving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-gray-200"
            } text-black font-semibold px-8 py-3 rounded-xl transition text-lg`}
            onClick={handleRemove}
          >
            {isRemoving ? "Removing..." : "Remove Selected Members"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveMembers;
