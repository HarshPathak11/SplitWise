import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const dummyUsers = [
  { id: 1, name: "Alice", email: "alice@email.com" },
  { id: 2, name: "Bob", email: "bob@email.com" },
  { id: 3, name: "Charlie", email: "charlie@email.com" },
  { id: 4, name: "Diana", email: "diana@email.com" },
];

export default function NotificationCampaign() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  const filteredUsers = dummyUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSend = () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user.");
      return;
    }
    setShowConfirm(true);
  };

  const confirmSend = () => {
    setShowConfirm(false);
    toast.success("Notifications have been sent!");
    setSelectedUsers([]);
    setTitle("");
    setBody("");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-8 relative">
      {/* 🔙 Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full hover:bg-white/20 transition"
      >
        <ArrowLeft size={18} />
        <span className="text-sm">Back</span>
      </button>

      <h1 className="text-3xl font-bold mb-6 mt-8">Notification Campaign</h1>

      <div className="bg-gray-900 p-6 rounded-2xl border border-gray-700 shadow-lg max-w-2xl w-full">
        <div className="mb-4">
          <label className="block text-gray-300 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter notification title"
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-300 mb-1">Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Enter notification message"
            rows="3"
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full p-2 mb-2 rounded bg-gray-800 border border-gray-700 text-sm focus:outline-none focus:ring focus:ring-blue-500"
          />
          <div className="max-h-56 overflow-auto border border-gray-700 rounded-lg">
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                onClick={() => toggleSelect(u.id)}
                className={`p-2 flex justify-between items-center cursor-pointer hover:bg-gray-800 ${
                  selectedUsers.includes(u.id) ? "bg-gray-800" : ""
                }`}
              >
                <div>
                  <div className="font-semibold">{u.name}</div>
                  <div className="text-gray-400 text-sm">{u.email}</div>
                </div>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(u.id)}
                  onChange={() => toggleSelect(u.id)}
                  className="accent-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSend}
          className="w-full py-2 mt-4 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors"
        >
          Send Notification
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-700 text-center max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">
              Are you sure you want to send this notification?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmSend}
                className="bg-green-500 px-4 py-2 rounded hover:bg-green-600"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
