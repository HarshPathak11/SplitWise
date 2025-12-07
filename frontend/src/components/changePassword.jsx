import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Loader2,
  Save,
} from "lucide-react";
import Cookies from "js-cookie";
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans relative flex items-center justify-center overflow-hidden p-4">
      {/* --- BACKGROUND FX --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      {/* --- BACK BUTTON --- */}
      <div className="absolute top-6 left-6 z-50">
        <button
          onClick={() => navigate("/profile")}
          className="group p-3 rounded-full bg-zinc-900/50 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all duration-300 backdrop-blur-md shadow-lg"
          title="Return to Profile"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
        </button>
      </div>

      {/* --- MAIN CARD --- */}
      <div className="relative z-10 w-full max-w-md bg-zinc-900/60 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-black/50 animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-zinc-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5 shadow-inner">
            <ShieldCheck size={32} className="text-indigo-400" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">
            Security Update
          </h2>
          <p className="text-sm text-zinc-500 font-mono mt-2 uppercase tracking-wide">
            {!otpSent && !isOtpVerified
              ? "Phase 1: Verification"
              : !isOtpVerified
              ? "Phase 2: Authentication"
              : "Phase 3: New Credentials"}
          </p>
        </div>

        <div className="space-y-4">
          {/* STEP 1: Email Input */}
          {!otpSent && !isOtpVerified && (
            <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    placeholder="user@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950/50 border border-white/10 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all font-mono text-sm"
                    required
                  />
                </div>
              </div>
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Transmitting..." : "Send Verification Code"}
              </button>
            </div>
          )}

          {/* STEP 2: OTP Input */}
          {otpSent && !isOtpVerified && (
            <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">
                  One-Time Password
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-cyan-400 transition-colors">
                    <KeyRound size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="######"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-zinc-950/50 border border-white/10 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono text-sm tracking-widest"
                    required
                  />
                </div>
              </div>
              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Verifying..." : "Verify Identity"}
              </button>
            </div>
          )}

          {/* STEP 3: New Password */}
          {isOtpVerified && (
            <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
              {/* New Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">
                  New Password
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-400 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword1 ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-zinc-950/50 border border-white/10 text-white pl-10 pr-10 py-3 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono text-sm"
                    required
                  />
                  <button
                    onClick={() => setShowPassword1(!showPassword1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  >
                    {showPassword1 ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-400 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword2 ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-zinc-950/50 border border-white/10 text-white pl-10 pr-10 py-3 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono text-sm"
                    required
                  />
                  <button
                    onClick={() => setShowPassword2(!showPassword2)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  >
                    {showPassword2 ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Save size={16} /> Update Credentials
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* --- STATUS MESSAGE --- */}
        {message && (
          <div
            className={`mt-6 p-3 rounded-xl text-center text-sm font-medium border animate-in slide-in-from-bottom-2 ${
              message.includes("Error")
                ? "bg-red-500/10 border-red-500/20 text-red-400"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChangePassword;
