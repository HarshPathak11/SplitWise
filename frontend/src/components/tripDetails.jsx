import { useLocation, useNavigate } from "react-router-dom";

const TripDetails = () => {
  const location = useLocation(); // Access the passed trip details
  const navigate = useNavigate();
  const { trip } = location.state || {}; // Destructure the trip object

  if (!trip) {
    return (
      <div className="text-center text-red-500 font-semibold mt-10">
        No trip details found. <br />
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Go Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">{trip.name}</h1>
      <p className="text-gray-400 mb-2">Date: {trip.date}</p>
      <p className="text-gray-400 mb-4">
        Total Amount: ₹{trip.totalAmount.toLocaleString()}
      </p>
      <h2 className="text-xl font-semibold mb-3">Friends in this Trip</h2>
      <div className="space-y-3">
        {trip.friends.map((friend, index) => (
          <div
            key={index}
            className="bg-gray-700/50 p-3 rounded-lg border border-gray-600/30 flex justify-between items-center"
          >
            <p className="text-sm text-white">{friend.name}</p>
            <p
              className={`text-sm ${
                friend.balance > 0
                  ? "text-green-400"
                  : friend.balance < 0
                  ? "text-red-400"
                  : "text-gray-400"
              }`}
            >
              {friend.balance > 0
                ? `Owes you ₹${friend.balance}`
                : friend.balance < 0
                ? `You owe ₹${Math.abs(friend.balance)}`
                : "Settled"}
            </p>
          </div>
        ))}
      </div>
      <button
        onClick={() => navigate("/dash")}
        className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default TripDetails;
