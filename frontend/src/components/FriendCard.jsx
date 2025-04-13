import PropTypes from "prop-types";
import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { MdOutlineCurrencyExchange } from "react-icons/md";
import axios from "axios";

const FriendCard = ({
  friend,
  index,
  balance,
  handleDeleteFriend,
  updateFriendBalance,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [settleAmount, setSettleAmount] = useState(balance);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Get current user info (assumed stored in localStorage)
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
    setSettleAmount(Number(balance));
  };

  // This function calls the API to update balances in both documents when the user pays their friend.
  const handlePaid = async () => {
    console.log("hii");
    if (settleAmount === "" || settleAmount === 0) return;
    const amount = Math.abs(settleAmount);
    console.log("amount", amount);
    console.log("friend", friend);

    try {
      await axios.post("http://localhost/user/update-friend-balance", {
        userEmail: currentUser.email,
        friendEmail: friend.email,
        amount,
        action: "paid",
      });
      // Locally update: when you pay them, your friend's balance increases (they owe you more).
      balance = parseFloat((Number(balance) + amount).toFixed(2));
      updateFriendBalance(friend.email, balance);

      setSettleAmount(balance);
      setShowDropdown(false);
    } catch (error) {
      console.error("Error updating friend balance (paid):", error);
    }
  };

  // This function calls the API to update balances when you receive money from your friend.
  const handleReceived = async () => {
    if (settleAmount === "" || settleAmount === 0) return;
    const amount = Math.abs(settleAmount);
    console.log("amount", amount);
    console.log("friend", friend);
    console.log("currentUser", currentUser);

    try {
      await axios.post(
        "http://192.168.156.226:8000/user/update-friend-balance",
        {
          userEmail: currentUser.email,
          friendEmail: friend.email,
          amount,
          action: "received",
        }
      );
      // Locally update: when you receive money, your friend's balance decreases.
      balance = parseFloat((Number(balance) - amount).toFixed(2));
      updateFriendBalance(friend.email, balance);
      setSettleAmount(balance);
      setShowDropdown(false);
    } catch (error) {
      console.error("Error updating friend balance (received):", error);
    }
  };

  // Settle balance means zeroing out the current debt. Here we simulate it by calling the API
  // with the proper action based on whether Number(balance) is positive or negative.
  const handleSettleBalance = async () => {
    const currentBalance = balance;
    if (currentBalance === 0) return;

    try {
      if (currentBalance > 0) {
        // If friend owes you money, then receiving money will reduce the balance.
        await axios.post(
          "http://192.168.156.226:8000/user/update-friend-balance",
          {
            userEmail: currentUser.email,
            friendEmail: friend.email,
            amount: currentBalance,
            action: "received",
          }
        );
      } else {
        // If you owe friend money, paying them will reduce the negative balance.
        await axios.post(
          "http://192.168.156.226:8000/user/update-friend-balance",
          {
            userEmail: currentUser.email,
            friendEmail: friend.email,
            amount: Math.abs(currentBalance),
            action: "paid",
          }
        );
      }
      balance = 0;
      updateFriendBalance(friend.email, balance);
      setSettleAmount(0);
      setShowDropdown(false);
    } catch (error) {
      console.error("Error settling friend balance:", error);
    }
  };
  console.log("friend", friend);

  return (
    <div
      key={index}
      className="bg-gray-700/50 backdrop-blur-sm cursor-pointer rounded-lg border border-gray-600/30 p-2 sm:p-3 mb-2"
    >
      <div
        onClick={toggleDropdown}
        className="flex justify-between items-center"
      >
        <div>
          <p className="text-sm text-white">{friend.username}</p>
          <p
            className={`text-xs ${
              Number(balance) > 0
                ? "text-green-400"
                : Number(balance) < 0
                ? "text-red-400"
                : "text-gray-400"
            }`}
          >
            {Number(balance) > 0
              ? `Owes you ₹${Number(balance)}`
              : Number(balance) < 0
              ? `You owe ₹${Math.abs(Number(balance))}`
              : "Settled"}
          </p>
        </div>
        <div
          className="flex items-center gap-5 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 🟢 Settle Icon */}
          <button
            title="Settle Up"
            onClick={handleSettleBalance}
            className="text-yellow-400 hover:text-yellow-300 transition"
          >
            <MdOutlineCurrencyExchange className="w-5 h-5" />
          </button>
          {/* 🗑️ Delete Icon */}
          <button
            onClick={() => {
              setShowDropdown(true);
              setShowConfirmDelete(true);
            }}
            className="text-red-500 hover:text-red-700 transition"
            title="Remove Friend"
          >
            <FaTrash className="h-5 w-5" />
          </button>
        </div>
      </div>

      {showDropdown && (
        <div className="mt-3 bg-gray-800 rounded-lg p-3 border border-gray-600">
          <p className="text-sm text-white mb-2">
            <span className="font-medium">UPI ID:</span>{" "}
            {friend.upiId || "Not Available"}
          </p>

          <input
            type="number"
            step="0.01"
            value={settleAmount === "" ? "" : Math.abs(settleAmount)}
            onChange={(e) => {
              let value = e.target.value;
              if (value === "") return setSettleAmount("");
              if (
                !value.startsWith("0.") &&
                !value.startsWith("-0.") &&
                value.length > 1 &&
                !value.startsWith("-")
              ) {
                value = value.replace(/^0+/, "");
              } else if (
                value.startsWith("-") &&
                value.length > 2 &&
                !value.startsWith("-0.")
              ) {
                value = "-" + value.replace(/^-0+/, "");
              }
              const parsed = parseFloat(value);
              setSettleAmount(isNaN(parsed) ? "" : parsed);
            }}
            className="w-full p-2 rounded bg-gray-700 text-white mb-2 border border-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />

          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                onClick={handleReceived}
                disabled={!settleAmount}
                className={`w-full p-2 rounded ${
                  !settleAmount
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                } text-white transition-colors`}
              >
                Received
              </button>

              <button
                onClick={handlePaid}
                disabled={!settleAmount}
                className={`w-full p-2 rounded ${
                  !settleAmount
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                } text-white transition-colors`}
              >
                Paid
              </button>
            </div>

            {friend.upiId && (
              <button
                href={`upi://pay?pa=${friend.upiId}&pn=${encodeURIComponent(
                  friend.username
                )}&am=${Math.abs(settleAmount)}&cu=INR&tn=${encodeURIComponent(
                  "FairFare - Friend Settlement"
                )}`}
                target="_blank"
                disabled={Math.abs(settleAmount) < 1}
                rel="noopener noreferrer"
                className={`block mt-2 text-center w-full py-2 px-4 rounded transition-colors ${
                  Math.abs(settleAmount) < 1
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                Settle via UPI
              </button>
            )}
          </div>
        </div>
      )}

      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-600 text-center w-[90%] max-w-md">
            <p className="text-white text-lg mb-4">
              Are you sure you want to delete <strong>{friend.username}</strong>
              ?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  handleDeleteFriend(friend.username);
                  setShowConfirmDelete(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

FriendCard.propTypes = {
  friend: PropTypes.shape({
    username: PropTypes.string.isRequired,
    balance: PropTypes.number.isRequired,
    upiId: PropTypes.string,
    email: PropTypes.string.isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
  balance: PropTypes.number.isRequired,
  handleDeleteFriend: PropTypes.func.isRequired,
  updateFriendBalance: PropTypes.func.isRequired,
};

export default FriendCard;
