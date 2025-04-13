import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Validate new password length
    if (newPassword.length < 8) {
      setMessage("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    // Validate password match
    if (newPassword !== confirmPassword) {
      setMessage("New password and confirm password do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://192.168.1.7:8000/change-password",
        { currentPassword, newPassword }
      );
      setMessage(response.data.message);
    } catch (error) {
      setMessage("Error changing password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-[#000000] flex items-center justify-center min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="w-[500px] h-[500px] bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-30 animate-move"></div>
        <div className="w-[400px] h-[400px] bg-gradient-to-r from-blue-500 to-green-500 rounded-full blur-3xl opacity-30 animate-rotate delay-2000"></div>
        <div className="w-[600px] h-[600px] bg-gradient-to-r from-yellow-500 to-red-500 rounded-full blur-3xl opacity-30 animate-move delay-4000"></div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-lg opacity-50 animate-bounce"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full blur-lg opacity-50 animate-bounce delay-3000"></div>
      </div>
      <div className="absolute cursor-pointer mt-3.5 z-50 top-4 left-4">
        <button
          onClick={() => navigate("/profile")}
          className="p-2 rounded-full shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-105 transition-transform duration-300 ease-in-out"
          title="Back to Profile Page"
        >
          <FaArrowLeft className="text-white text-xl" />
        </button>
      </div>
      <div className="max-w-md w-full p-8 bg-glass rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-[#00F5FF]">
          Change Password
        </h2>
        
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mb-4 text-white bg-gray-700"
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mb-4 text-white bg-gray-700"
          required
        />
        <button
          onClick={handleChangePassword}
          className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
          disabled={loading}
        >
          {loading ? "Changing..." : "Change Password"}
        </button>
        {message && (
          <p
            className={`mt-4 ${
              message.includes("Error") ? "text-red-500" : "text-white"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChangePassword;