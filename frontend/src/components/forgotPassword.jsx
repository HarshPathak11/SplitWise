import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { FaArrowLeft } from "react-icons/fa"; // Import the home icon

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpGenerated, setOtpGenerated] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://192.168.1.10:8000/user/forgot-password",
        {
          email,
        }
      );
      if (response.status === 200) {
        setOtpSent(true);
        setOtpGenerated(response.data.otp);
      }
    } catch (error) {
      alert("Failed to send OTP.");
      console.log("error is ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://192.168.1.10:8000/user/verify-forgot-password",
        {
          otpGenerated,
          otp,
          email,
        }
      );
      if (response.status === 200) {
        const user = response.data.user;
        Cookies.set("id", user._id, { expires: 7 });
        localStorage.setItem("user", JSON.stringify({ user: user }));
        // Redirect to profile page
        navigate("/profile");
      }
    } catch (error) {
      alert("OTP verification failed.");
      console.log("error is ", error);
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
          onClick={() => navigate("/login")} // Navigate to the landing page route
          className="p-2 rounded-full shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-105 transition-transform duration-300 ease-in-out"
          title="Back to Landing Page"
        >
          <FaArrowLeft className="text-white text-xl" />
        </button>
      </div>{" "}
      <div className="max-w-md w-full p-8 bg-glass rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-[#00f5ff] ">
          Forgot Password
        </h2>
        <p className="mb-4 text-white">
          Please enter your email address to verify OTP
        </p>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mb-4 text-black bg-gray-700"
        />
        {!otpSent && (
          <button
            onClick={handleSendOtp}
            className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        )}

        {otpSent && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mb-4 text-black"
            />
            <button
              onClick={handleVerifyOtp}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
