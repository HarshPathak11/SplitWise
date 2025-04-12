import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import TripCard from "./tripCard"; // Adjust the path if needed

const TripsSection = () => {
  const navigate = useNavigate();
  const [trips] = useState([
    {
      id: 1,
      name: "Goa Trip",
      date: "15-20 May 2023",
      totalAmount: 25000,
      participants: 5,
      friends: [
        { name: "Alice", balance: 500 },
        { name: "Bob", balance: -300 },
        { name: "Charlie", balance: 0 },
      ],
    },
    {
      id: 2,
      name: "Weekend Getaway",
      date: "10-12 Aug 2023",
      totalAmount: 12000,
      participants: 3,
      friends: [
        { name: "John", balance: 200 },
        { name: "Jane", balance: -150 },
      ],
    },
    {
      id: 3,
      name: "Birthday Party",
      date: "5 Sep 2023",
      totalAmount: 8000,
      participants: 8,
      friends: [
        { name: "John", balance: 200 },
        { name: "Jane", balance: -150 },
      ],
    },
  ]);

  // Function to handle trip click
  const handleTripClick = (trip) => {
    navigate("/tripDetails", { state: { trip } }); // Pass trip details to TripDetails page
  };

  return (
    <div className="backdrop-blur-lg bg-gray-800/30 p-3 sm:p-4 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 flex-1">
      <div className="flex justify-between items-center mb-2 sm:mb-3">
        <h2 className="text-lg sm:text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Trips & Events
        </h2>

        <div className="flex gap-2">
          <Link to="/allTrips">
            <button
              type="button"
              className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
              title="Show All Trips"
            >
              Show All
            </button>
          </Link>

          <Link to="/addTrip">
            <button
              type="submit"
              className="p-2 rounded-full bg-green-600 hover:bg-green-700 text-white transition-colors"
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
        {trips.length === 0 ? (
          <p className="text-red-500 text-center font-semibold">
            No trips found.
          </p>
        ) : (
          trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onClick={() => handleTripClick(trip)}
            />
          ))
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-700/50">
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium">Total Spent on Trips:</p>
          <p className="text-lg font-bold text-green-400">
            ₹
            {trips
              .reduce((sum, trip) => sum + trip.totalAmount, 0)
              .toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TripsSection;
