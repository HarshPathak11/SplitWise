import PropTypes from "prop-types";
import { useState } from "react";
import { FaTrash, FaCopy } from "react-icons/fa";
import { FiLink } from "react-icons/fi";
import { MdOutlineCurrencyExchange } from "react-icons/md";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import { FaHistory } from "react-icons/fa"; // history icon
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

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
  const [showQRCode, setShowQRCode] = useState(false);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));

  // console.log(friend);

  const toggleDropdown = () => {
    setShowDropdown((prev) => {
      const newState = !prev;
      if (!newState) {
        setShowQRCode(false); // Hide QR on closing dropdown
      }
      return newState;
    });
    setSettleAmount(Number(balance));
  };

  const handlePaid = async () => {
    if (settleAmount === "" || settleAmount === 0) return;
    const amount = Math.abs(settleAmount);
    try {
      await axios.post(
        "https://fairfare-0hyl.onrender.com/user/update-friend-balance",
        {
          userEmail: currentUser.email,
          friendEmail: friend.email,
          amount,
          action: "paid",
        }
      );
      balance = parseFloat((Number(balance) + amount).toFixed(2));
      updateFriendBalance(friend.email, balance);
      setSettleAmount(balance);
      setShowDropdown(false);
      setShowQRCode(false);
    } catch (error) {
      console.error("Error updating friend balance (paid):", error);
    }
  };

  const handleReceived = async () => {
    if (settleAmount === "" || settleAmount === 0) return;
    const amount = Math.abs(settleAmount);
    try {
      await axios.post(
        "https://fairfare-0hyl.onrender.com/user/update-friend-balance",
        {
          userEmail: currentUser.email,
          friendEmail: friend.email,
          amount,
          action: "received",
        }
      );
      balance = parseFloat((Number(balance) - amount).toFixed(2));
      updateFriendBalance(friend.email, balance);
      setSettleAmount(balance);
      setShowDropdown(false);
      setShowQRCode(false);
    } catch (error) {
      console.error("Error updating friend balance (received):", error);
    }
  };

  const handleSettleBalance = async () => {
    const currentBalance = balance;
    if (currentBalance === 0) {
      toast.error("No balance to settle.");
      return;
    }

    try {
      if (currentBalance > 0) {
        await axios.post(
          `${API_BASE}/user/update-friend-balance`,
          // "//http://localhost:8000/user/update-friend-balance",
          {
            userEmail: currentUser.email,
            friendEmail: friend.email,
            amount: currentBalance,
            action: "received",
            note: "Cleared Everything",
          }
        );
      } else {
        await axios.post(
          `${API_BASE}/user/update-friend-balance`,
          // "//http://localhost:8000/user/update-friend-balance",
          {
            userEmail: currentUser.email,
            friendEmail: friend.email,
            amount: Math.abs(currentBalance),
            action: "paid",
            note: "Cleared Everything",
          }
        );
      }
      balance = 0;
      updateFriendBalance(friend.email, balance);
      setSettleAmount(0);
    } catch (error) {
      toast.error("Please refresh the page first!");
    }
  };

  const TransactionHistoryPage = async () => {
    navigate(`/transaction-history/${friend._id}`);
  }

  return (
    <div
      key={index}
      className="bg-gray-700/50 backdrop-blur-sm cursor-pointer rounded-lg border border-gray-600/30 p-2 sm:p-3 mb-2"
    >
      <div
        // onClick={toggleDropdown}
        onClick={TransactionHistoryPage}
        className="flex justify-between items-center"
      >
        <div>
          <div className="flex items-center gap-1">
            <p className="text-sm text-white">{friend.username}</p>
            <a
              href={`https://fair-fare-phi.vercel.app/public-profile/${friend._id}`}
              target="_blank"
              rel="noopener noreferrer"
              title="View Public Profile"
            >
              <FiLink className="text-white hover:text-blue-400 transition w-4 h-4" />
            </a>
          </div>
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
              ? `Owes you ₹${Number(balance).toFixed(2)}`
              : Number(balance) < 0
              ? `You owe ₹${Math.abs(Number(balance).toFixed(2))}`
              : "Settled"}
          </p>
        </div>

        <div
          className="flex items-center gap-5 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            to={`/transaction-history/${friend._id}`}
            className="text-blue-400 hover:text-blue-300 transition"
          >
            <FaHistory className="w-5 h-5" />
          </Link>
          <button
            title="Settle Up"
            onClick={handleSettleBalance}
            className="text-yellow-400 hover:text-yellow-300 transition"
          >
            <MdOutlineCurrencyExchange className="w-5 h-5" />
          </button>
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
       <div className="mt-3 opacity-0 bg-gray-800 rounded-lg p-3 border border-gray-600">
          <p className="text-sm text-white mb-2 flex items-center justify-between">
            <span className="font-medium">UPI ID:</span>{" "}
            <span className="flex-grow">{friend.upiId || "Not Available"}</span>
            {friend.upiId && (
              <button
                onClick={() => navigator.clipboard.writeText(friend.upiId)}
                className="ml-2 p-2 bg-gray-600 rounded flex items-center"
                title="Copy UPI ID"
              >
                <FaCopy
                  onClick={() => toast.success("UPI ID copied to clipboard!")}
                  className="h-3 w-4 text-white"
                />
              </button>
            )}
          </p>

          <input
            type="number"
            step="0.01"
            min="0"
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
              <>
                <button
                  onClick={() => setShowQRCode(true)}
                  disabled={Math.abs(settleAmount) < 1}
                  className={`block text-center w-full py-2 px-4 rounded transition-colors ${
                    Math.abs(settleAmount) < 1
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  Settle via UPI
                </button>

                {showQRCode && (
                  <div className="mt-3 flex flex-col items-center">
                    <QRCodeCanvas
                      value={`upi://pay?pa=${friend.upiId}&pn=${
                        friend.upiId
                      }&am=${Math.abs(settleAmount).toFixed(
                        2
                      )}&cu=INR&tn=Settling via FairFare`}
                      size={150}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="H"
                    />
                  </div>
                )}
              </>
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
                onClick={() => {setShowConfirmDelete(false); setShowDropdown(false);}}
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
