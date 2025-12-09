import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { ArrowLeft, Mail, KeyRound, ShieldCheck, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

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
      const response = await api.post(`${API_BASE}/user/forgot-password`, {
        email,
      });
      if (response.status === 200) {
        setOtpSent(true);
        setOtpGenerated(response.data.otp);
      }
    } catch (error) {
      toast.error("Failed to send OTP.");
      // console.log("error is ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const response = await api.post(
        `${API_BASE}/user/verify-forgot-password`,
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
      toast.error("OTP verification failed.");
      // console.log("error is ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans relative flex items-center justify-center overflow-hidden p-4">
      {/* --- BACKGROUND FX --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      {/* --- BACK BUTTON --- */}
      <div className="absolute top-6 left-6 z-50">
        <button
          onClick={() => navigate("/login")}
          className="group p-3 rounded-full bg-zinc-900/50 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all duration-300 backdrop-blur-md shadow-lg"
          title="Abort Recovery"
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
            Recovery Protocol
          </h2>
          <p className="text-sm text-zinc-500 font-mono mt-2">
            {otpSent ? "ENTER VERIFICATION CODE" : "AUTHENTICATE IDENTITY"}
          </p>
        </div>

        {/* Form Area */}
        <div className="space-y-4">
          {/* Email Input */}
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
                disabled={otpSent} // Disable if OTP sent to prevent changing email mid-flow
                className={`w-full bg-zinc-950/50 border text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono text-sm ${
                  otpSent
                    ? "border-zinc-800 text-zinc-500 cursor-not-allowed"
                    : "border-white/10 focus:border-indigo-500"
                }`}
              />
            </div>
          </div>

          {/* OTP Input (Conditionally Rendered) */}
          {otpSent && (
            <div className="space-y-1 animate-in slide-in-from-bottom-2 fade-in">
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
                  className="w-full bg-zinc-950/50 border border-white/10 text-white pl-10 pr-4 py-3 rounded-xl focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono text-sm tracking-widest"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4">
            {!otpSent ? (
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Transmitting..." : "Send Secure OTP"}
              </button>
            ) : (
              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Verifying..." : "Confirm & Reset"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
