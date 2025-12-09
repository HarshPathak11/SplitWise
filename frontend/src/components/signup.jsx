import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import logo from "../../public/newIcon-192x192.png";
import { FaHome } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const SignUp = () => {
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        `${API_BASE}/user/send-otp`,
        // "//http://localhost:8000/user/send-otp",
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
        toast.error("Email already Taken!");
      } else if (error.response && error.response.status === 400) {
        toast.error("Username already Taken!");
      } else {
        toast.error("Failed to send OTP.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    try {
      const response = await axios.post(
        `${API_BASE}/user/verify-otp`,
        // "//http://localhost:8000/user/verify-otp",
        {
          email,
          otp,
          otpGenerated,
          password,
          username,
        }
      );

       if (response.status === 200) {
        const { _id, token } = response.data; // ✅ token expected from backend

        // existing behaviour: keep this
        Cookies.set("id", _id, { expires: 7 });

        // ✅ NEW: store JWT in a secure cookie (frontend-readable)
        if (token) {
          Cookies.set("authToken", token, {
            expires: 7,
            secure: true,
            sameSite: "strict",
          });
        }

        navigate("/profile");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("OTP verification failed.");
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
          onClick={() => navigate("/")}
          className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-md"
        >
          <FaHome className="text-white/70 group-hover:text-white transition-colors" />
          <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
            Home
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
              <img
                src={logo}
                alt="FairFare"
                className="w-6 h-6 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Create Account
            </h1>
            <p className="text-white/40 text-sm mt-2">
              Join the future of social finance.
            </p>
          </div>

          <div className="space-y-5">
            {/* Step 1: User Details (Hide if OTP sent to focus on verification, or keep visible disabled) */}
            <div
              className={`space-y-4 transition-all duration-500 ${
                otpSent
                  ? "opacity-50 pointer-events-none grayscale"
                  : "opacity-100"
              }`}
            >
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider ml-1">
                  Full Name
                </label>
                <input
                  value={username}
                  onChange={(e) => setUserName(e.target.value)}
                  type="text"
                  placeholder="John Doe"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider ml-1">
                  Email
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="name@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider ml-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all pr-10"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? (
                      <FaEyeSlash size={16} />
                    ) : (
                      <FaEye size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2: OTP Verification (Slide in) */}
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
                    Enter OTP
                  </label>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    type="text"
                    placeholder="• • • • • •"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center tracking-[0.5em] font-mono text-lg placeholder-white/10 focus:outline-none focus:bg-white/10 focus:border-indigo-500/50 transition-all"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={otpSent ? handleOtpVerify : handleOtpSend}
              disabled={loading}
              className={`relative w-full overflow-hidden rounded-xl py-4 font-semibold text-sm tracking-wide transition-all duration-300 mt-2
                ${
                  loading
                    ? "bg-white/10 text-white/30 cursor-wait"
                    : otpSent
                    ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                    : "bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                }`}
            >
              <span className="relative z-10">
                {loading
                  ? "Processing..."
                  : otpSent
                  ? "Verify & Complete"
                  : "Send Verification Code"}
              </span>
            </button>

            {/* Footer */}
            <div className="text-center pt-2">
              <span className="text-white/40 text-sm">
                Already have an account?{" "}
              </span>
              <Link
                to="/login"
                className="text-white font-medium hover:underline decoration-white/30 underline-offset-4"
              >
                Log In
              </Link>
            </div>
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

export default SignUp;
