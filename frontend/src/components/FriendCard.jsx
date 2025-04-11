import PropTypes from "prop-types";
import { useState } from "react";
import { FaTrash } from "react-icons/fa";

const FriendCard = ({ friend, index, handleDeleteFriend }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [settleAmount, setSettleAmount] = useState(friend.balance);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
    setSettleAmount(friend.balance);
  };

  const handleSettle = () => {
    let updatedBalance =
      friend.balance > 0
        ? friend.balance - settleAmount
        : friend.balance + settleAmount;
    friend.balance = parseFloat(updatedBalance.toFixed(2));
    setShowDropdown(false);
  };

  const handleAddDebt = () => {
    let updatedBalance =
      friend.balance > 0
        ? friend.balance + settleAmount
        : friend.balance - settleAmount;
    friend.balance = parseFloat(updatedBalance.toFixed(2));
    setShowDropdown(false);
  };

  return (
    <div
      key={index}
      className="bg-gray-700/50 backdrop-blur-sm cursor-pointer rounded-lg border border-gray-600/30 p-2 sm:p-3 mb-2"
    >
      <div onClick={toggleDropdown} className="flex justify-between items-center">
        <div>
          <p className="text-sm text-white">{friend.name}</p>
          <p
            className={`text-xs ${
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

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDropdown(true); // ✅ Force open dropdown
            setShowConfirmDelete(true); // ✅ Show confirmation
          }}
          className="text-red-500 hover:text-red-700 transition-colors"
          title="Remove Friend"
        >
          <FaTrash className="h-5 w-5" />
        </button>
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
            value={settleAmount === "" ? "" : settleAmount}
            onChange={(e) => {
              let value = e.target.value;
              if (value === "") {
                setSettleAmount("");
                return;
              }

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

          <div className="flex gap-2">
            <button
              onClick={handleSettle}
              disabled={!settleAmount || settleAmount <= 0}
              className={`w-full p-2 rounded ${
                !settleAmount || settleAmount <= 0
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 cursor-pointer"
              } text-white transition-colors`}
            >
              Settle
            </button>

            <button
              onClick={handleAddDebt}
              disabled={!settleAmount || settleAmount <= 0}
              className={`w-full p-2 rounded ${
                !settleAmount || settleAmount <= 0
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              } text-white transition-colors`}
            >
              Add Debt
            </button>
          </div>
        </div>
      )}

      {/* ✅ Delete confirmation popup */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-600 text-center w-[90%] max-w-md">
            <p className="text-white text-lg mb-4">
              Are you sure you want to delete <strong>{friend.name}</strong>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  handleDeleteFriend(friend.name);
                  setShowConfirmDelete(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Yes
              </button>
              <button
                onClick={() => {
                  setShowConfirmDelete(false);
                }}
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
    name: PropTypes.string.isRequired,
    balance: PropTypes.number.isRequired,
    upiId: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
  handleDeleteFriend: PropTypes.func.isRequired,
};

export default FriendCard;
