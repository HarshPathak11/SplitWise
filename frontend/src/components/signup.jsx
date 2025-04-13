import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { FaHome } from "react-icons/fa";

const SignUp = () => {
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpGenerated, setOtpGenerated] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleOtpSend = async () => {
    if (!email || !username || !password) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://192.168.1.7:8000/user/send-otp",
        {
          email,
          username,
        }
      );

      if (response.status === 200) {
        setOtpSent(response.data.otp);
        setOtpGenerated(response.data.otp);
      }
    } catch (error) {
      if (error.response && error.response.status === 410) {
        alert("Email already Taken!");
      } else {
        alert("Failed to send OTP.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    try {
      const response = await axios.post(
        "http://192.168.1.7:8000/user/verify-otp",
        {
          email,
          otp,
          otpGenerated,
          password,
          username,
        }
      );

      if (response.status === 200) {
        Cookies.set("id", response.data._id, { expires: 7 });
        navigate("/profile");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("OTP verification failed.");
    }
  };

  return (
    <div className="relative bg-[#000000] flex items-center justify-center min-h-screen overflow-hidden">
      {" "}
      <div className="absolute cursor-pointer mt-3.5 z-50 top-4 left-4">
        <div className="absolute cursor-pointer mt-3.5 z-50 top-4 left-4">
          <button
            onClick={() => navigate("/")} // Navigate to the landing page route
            className="p-2 rounded-full shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-105 transition-transform duration-300 ease-in-out"
            title="Back to Landing Page"
          >
            <FaHome className="text-white text-xl" />
          </button>
        </div>
      </div>
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="w-[500px] h-[500px] bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-30 animate-move-opposite"></div>
        <div className="w-[400px] h-[400px] bg-gradient-to-r from-blue-500 to-green-500 rounded-full blur-3xl opacity-30 animate-rotate-opposite delay-2000"></div>
        <div className="w-[600px] h-[600px] bg-gradient-to-r from-yellow-500 to-red-500 rounded-full blur-3xl opacity-30 animate-move-opposite delay-4000"></div>
        <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-lg opacity-50 animate-bounce-opposite"></div>
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full blur-lg opacity-50 animate-bounce-opposite delay-3000"></div>
      </div>
      {/* SignUp Card */}
      <div className="relative w-full max-w-sm p-8 bg-glass rounded-lg shadow-lg overflow-hidden animate-fade-in z-10">
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6 mt-16">
            <div className="text-2xl font-bold text-[#00f5ff]">SIGN UP</div>
            <Link to="/login" className="text-xl text-white cursor-pointer">
              LOGIN
            </Link>
          </div>

          <div className="mb-4">
            <label className="block text-white text-sm font-bold mb-2">
              Name
            </label>
            <input
              value={username}
              onChange={(e) => setUserName(e.target.value)}
              type="text"
              placeholder="Name"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="mb-4">
            <label className="block text-white text-sm font-bold mb-2">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email Address"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="mb-4">
            <label className="block text-white text-sm font-bold mb-2">
              Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          {/* OTP input only shows after send OTP */}
          {otpSent && (
            <div className="mb-6">
              <label className="block text-white text-sm font-bold mb-2">
                Verify OTP
              </label>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                type="text"
                placeholder="Enter OTP"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          )}
          <button
            onClick={otpSent ? handleOtpVerify : handleOtpSend}
            disabled={loading}
            className={`w-full py-2 px-4 rounded-lg text-white ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Sending..." : otpSent ? "Verify OTP" : "Send OTP"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
