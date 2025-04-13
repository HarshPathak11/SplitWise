import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import TripCard from "./tripCard"; // adjust path as needed

const TripsSection = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

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
          `http://192.168.56.1:8000/group/user-groups/${userId}`
        );
        setTrips(response.data || []);
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

  return (
    <div className="backdrop-blur-lg bg-gray-800/30 p-3 sm:p-4 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 flex-1">
      <div className="flex justify-between items-center mb-2 sm:mb-3">
        <h2 className="text-lg sm:text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#00F5FF] to-[#00FFA3]">
          Trips & Events
        </h2>

        <div className="flex gap-2">
          <Link to="/allTrips">
            <button
              type="button"
              className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors mt-1"
              title="Show All Trips"
            >
              Show All
            </button>
          </Link>

          <Link to="/addTrip">
            <button
              type="button"
              className="p-2 rounded-full bg-blue-600 hover:bg-blue-800 text-white transition-colors"
              title="Add Trip"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </Link>
        </div>
      </div>

      <div className="space-y-2 cursor-pointer overflow-y-auto">
        {loading ? (
          <p className="text-blue-400 text-center">Loading trips...</p>
        ) : trips.length === 0 ? (
          <p className="text-red-500 text-center font-semibold">
            No trips found.
          </p>
        ) : (
          trips.map((trip) => (
            <TripCard
              key={trip._id}
              trip={trip}
              onClick={() => handleTripClick(trip)}
            />
          ))
        )}
      </div>

      {/* {!loading && trips.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700/50">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">Total Spent on Trips:</p>
            <p className="text-lg font-bold text-green-400">
              ₹
              {trips
                .reduce((sum, trip) => sum + (trip.totalAmount || 0), 0)
                .toLocaleString()}
            </p>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default TripsSection;
