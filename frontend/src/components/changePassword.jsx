import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Cookies from "js-cookie";
import { FaArrowLeft } from "react-icons/fa";
import toast from "react-hot-toast";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const ChangePassword = () => {
  const [email, setEmail] = useState(""); // For the email input
  const [otp, setOtp] = useState(""); // For OTP input
  const [newPassword, setNewPassword] = useState(""); // For new password input
  const [confirmPassword, setConfirmPassword] = useState(""); // For confirm password input
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false); // To track OTP verification
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [otpSent, setOtpSent] = useState(false); // To track if OTP has been sent
  const [otpGenerated, setOtpGenerated] = useState(""); // To store the generated OTP
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = Cookies.get("id");

  const handleSendOtp = async () => {
    setLoading(true);
    setMessage("");
    if (email !== user.email) {
      setMessage("Email does not match with the logged-in user.");
      setLoading(false);
      return;
    }
    try {
      // Send OTP request to the backend
      const response = await axios.post(`${API_BASE}/user/forgot-password`, {
        email,
      });
      if (response.status === 200) {
        setOtpGenerated(response.data.otp); // Store the generated OTP for later use
        setOtpSent(true); // OTP sent successfully
        setMessage(
          "OTP sent to your email. Please check spam if OTP not found."
        );
      } else {
        setMessage("Error sending OTP. Please try again.");
      }
    } catch (error) {
      setMessage("Error sending OTP. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setMessage("");
    try {
      // Verify OTP entered by the user
      const response = await axios.post(
        `${API_BASE}/user/verify-forgot-password`,
        { email, otp, otpGenerated }
      );
      if (response.status === 200) {
        setIsOtpVerified(true); // OTP verified successfully
        setMessage("OTP verified. You can now change your password.");
      } else {
        setMessage("Invalid OTP. Please try again.");
      }
    } catch (error) {
      setMessage("Error verifying OTP. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!newPassword && !confirmPassword) {
      toast.error("Please fill in all fields.");
      setLoading(false);
      return;
    }

    // Validate password match
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/user/change-password`, {
        userId,
        newPassword,
      });
      setMessage(
        response.status === 200
          ? "Password changed successfully."
          : "Error changing password. Please try again."
      );
      if (response.status === 200) {
        Cookies.remove("id");
        Cookies.remove("last4");
        localStorage.clear();
        navigate("/login"); // Redirect to login page after successful password change
      }
    } catch (error) {
      setMessage("Error changing password. Please try again.");
      // console.log("Error changing password:", error);
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

        {!otpSent && !isOtpVerified && (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg pr-10 text-white bg-transparent placeholder-gray-400 mb-5"
              required
            />
            <button
              onClick={handleSendOtp}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        )}

        {otpSent && !isOtpVerified && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-4 bg-transparent text-white bg-gray-700"
              required
            />
            <button
              onClick={handleVerifyOtp}
              className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
              disabled={loading}
            >
              {loading ? "Verifying OTP..." : "Verify OTP"}
            </button>
          </>
        )}

        {isOtpVerified && (
          <>
            <div className="relative mb-4">
              <input
                type={showPassword1 ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg pr-10 text-white bg-transparent placeholder-gray-400"
                required
              />
              <span
                onClick={() => setShowPassword1(!showPassword1)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
              >
                {showPassword1 ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <div className="relative mb-4">
              <input
                type={showPassword2 ? "text" : "password"}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg pr-10 text-white bg-transparent placeholder-gray-400"
                required
              />
              <span
                onClick={() => setShowPassword2(!showPassword2)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
              >
                {showPassword2 ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <button
              onClick={handleChangePassword}
              className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
              disabled={loading}
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
          </>
        )}

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
