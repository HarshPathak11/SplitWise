import { FaHome } from "react-icons/fa"; // Import the home icon
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

const Features = () => {
  const navigate = useNavigate(); // Initialize the navigation hook

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Back to Landing Page Icon */}
      <div className="absolute cursor-pointer mt-3.5 z-50 top-4 left-4">
        <button
          onClick={() => navigate("/")} // Navigate to the landing page route
          className="p-2 rounded-full shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-105 transition-transform duration-300 ease-in-out"
          title="Back to Landing Page"
        >
          <FaHome className="text-white text-xl" />
        </button>
      </div>

      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-30">
          <div className="absolute top-0 -left-4 w-48 sm:w-72 h-48 sm:h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-48 sm:w-72 h-48 sm:h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
          <div className="absolute -bottom-8 right-10 w-48 sm:w-72 h-48 sm:h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Title Section */}
      <h1 className="text-center text-3xl mt-8 sm:text-5xl font-extrabold mb-8 sm:mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 animate-text">
        Explore Our Features
      </h1>

      {/* Features Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Feature 1 */}
        <div className="glass-container text-center p-6 sm:p-8 rounded-lg shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-105 transition-transform duration-300 ease-in-out  ">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">
            Interactive Event Cards
          </h2>
          <p className="text-sm sm:text-lg">
            Event cards with detailed information and interactivity make it easier to track expenses.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="glass-container text-center p-6 sm:p-8 rounded-lg shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-105 transition-transform duration-300 ease-in-out">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">
            Unlimited Events
          </h2>
          <p className="text-sm sm:text-lg">
            Unlike Splitwise, our app allows users to create unlimited events without restrictions.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="glass-container text-center p-6 sm:p-8 rounded-lg shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-105 transition-transform duration-300 ease-in-out">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">
            Expense Tracking
          </h2>
          <p className="text-sm sm:text-lg">
            Detailed expense tracking with categories, descriptions, and beneficiaries.
          </p>
        </div>

        {/* Feature 4 */}
        <div className="glass-container text-center p-6 sm:p-8 rounded-lg shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-105 transition-transform duration-300 ease-in-out">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">
            Transparent Pricing
          </h2>
          <p className="text-sm sm:text-lg">
            Clear and straightforward pricing plans (free and premium) make it easier for users to understand the value proposition.
          </p>
        </div>

        {/* Feature 5 */}
        <div className="glass-container text-center p-6 sm:p-8 rounded-lg shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-105 transition-transform duration-300 ease-in-out">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">
            Trip Management
          </h2>
          <p className="text-sm sm:text-lg">
            Features for managing trips, including expense breakdowns, friend selection, and payment types (equal/unequal).
          </p>
        </div>

        {/* Feature 6 */}
        <div className="glass-container text-center p-6 sm:p-8 rounded-lg shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-105 transition-transform duration-300 ease-in-out">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">
            Enhanced Aesthetics
          </h2>
          <p className="text-sm sm:text-lg">
            A modern, visually appealing UI could attract users who value design and usability.
          </p>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-text {
          animation: text-flicker 1.5s infinite;
        }

        @keyframes text-flicker {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
};

export default Features;
