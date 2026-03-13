import React, { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { FaHome } from "react-icons/fa";
import logo from "../../public/newIconV3-192x192.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";
const API_BASE = import.meta.env.VITE_API_BASE_URL;
import { toast } from "react-hot-toast";
import api from "../utils/api";
import { auth, googleProvider } from "../../firebase";
import { signInWithPopup } from "firebase/auth";
import { motion } from "framer-motion";

const handleScrollTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
};

const LogIn = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false); // NEW state
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get("redirect") || "/dash"; // fallback to dashboard or home

  useEffect(() => {
    handleScrollTop();
  }, []);

  //UseEffect to Check if user logged in before or not if yes then directly take them to dashboard
  useEffect(() => {
    async function getDetails() {
      const userId = Cookies.get("id");
      if (userId) {
        try {
          navigate("/dash");
        } catch (err) {
          console.error("Error fetching user:", err);
        }
      }
    }

    getDetails();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!email || !password) {
        toast.error("Please fill in all fields.");
        return;
      }

      setLoading(true); // Start loading
      const response = await axios.post(`${API_BASE}/user/login`, {
        email,
        password,
      });

      if (response.data.user) {
        const { user, token } = response.data; // ✅ token expected from backend

        // existing behaviour
        Cookies.set("id", user._id, { expires: 7 });

        // ✅ NEW: store JWT securely
        if (token) {
          Cookies.set("authToken", token, {
            expires: 7,
            secure: true,
            sameSite: "strict",
          });
        }

        navigate(redirectPath);
      }
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const response = await api.post(`/user/google-auth`, {
        idToken,
      });

      if (response.status === 200) {
        const { id, token } = response.data;

        // Set cookies
        if (id) Cookies.set("id", id, { expires: 7 });
        if (token) {
          Cookies.set("authToken", token, {
            expires: 7,
            secure: true,
            sameSite: "strict",
          });
        }

        toast.success("Successfully logged in with Google!");
        navigate(redirectPath);
      }
    } catch (error) {
      console.error("Google Auth Error:", error);
      toast.error(error.response?.data?.message || "Google Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] overflow-hidden flex items-center justify-center selection:bg-purple-500/30 selection:text-purple-200">
      {/* --- BACKGROUND: The Digital Aurora --- */}
      <div className="absolute inset-0 z-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse-slow"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.3 }}
          className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-900/20 rounded-full blur-[120px] animate-pulse-slow delay-1000"
        />
        {/* Starfield overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]"></div>
      </div>

      {/* --- NAVIGATION: Floating Home Button --- */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
        className="absolute top-8 left-8 z-50"
      >
        <button
          onClick={() => navigate("/")}
          className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-md"
        >
          <FaHome className="text-white/70 group-hover:text-white transition-colors" />
          <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
            Back
          </span>
        </button>
      </motion.div>

      {/* --- MAIN CARD: The Portal --- */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="relative z-10 w-full max-w-md p-1"
      >
        {/* Glowing Border Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-3xl blur-sm opacity-50 pointer-events-none"></div>

        <div className="relative mb-3 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl ring-1 ring-white/5">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.35 }}
            className="text-center mb-10"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1], delay: 0.4 }}
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-white/10 to-transparent border border-white/10 mb-6 shadow-lg"
            >
              <img
                src={logo}
                alt="FairFare"
                className="w-6 h-6 object-contain drop-shadow-md"
              />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
              Welcome Back
            </h1>
            <p className="text-white/40 text-sm">
              Enter your credentials to access the vault.
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
              className="space-y-1"
            >
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider ml-1">
                Email
              </label>
              <div className="relative group">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all duration-300"
                />
                {/* Subtle shine on hover */}
                <div className="absolute inset-0 rounded-xl ring-1 ring-white/0 group-hover:ring-white/10 pointer-events-none transition-all duration-300"></div>
              </div>
            </motion.div>

            {/* Password Input */}
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
              className="space-y-1"
            >
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider ml-1">
                Password
              </label>
              <div className="relative group">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all duration-300 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                >
                  {showPassword ? (
                    <FaEyeSlash size={18} />
                  ) : (
                    <FaEye size={18} />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="flex items-center justify-between pt-2"
            >
              <Link
                to="/signup"
                className="text-sm text-white/40 hover:text-white transition-colors"
              >
                Create account
              </Link>
              <Link
                to="/forgot-password"
                className="text-sm text-white/40 hover:text-white transition-colors"
              >
                Forgot password?
              </Link>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.75 }}
            >
              <button
                type="submit"
                disabled={loading}
                className={`relative w-full overflow-hidden rounded-xl py-4 font-semibold text-sm tracking-wide transition-all duration-300 
                ${loading
                    ? "bg-white/10 text-white/30 cursor-wait"
                    : "bg-white text-black hover:bg-white/90 hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                  }`}
              >
                <span className="relative z-10">
                  {loading ? "Authenticating..." : "Sign In"}
                </span>
              </button>
            </motion.div>

            {/* OR Divider */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.8 }}
              className="relative flex items-center py-2 transition-all duration-500"
            >
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink-0 mx-4 text-white/30 text-xs font-medium uppercase tracking-widest">
                OR
              </span>
              <div className="flex-grow border-t border-white/10"></div>
            </motion.div>

            {/* Google Signup Button */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.85 }}
            >
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className={`relative w-full overflow-hidden rounded-xl py-3.5 px-4 font-semibold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-3 border border-white/10 bg-white/5 hover:bg-white/10
                ${loading ? "opacity-50 cursor-not-allowed" : "hover:-translate-y-0.5"}`}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="text-white/90 font-medium">Continue with Google</span>
              </button>
            </motion.div>

          </form>
        </div>

        {/* Footer Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="text-center text-white/20 text-xs"
        >
          Secured by FairFare Identity Services
        </motion.p>
      </motion.div>

      {/* Animation Styles */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
      `}
      </style>
    </div>
  );
};

export default LogIn;
