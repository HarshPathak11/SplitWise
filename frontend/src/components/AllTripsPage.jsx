import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TripCard from "./tripCard"; // Ensure this component is styled properly
import { FaArrowLeft } from "react-icons/fa";
import Cookies from "js-cookie"; // Import Cookies library
import axios from "axios"; // Import Axios library

const AllTripsPage = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // 🔍 Search query state

  // Fetch trips for the current user
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const userId = Cookies.get("id"); // user ID stored in cookies as "id"

        if (!userId) {
          console.error("User ID not found in cookies.");
          return;
        }

        const response = await axios.get(
          `http://192.168.156.226:8000/group/user-groups/${userId}`
        );

        if (Array.isArray(response.data)) {
          // Sort expenses by createdAt in descending order (most recent first)
          const sortedTrips = [...response.data].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          // Take the top 4 expenses after sorting.
          const topTrips = sortedTrips.slice(0, 4);
          setTrips(topTrips);
        }
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const handleTripClick = (trip) => {
    navigate(`/tripDetails/${trip._id}`);
  };

  // Filtered trips based on search
  const filteredTrips = trips.filter((trip) =>
    trip.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#000000] text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="w-[500px] h-[500px] bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-30 animate-move"></div>
        <div className="w-[400px] h-[400px] bg-gradient-to-r from-blue-500 to-green-500 rounded-full blur-3xl opacity-30 animate-rotate delay-2000"></div>
        <div className="w-[600px] h-[600px] bg-gradient-to-r from-yellow-500 to-red-500 rounded-full blur-3xl opacity-30 animate-move delay-4000"></div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-lg opacity-50 animate-bounce"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full blur-lg opacity-50 animate-bounce delay-3000"></div>
      </div>

      {/* Back Button */}
      <div className="absolute cursor-pointer mt-3.5 z-50 top-4 left-4">
        <button
          onClick={() => navigate("/dash")} // Navigate to the dashboard
          className="p-2 rounded-full shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-105 transition-transform duration-300 ease-in-out"
          title="Back to Dashboard"
        >
          <FaArrowLeft className="text-white text-xl" />
        </button>
      </div>

      {/* Header */}
      <div className="relative z-10 max-w-4xl mx-auto mt-10">
        <h1 className="text-3xl font-bold text-center text-[#00F5FF] mb-6">
          Your Trips and Events
        </h1>
        <p className="text-center text-white mb-8">
          View all the trips and events you’ve created or participated in.
        </p>
      </div>

      <div className="z-10 relative max-w-4xl mx-auto mb-6 px-4">
        <input
          type="text"
          placeholder="Search by trip name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-700/50 backdrop-blur-sm text-white border border-gray-600/30 rounded-lg p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
        />
      </div>

      {/* Trips and Events List */}
      <div className="flex-1 max-w-4xl cursor-pointer space-y-2 mx-auto w-full p-4 overflow-y-auto z-10 relative">
        {loading ? (
          <p className="text-blue-400 text-center">Loading trips...</p>
        ) : trips.length === 0 ? (
          <p className="text-red-500 text-center font-semibold">
            No trips found.
          </p>
        ) : (
          filteredTrips.map((trip) => (
            <TripCard
              key={trip._id}
              amount={trip.tripTotal}
              trip={trip}
              onClick={() => handleTripClick(trip)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default AllTripsPage;
