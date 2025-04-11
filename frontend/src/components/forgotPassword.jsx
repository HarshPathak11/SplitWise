import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

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

      const response = await axios.post("http://192.168.1.5:8000/forgot-password", {
        email,
      });
      if (response.status === 200) {
        setOtpSent(true);
        setOtpGenerated(response.data.otp);
      }
    } catch (error) {
      alert("Failed to send OTP.");
      console.log("error is ",error);
      
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://192.168.1.5:8000/verify-forgot-password", {
        otpGenerated,
        otp,
        email
      });
      if (response.status === 200) {
        const user=response.data.user;
        Cookies.set('id', user._id, { expires: 7 });
        localStorage.setItem("user", JSON.stringify({ user: user }));
        // Redirect to profile page
        navigate("/profile");
      }
    } catch (error) {
      alert("OTP verification failed.");
      console.log("error is ",error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
    <div className="absolute top-4 left-4">
        <button
          onClick={() => navigate("/login")}
          className="p-2 rounded-full shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-110 transition-transform duration-300 ease-in-out"
          title="Back to Login"
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
      <div className="max-w-md w-full p-8 bg-glass rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Forgot Password</h2>
        <p className="mb-4">
          Please enter your email address to receive a password reset link.
        </p>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg mb-4 text-black"
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
