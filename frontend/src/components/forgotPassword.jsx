import { useState } from "react";
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
      // console.log("response.data:",response.data);
      if (response.status === 200) {
        const { user, token } = response.data;
        if (token) {
          Cookies.set("authToken", token, {
            expires: 7,
            secure: true,
            sameSite: "strict",
          });
        }
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
    <div className="relative min-h-screen w-full bg-[#0a0a0a] overflow-hidden flex items-center justify-center selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* --- BACKGROUND: The Digital Aurora (Matched to SignUp) --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] bg-fuchsia-900/20 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
        {/* Noise overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]"></div>
      </div>

      {/* --- NAVIGATION: Back Button --- */}
      <div className="absolute top-8 left-8 z-50">
        <button
          onClick={() => navigate("/login")}
          className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
          <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
            Back to Login
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
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Recovery Protocol
            </h1>
            <p className="text-white/40 text-sm mt-2">
              {otpSent
                ? "Enter the verification code sent to your email."
                : "Authenticate your identity to reset password."}
            </p>
          </div>

          <div className="space-y-5">
            {/* Step 1: Email Input */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white/70 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  disabled={otpSent}
                  placeholder="name@example.com"
                  className={`w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/20 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all ${
                    otpSent ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
              </div>
            </div>

            {/* Step 2: OTP Input (Slide in) */}
            {otpSent && (
              <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-sm font-medium text-emerald-400">
                    Verification Code Sent
                  </span>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider ml-1">
                    One-Time Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                      <KeyRound size={18} />
                    </div>
                    <input
                      value={otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, ""); // remove non-digits
                        if (val.length <= 6) setOtp(val);
                      }}
                      type="text"
                      placeholder="• • • • • •"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white tracking-[0.2em] font-mono text-lg placeholder-white/10 focus:outline-none focus:bg-white/10 focus:border-indigo-500/50 transition-all"
                      autoFocus
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2">
              {!otpSent ? (
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
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    {loading ? "Transmitting..." : "Send Secure OTP"}
                  </span>
                </button>
              ) : (
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
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    {loading ? "Verifying..." : "Confirm & Reset"}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Styles for animation (Matched to SignUp) */}
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

export default ForgotPassword;
