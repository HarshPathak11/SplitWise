import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const TripDetails = () => {
  const location = useLocation(); // Access the passed trip details
  const navigate = useNavigate();
  const initialTrip = {name:"Goa_trip" , description:"this is the desvciption"}; // Destructure the trip object
  const [trip, setTrip] = useState(initialTrip); // Use state to manage trip data
  const [newExpense, setNewExpense] = useState({ amount: 0 }); // State for new expense
  const [showExpenses, setShowExpenses] = useState(false);

  // if (!trip) {
  //   return (
  //     <div className="text-center text-red-500 font-semibold mt-10">
  //       No trip details found. <br />
  //     </div>
  //   );
  // }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white min-h-screen p-6 flex items-center justify-center">
      
      <div className="absolute top-4 left-4">
        <button
          onClick={() => navigate("/dash")}
          className="p-2 rounded-full shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-110 transition-transform duration-300 ease-in-out"
          title="Back to Dashboard"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 sm:h-6 sm:w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>
      
      <div className="w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{trip.name}</h1>
          <button
            onClick={() => navigate("/addExpense")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Add Expense
          </button>
        </div>
        <p className="text-gray-400 mb-2">
          Description: {trip.description || "No description available."}
        </p>

        <div>
          <h2
            className="text-xl font-semibold mb-3 cursor-pointer"
            onClick={() => setShowExpenses(!showExpenses)}
          >
            Expense Breakdown
          </h2>
          {showExpenses && (
            <div className="space-y-3">
              {trip.expenses && trip.expenses.length > 0 ? (
                trip.expenses.map((expense, index) => (
                  <div
                    key={index}
                    className="bg-gray-700/50 p-3 rounded-lg border border-gray-600/30 flex justify-between items-center"
                  >
                    <p className="text-sm text-white">{expense.description}</p>
                    <p className="text-sm text-white">₹{expense.amount}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No expenses recorded.</p>
              )}
            </div>
          )}

          <button
            onClick={() => navigate("/dash")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
            Go Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;
