import { FaHourglassHalf } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function ComingSoon() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-black to-gray-900 text-white p-6">
      {/* Logo / Heading */}
      <h1 className="text-4xl md:text-5xl font-bold mb-4">🚀 FairFare</h1>
      <h2 className="text-2xl md:text-3xl font-semibold mb-2">
        This Feature is Coming Soon!
      </h2>

      {/* Joke / Tagline */}
      <p className="text-lg md:text-xl text-gray-300 max-w-lg text-center mb-6">
        Good things take time… and so does this feature.  
        (We promise it won’t take as long as waiting for your Uber in rush hour 🛵💨)
      </p>

      {/* Icon animation */}
      <FaHourglassHalf className="text-5xl animate-pulse mb-6 text-yellow-400" />

      {/* Optional Notify Button */}
      <Link to="/dash">
      <button className="px-6 py-2 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition">
        Take me back to dashboard
      </button>
      </Link>
    </div>
  );
}
