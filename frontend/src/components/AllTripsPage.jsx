import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TripCard from "./tripCard"; // Adjust the path as needed

const AllTripsPage = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    // Example: fetch trips from backend API
    const fetchTrips = async () => {
      try {
        const response = await fetch("/api/user/trips");
        const data = await response.json();
        setTrips(data);
      } catch (error) {
        console.error("Error fetching trips:", error);
      }
    };

    fetchTrips();
  }, []);

  const handleTripClick = (trip) => {
    navigate("/tripDetails", { state: { trip } });
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-4">All Trips & Events</h1>

      {trips.length === 0 ? (
        <p className="text-red-500 text-center font-semibold">
          No trips found.
        </p>
      ) : (
        <div className="space-y-3">
          {trips.map((trip) => (
            <TripCard
              key={trip._id || trip.id} // Adjust according to actual ID field
              trip={trip}
              onClick={() => handleTripClick(trip)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AllTripsPage;
