import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FaUser, FaChartBar, FaRobot, FaSignOutAlt } from "react-icons/fa";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import dashboardLogoNew from "../../public/dashboardLogoNew.png";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const TopNavbar = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const userId = Cookies.get("id");
    try {
      const response = await axios.post(`${API_BASE}/user/remove-fcm-token`, {
        userId: userId,
      });

      if (response.status === 200) {
        Cookies.remove("id");
        Cookies.remove("last4");
        localStorage.clear();
        navigate("/");
        toast.success("Signed out successfully");
      }
    } catch (error) {
      console.error("Sign out error", error);
      toast.error("Error signing out. Please try again.");
    }
  };

  return (
    <nav className="w-full bg-zinc-900/80 backdrop-blur-xl border border-white/5 rounded-2xl px-4 py-3 flex justify-between items-center shadow-lg shadow-black/20">
      {/* --- Brand Logo --- */}
      <div className="flex-shrink-0">
        <Link to="/" className="block relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
          <img
            src={dashboardLogoNew}
            alt="Fair Fare Dashboard"
            className="relative h-10 w-auto object-contain rounded-lg"
          />
        </Link>
      </div>

      {/* --- Action Center --- */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* 1. App Tools Group */}
        <div className="flex items-center gap-2">
          <Link to="/analytics">
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition-all duration-300 group"
              title="Analytics Dashboard"
            >
              <span className="hidden md:block text-sm font-medium">
                Analytics
              </span>
              <FaChartBar className="text-lg group-hover:scale-110 transition-transform" />
            </button>
          </Link>

          <Link to="/FairAI">
            <button
              className="p-2.5 rounded-xl bg-zinc-800/50 border border-white/5 text-zinc-400 hover:text-white hover:bg-gradient-to-br hover:from-purple-500/20 hover:to-pink-500/20 hover:border-purple-500/30 transition-all duration-300 group relative overflow-hidden"
              title="FairAI Assistant"
            >
              <FaRobot className="text-xl group-hover:animate-pulse" />
            </button>
          </Link>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-white/10 mx-1"></div>

        {/* 2. User Actions Group */}
        <div className="flex items-center gap-2">
          <Link to="/profile">
            <button
              className="p-2.5 rounded-xl bg-transparent hover:bg-white/5 text-zinc-400 hover:text-white border border-transparent hover:border-white/5 transition-all duration-200"
              title="Edit Profile"
            >
              <FaUser className="text-lg" />
            </button>
          </Link>

          <button
            onClick={handleSignOut}
            className="p-2.5 rounded-xl bg-transparent hover:bg-red-500/10 text-zinc-400 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all duration-200"
            title="Sign Out"
          >
            <FaSignOutAlt className="text-lg" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;
