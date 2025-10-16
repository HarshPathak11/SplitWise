import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FaUser, FaChartBar } from "react-icons/fa";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { FaRobot } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import dashboardLogo from "../../public/dashboardLogo.png";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const TopNavbar = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const userId = Cookies.get("id");
    const response = await axios.post(`${API_BASE}/user/remove-fcm-token`, {
      userId: userId,
    });

    if (response.status === 200) {
      Cookies.remove("id");
      Cookies.remove("last4");
      localStorage.clear();
      navigate("/");
    } else {
      toast.error("Error signing out. Please try again.");
    }
  };

  return (
    <div className="backdrop-blur-lg bg-gray-800/30 p-3 sm:p-4 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
      <div className="flex justify-between items-center">
        <div>
          <Link to="/">
            <img
              src={dashboardLogo}
              alt="Fair Fare Dashboard"
              className="rounded-xl"
            />
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/analytics">
            <button
              className=" p-2 shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 
             rounded-lg flex items-center justify-center
              hover:scale-105 transition-transform duration-300 ease-in-out"
              title="Analytics Dashboard"
            >
              Analytics
              <FaChartBar className="text-white text-2xl pl-2" />
            </button>
          </Link>
          <div className="flex space-x-8">
            <Link to="/FairAI">
              <button
                className="p-2 shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 
             rounded-lg flex items-center justify-center 
             hover:scale-105 transition-transform duration-300 ease-in-out"
                title="AI ChatBot"
              >
                <FaRobot className="text-white text-2xl ml-1 mr-1" />
              </button>
            </Link>
          </div>
          <div className="flex space-x-8">
            <Link to="/profile">
              <button
                className="p-2 rounded-full shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-105 transition-transform duration-300 ease-in-out"
                title="Edit Profile"
              >
                <FaUser className="text-white text-xl" />
              </button>
            </Link>
          </div>

          {/* Sign Out Button */}
          <div
            onClick={handleSignOut}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
// TopNavbar.propTypes = {
//   handleSignOut: PropTypes.func.isRequired,
// };

export default TopNavbar;
