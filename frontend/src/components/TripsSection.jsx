import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import TripCard from "./tripCard"; // adjust path as needed
import OptimizedList from "./OptimizedList";

const TripsSection = (user) => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Memoized trips processing
  const processedTrips = useMemo(() => {
    const response = user?.user?.groups || [];
    
    if (Array.isArray(response)) {
      // Sort by updatedAt in descending order and take top 3
      const sortedTrips = [...response].sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      return sortedTrips.slice(0, 3);
    }
    return [];
  }, [user?.user?.groups]);

  // Update trips when processed data changes
  useEffect(() => {
    setTrips(processedTrips);
    setLoading(false);
  }, [processedTrips]);

  // Memoized trip click handler
  const handleTripClick = useCallback((trip) => {
    navigate(`/tripDetails/${trip._id}`);
  }, [navigate]);

  // Memoized render function for trip cards
  const renderTripCard = useCallback((trip) => (
    <TripCard
      amount={trip.tripTotal}
      trip={trip}
      onClick={() => handleTripClick(trip)}
    />
  ), [handleTripClick]);

  // Key extractor for better performance
  const keyExtractor = useCallback((trip) => trip._id, []);

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

      <div className="cursor-pointer overflow-y-auto">
        <OptimizedList
          items={trips}
          renderItem={renderTripCard}
          keyExtractor={keyExtractor}
          loading={loading}
          loadingMessage="Loading trips..."
          emptyMessage="Get a life add some trips."
          onItemClick={handleTripClick}
          spacing="space-y-2"
        />
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
