import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div
        onClick={() => navigate("/marketing")}
        className="bg-gray-900 p-6 rounded-2xl border border-gray-700 shadow-lg cursor-pointer hover:bg-gray-800 transition-all max-w-md w-full text-center"
      >
        <h2 className="text-xl font-semibold mb-2">📢 Marketing Campaigns</h2>
        <p className="text-gray-400 text-sm">Manage and send campaigns to users</p>
      </div>

      <div
        onClick={() => navigate("/feedback-responses")}
        className="bg-gray-900 p-6 mt-4 rounded-2xl border border-gray-700 shadow-lg cursor-pointer hover:bg-gray-800 transition-all max-w-md w-full text-center"
      >
        <h2 className="text-xl font-semibold mb-2">📝 Feedback Responses</h2>
        <p className="text-gray-400 text-sm">Create and manage feedback responses</p>
      </div>
    </div>
  );
}
