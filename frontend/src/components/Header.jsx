import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { FaArrowAltCircleLeft } from "react-icons/fa";

export default function Header({ title, backPath }) {
  const navigate = useNavigate();
  const location = useLocation();

   const currentState = location.state || {};

  return (
    <div className="backdrop-blur-xl bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-blue-900/40 p-3 sm:p-4 border-b border-white/20 shadow-2xl transition-all duration-500">
      <div className="flex items-center justify-between">
        {backPath ? (
          <button
            onClick={() => navigate(-1, {
              state: currentState
            })}
            className="p-2 sm:p-3 shadow-lg sm:shadow-2xl backdrop-blur-md sm:backdrop-blur-lg bg-gradient-to-br from-indigo-500/30 to-purple-600/30 border border-white/30 sm:border-2 hover:from-indigo-600/40 hover:to-purple-700/40 rounded-lg sm:rounded-xl hover:scale-105 sm:hover:scale-110 transition-all duration-300 ease-in-out transform hover:shadow-purple-500/20"
            aria-label="Go back"
          >
            <FaArrowAltCircleLeft className="text-white text-xl sm:text-2xl" />
          </button>
        ) : (
          <div className="w-8 h-8 sm:w-12 sm:h-12"></div>
        )}

        <h1 className="font-bold text-white text-lg sm:text-xl md:text-2xl bg-gradient-to-r from-indigo-600/30 to-purple-600/30 px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-xl sm:rounded-2xl backdrop-blur-lg sm:backdrop-blur-xl border border-white/30 sm:border-2 shadow-md sm:shadow-lg max-w-xs truncate sm:max-w-none sm:truncate-0 text-center mx-2">
          {title}
        </h1>

        <div className="w-8 h-8 sm:w-12 sm:h-12"></div>
      </div>
    </div>
  );
}

Header.propTypes = {
  title: PropTypes.string.isRequired,
  backPath: PropTypes.string,
};