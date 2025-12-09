import React, { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { FaHome } from "react-icons/fa";
import logo from "../../public/newIcon-192x192.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";
const API_BASE = import.meta.env.VITE_API_BASE_URL;
import { toast } from "react-hot-toast";
import api from "../utils/api";

const LogIn = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false); // NEW state
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get("redirect") || "/dash"; // fallback to dashboard or home

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
      toast.error("Login failed");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] overflow-hidden flex items-center justify-center selection:bg-purple-500/30 selection:text-purple-200">
      {/* --- BACKGROUND: The Digital Aurora --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-blue-900/20 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
        {/* Starfield overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]"></div>
      </div>

      {/* --- NAVIGATION: Floating Home Button --- */}
      <div className="absolute top-8 left-8 z-50">
        <button
          onClick={() => navigate("/")}
          className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-md"
        >
          <FaHome className="text-white/70 group-hover:text-white transition-colors" />
          <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
            Back
          </span>
        </button>
      </div>

      {/* --- MAIN CARD: The Portal --- */}
      <div className="relative z-10 w-full max-w-md p-1">
        {/* Glowing Border Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-3xl blur-sm opacity-50 pointer-events-none"></div>

        <div className="relative mb-3 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl ring-1 ring-white/5">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-white/10 to-transparent border border-white/10 mb-6 shadow-lg">
              <img
                src={logo}
                alt="FairFare"
                className="w-6 h-6 object-contain drop-shadow-md"
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
              Welcome Back
            </h1>
            <p className="text-white/40 text-sm">
              Enter your credentials to access the vault.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-1">
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
            </div>

            {/* Password Input */}
            <div className="space-y-1">
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
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
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
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`relative w-full overflow-hidden rounded-xl py-4 font-semibold text-sm tracking-wide transition-all duration-300 
                ${
                  loading
                    ? "bg-white/10 text-white/30 cursor-wait"
                    : "bg-white text-black hover:bg-white/90 hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                }`}
            >
              <span className="relative z-10">
                {loading ? "Authenticating..." : "Sign In"}
              </span>
            </button>
          </form>
        </div>

        {/* Footer Text */}
        <p className="text-center text-white/20 text-xs">
          Secured by FairFare Identity Services
        </p>
      </div>

      {/* Animation Styles */}
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

export default LogIn;
