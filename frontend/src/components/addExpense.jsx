import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios

const AddExpense = () => {
  const location = useLocation(); // Access the passed trip details
  const navigate = useNavigate();
  const initialTrip = location.state?.trip; // Destructure the trip object
  const [trip, setTrip] = useState(initialTrip || { friends: [] }); // Use state to manage trip data
  const [selectedFriends, setSelectedFriends] = useState([]); // State for selected friends
  const [paidBy, setPaidBy] = useState(""); // State for who paid
  const [newExpense, setNewExpense] = useState({ amount: 0, description: "" }); // State for new expense
  const [paymentType, setPaymentType] = useState("equal"); // State for payment type
  const [customAmounts, setCustomAmounts] = useState({}); // State for custom amounts

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
      setNewExpense({ amount: 0, description: "" }); // Reset the input fields
      setSelectedFriends([]); // Reset selected friends
      setPaidBy(""); // Reset who paid
      setPaymentType("equal"); // Reset payment type
      setCustomAmounts({}); // Reset custom amounts
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

  // Function to handle custom amount input
  const handleCustomAmountChange = (friend, amount) => {
    setCustomAmounts({ ...customAmounts, [friend]: amount });
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white min-h-screen p-6 flex items-center justify-center">
      <div className="absolute top-4 left-4">
        <button
          onClick={() => navigate("/tripDetails")}
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
        <h1 className="text-2xl font-bold mb-4">Add Expense</h1>

        {/* Friends Selection */}
        <h2 className="text-lg font-semibold mb-2">Select Friends:</h2>
        {trip.friends.map((friend) => (
          <label key={friend.name} className="flex items-center mb-2">
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

        <input
          type="text"
          placeholder="Enter a description"
          className="p-2 rounded-lg bg-gray-700 border border-gray-600 text-white w-full mb-4"
          onChange={(e) =>
            setNewExpense({ ...newExpense, description: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Amount"
          className="p-2 rounded-lg bg-gray-700 border border-gray-600 text-white w-full mb-4"
          onChange={(e) =>
            setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })
          }
        />
        <select
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          className="p-2 rounded-lg bg-gray-700 border border-gray-600 text-white w-full mb-4"
        >
          <option value="">Who paid?</option>
          {trip.friends.map((friend, index) => (
            <option key={index} value={friend.name}>
              {friend.name}
            </option>
          ))}
        </select>
        <select
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value)}
          className="p-2 rounded-lg bg-gray-700 border border-gray-600 text-white w-full mb-4"
        >
          <option value="equal">Split Equally</option>
          <option value="custom">Custom Split</option>
        </select>

        {paymentType === "custom" && (
          <div className="mb-4">
            {trip.friends.map((friend) => (
              <div key={friend.name} className="flex items-center mb-2">
                <span className="text-gray-300 mr-2">{friend.name}:</span>
                <input
                  type="number"
                  placeholder="Amount"
                  className="p-2 rounded-lg bg-gray-700 border border-gray-600 text-white w-full"
                  onChange={(e) =>
                    handleCustomAmountChange(
                      friend.name,
                      parseFloat(e.target.value)
                    )
                  }
                />
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleAddExpense}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Add Expense
        </button>
      </div>
    </div>
  );
};

export default AddExpense;
