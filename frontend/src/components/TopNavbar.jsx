import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FaMandalorian } from "react-icons/fa";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { FaRobot } from "react-icons/fa";

const TopNavbar = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    Cookies.remove("id");
    Cookies.remove("last4");
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="backdrop-blur-lg bg-gray-800/30 p-3 sm:p-4 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
      <div className="flex justify-between items-center">
        <div>
          <Link to="/">
            <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00F5FF] to-[#00FFA3] hover:animate-text">
              Fair Fare
            </h1>
          </Link>
          <p className="text-sm sm:text-base text-gray-400">DashBoard</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex space-x-8">
            <Link to="/CashMapAI">
              <button
                className="p-2 shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 rounded-lg flex  hover:scale-105 transition-transform duration-300 ease-in-out "
                title="AI ChatBot"
              >
                Fair AI
                <FaRobot className="text-white text-xl mt-0.5 ml-2" />
              </button>
            </Link>
          </div>
          <div className="flex space-x-8">
            <Link to="/profile">
              <button
                className="p-2 rounded-full shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-105 transition-transform duration-300 ease-in-out"
                title="Edit Profile"
              >
                <FaMandalorian className="text-white text-xl" />
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
TopNavbar.propTypes = {
  handleSignOut: PropTypes.func.isRequired,
};

export default TopNavbar;
