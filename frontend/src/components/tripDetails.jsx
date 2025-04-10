import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios

const TripDetails = () => {
  const location = useLocation(); // Access the passed trip details
  const navigate = useNavigate();
  const initialTrip = location.state?.trip; // Destructure the trip object
  const [trip, setTrip] = useState(initialTrip); // Use state to manage trip data
  const [selectedFriends, setSelectedFriends] = useState([]); // State for selected friends
  const [paidBy, setPaidBy] = useState(""); // State for who paid
  const [newExpense, setNewExpense] = useState({ amount: 0 }); // State for new expense
  const [paymentType, setPaymentType] = useState("equal"); // State for payment type

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

  // Function to handle adding a new expense
  const handleAddExpense = async () => {
    try {
      const response = await axios.post("http://localhost:8000/api/expenses", {
        email: "user@example.com", // Replace with actual user email
        eventName: trip.name,
        eventDesc: selectedFriends.join(", "), // Use selected friends' names as description
        amt: newExpense.amount,
        paidBy: paidBy, // Who paid
        paidFor: selectedFriends, // Split with selected friends
        paymentType: paymentType, // Equal or Unequal
      });

      // Update the trip state with the new expense
      const updatedExpenses = [...trip.expenses, response.data]; // Assuming the response returns the new expense
      const updatedTrip = { ...trip, expenses: updatedExpenses };

      // Update friends' balances based on the payment type
      const amountPerFriend =
        paymentType === "equal"
          ? newExpense.amount / selectedFriends.length
          : newExpense.amount; // For unequal, you can customize this logic

      // Update balances for selected friends
      updatedTrip.friends.forEach((friend) => {
        if (selectedFriends.includes(friend.name)) {
          friend.balance = (friend.balance || 0) - amountPerFriend; // Deduct from the friend's balance
        }
      });

      // Set the updated trip state
      setTrip(updatedTrip);

      // Reset the input fields
      setNewExpense({ amount: 0 }); // Reset the input fields
      setSelectedFriends([]); // Reset selected friends
      setPaidBy(""); // Reset who paid
      setPaymentType("equal"); // Reset payment type
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  // Function to handle friend selection
  const handleFriendSelection = (friend) => {
    if (selectedFriends.includes(friend)) {
      setSelectedFriends(selectedFriends.filter((f) => f !== friend));
    } else {
      setSelectedFriends([...selectedFriends, friend]);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">{trip.name}</h1>
      <p className="text-gray-400 mb-2">
        Description: {trip.description || "No description available."}
      </p>
      <p className="text-gray-400 mb-4">Date: {trip.date}</p>
      <p className="text-gray-400 mb-4">
        Total Amount: ₹{trip.totalAmount.toLocaleString()}
      </p>

      <h2 className="text-xl font-semibold mb-3">Expense Breakdown</h2>
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

      {/* Add Expense Section */}
      <h2 className="mt-4 text-lg font-semibold">Add Expense</h2>
      <div className="mt-2">
        <input
          type="text"
          placeholder="Enter a description"
          className="p-2 rounded-lg bg-gray-700 border border-gray-600 text-white w-full"
          onChange={(e) =>
            setNewExpense({ ...newExpense, description: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Amount"
          value={newExpense.amount}
          onChange={(e) =>
            setNewExpense({ ...newExpense, amount: e.target.value })
          }
          className="mt-2 p-2 rounded-lg bg-gray-700 border border-gray-600 text-white w-full"
        />
      </div>

      {/* Checkboxes for selecting friends */}
      <h2 className="mt-4">Select Friends:</h2>
      {trip.friends.map((friend, index) => (
        <label key={index} className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            value={friend.name}
            checked={selectedFriends.includes(friend.name)}
            onChange={() => handleFriendSelection(friend.name)}
            className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-500 rounded"
          />
          <span className="text-sm text-gray-300">{friend.name}</span>
        </label>
      ))}

      {/* Dropdown for selecting who paid */}
      <select
        value={paidBy}
        onChange={(e) => setPaidBy(e.target.value)}
        className="mt-4 p-2 rounded-lg bg-gray-700 border border-gray-600 text-white w-full"
      >
        <option value="">Who paid?</option>
        {trip.friends.map((friend, index) => (
          <option key={index} value={friend.name}>
            {friend.name}
          </option>
        ))}
      </select>

      {/* Radio buttons for payment type */}
      <div className="mt-4">
        <label className="mr-4">
          <input
            type="radio"
            value="equal"
            checked={paymentType === "equal"}
            onChange={() => setPaymentType("equal")}
          />
          Equal
        </label>
        <label>
          <input
            type="radio"
            value="unequal"
            checked={paymentType === "unequal"}
            onChange={() => setPaymentType("unequal")}
          />
          Unequal
        </label>
      </div>

      <button
        onClick={handleAddExpense}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Add Expense
      </button>

      <h2 className="text-xl mt-5 font-semibold mb-3">Friends in this Trip</h2>
      <div className="space-y-3">
        {trip.friends && trip.friends.length > 0 ? (
          trip.friends.map((friend, index) => (
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
          ))
        ) : (
          <p className="text-gray-400">No friends added to this trip.</p>
        )}
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