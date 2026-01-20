import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaArrowLeft, FaLock } from "react-icons/fa"; // Added FaLock for UI icon
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import api from "../utils/api";
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
      const response = await api.post(`${API_BASE}/user/forgot-password`, {
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
      const response = await api.post(
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
      const response = await api.post(`${API_BASE}/user/change-password`, {
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
      toast.error(error.response.data.message);
      setMessage(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] overflow-hidden flex items-center justify-center selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* --- BACKGROUND: The Digital Aurora --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] bg-fuchsia-900/20 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
        {/* Noise overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]"></div>
      </div>

      {/* --- NAVIGATION: Back Button --- */}
      <div className="absolute top-8 left-8 z-50">
        <button
          onClick={() => navigate("/profile")}
          className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-md"
        >
          <FaArrowLeft className="text-white/70 group-hover:text-white transition-colors" />
          <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
            Back to Profile
          </span>
        </button>
      </div>

      {/* --- MAIN CARD --- */}
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Glow behind card */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent rounded-3xl blur-xl opacity-50 pointer-events-none"></div>

        <div className="relative bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl ring-1 ring-white/5">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-white/10 to-transparent border border-white/10 mb-4 shadow-lg">
              {/* Using FaLock as a generic secure icon if not available, simply text will show */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Change Password
            </h1>
            <p className="text-white/40 text-sm mt-2">
              Secure your account with a new password.
            </p>
          </div>

          <div className="space-y-5">
            {/* STAGE 1: Email Input */}
            {!otpSent && !isOtpVerified && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider ml-1">
                    Confirm Email
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all"
                  />
                </div>

                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className={`relative w-full overflow-hidden rounded-xl py-4 font-semibold text-sm tracking-wide transition-all duration-300
                    ${
                      loading
                        ? "bg-white/10 text-white/30 cursor-wait"
                        : "bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    }`}
                >
                  {loading ? "Sending..." : "Send Verification Code"}
                </button>
              </div>
            )}

            {/* STAGE 2: OTP Verification */}
            {otpSent && !isOtpVerified && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 mb-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-medium text-emerald-400">
                    Code sent to {email}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider ml-1">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, ""); // remove non-digits
                      if (val.length <= 6) setOtp(val);
                    }}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center tracking-[0.5em] font-mono text-lg placeholder-white/10 focus:outline-none focus:bg-white/10 focus:border-indigo-500/50 transition-all"
                  />
                </div>

                <button
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className={`relative w-full overflow-hidden rounded-xl py-4 font-semibold text-sm tracking-wide transition-all duration-300
                    ${
                      loading
                        ? "bg-white/10 text-white/30 cursor-wait"
                        : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                    }`}
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </button>
              </div>
            )}

            {/* STAGE 3: New Password */}
            {isOtpVerified && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 mb-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-medium text-emerald-400">
                    Identity Verified
                  </span>
                </div>

                {/* New Password */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider ml-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword1 ? "text" : "password"}
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all pr-10"
                    />
                    <button
                      onClick={() => setShowPassword1(!showPassword1)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                      type="button"
                    >
                      {showPassword1 ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider ml-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword2 ? "text" : "password"}
                      placeholder="Confirm New Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all pr-10"
                    />
                    <button
                      onClick={() => setShowPassword2(!showPassword2)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                      type="button"
                    >
                      {showPassword2 ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className={`relative w-full overflow-hidden rounded-xl py-4 font-semibold text-sm tracking-wide transition-all duration-300 mt-2
                    ${
                      loading
                        ? "bg-white/10 text-white/30 cursor-wait"
                        : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    }`}
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </div>
            )}

            {/* Status Messages */}
            {message && (
              <div
                className={`mt-4 p-3 rounded-lg text-xs font-medium text-center border animate-in fade-in duration-300 ${
                  message.includes("Error") || message.includes("not match")
                    ? "bg-red-500/10 border-red-500/20 text-red-200"
                    : "bg-blue-500/10 border-blue-500/20 text-blue-200"
                }`}
              >
                {message}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ChangePassword;
