import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaArrowDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import { FaCopy } from "react-icons/fa";
import { MdOutlineCurrencyExchange } from "react-icons/md";

const TransactionHistory = () => {
  const { friendId } = useParams();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [friendName, setFriendName] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [netBalance, setNetBalance] = useState(0);
  const [amount, setAmount] = useState(0);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  const chatContainerRef = useRef(null);
  const bottomRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [storedUser, setStoredUser] = useState(null);
  const userId = Cookies.get("id");

  const handleScroll = () => {
    const el = chatContainerRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const atBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 100;

    setIsAtBottom(atBottom);
  };

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      setIsAtBottom(true);
    }
  };

  useEffect(() => {
    if (!transactions) return;
    requestAnimationFrame(() => {
      scrollToBottom();
      handleScroll();
    });
  }, [transactions]);

  useEffect(() => {
    handleScroll();
    const el = chatContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  async function fetchUser() {
    try {
      setLoading(true);
      if (!userId) {
        toast.error("User ID not found. Please log in again.");
        navigate("/login");
        return;
      }
      const res = await axios.get(
        // `//http://localhost:8000/user/${userId}`
        `https://fairfare-0hyl.onrender.com/user/${userId}`
      );

      fetchData(res.data.user);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchData(user) {
    try {
      setLoading(true);

      if (user === null) {
        toast.error("No user found");
        return;
      }

      setStoredUser(user);

      if (user?._id) {
        setCurrentUserId(user._id);
      }

      const friend = user.friends?.find((f) => f.friend._id === friendId);

      setFriendName(friend?.friend || "Unknown");

      const txRes = await axios.get(
        // `//http://localhost:8000/expenses/${user?._id}/${friendId}`
        `https://fairfare-0hyl.onrender.com/expenses/${user?._id}/${friendId}`
      );

      // Sort the transactions by createdAt (latest first)
      const sortedTransactions = txRes.data.expenses.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      // Reverse the sorted transactions so that latest expense is at the bottom
      setTransactions(sortedTransactions.reverse());
      
      setNetBalance(friend.balance || 0);
    } catch (err) {
      toast.error("Error fetching transaction history");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  const handlePaid = async () => {
    if (amount === "" || amount === 0) {
      toast.error("Please enter a valid amount to pay.");
      return;
    }
    if (text === "" || text === " ") {
      toast.error("Please enter a valid note.");
      return;
    }
    const paidAmount = Math.abs(amount);
    try {
      setLoading(true);
      await axios.post(
        // "//http://localhost:8000/user/update-friend-balance",
        "https://fairfare-0hyl.onrender.com/user/update-friend-balance",
        {
        userEmail: storedUser.email,
        friendEmail: friendName.email,
        amount: paidAmount,
        action: "paid",
        note: text,
        friendFcmToken: friendName.fcmToken,
      });
      toast.success("Paid transaction added!");
      setAmount(0);
      setText("");
      // Optionally, refetch transactions
      fetchUser();
    } catch (error) {
      toast.error("Error updating friend balance (paid)");
      console.error("Error updating friend balance (paid):", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReceived = async () => {
    if (amount === "" || amount === 0) {
      toast.error("Please enter a valid amount to receive.");
      return;
    }

    if (text === "" || text === " ") {
      toast.error("Please enter a valid note.");
      return;
    }
    const receivedAmount = Math.abs(amount);
    try {
      setLoading(true);
      await axios.post(
        // "//http://localhost:8000/user/update-friend-balance",
        "https://fairfare-0hyl.onrender.com/user/update-friend-balance",
        {
        userEmail: storedUser.email,
        friendEmail: friendName.email,
        amount: receivedAmount,
        action: "received",
        note: text,
        friendFcmToken: friendName.fcmToken,
      });
      toast.success("Received transaction added!");
      setAmount(0);
      setText("");
      // Optionally, refetch transactions
      fetchUser();
    } catch (error) {
      toast.error("Error updating friend balance (received)");
      console.error("Error updating friend balance (received):", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettleBalance = async () => {
    const currentBalance = netBalance;
    if (currentBalance === 0) {
      toast.error("No balance to settle.");
      return;
    }

    try {
      if (currentBalance > 0) {
        await axios.post(
          "https://fairfare-0hyl.onrender.com/user/update-friend-balance",
          // "//http://localhost:8000/user/update-friend-balance",
          {
            userEmail: storedUser.email,
            friendEmail: friendName.email,
            amount: currentBalance,
            action: "received",
            note: "Cleared Everything",
            friendFcmToken: friendName.fcmToken,
          }
        );
      } else {
        await axios.post(
          "https://fairfare-0hyl.onrender.com/user/update-friend-balance",
          // "//http://localhost:8000/user/update-friend-balance",
          {
            userEmail: storedUser.email,
            friendEmail: friendName.email,
            amount: Math.abs(currentBalance),
            action: "paid",
            note: "Cleared Everything",
            friendFcmToken: friendName.fcmToken,
          }
        );
      }
      fetchUser();
      setNetBalance(0);
    } catch (error) {
      toast.error("Please refresh the page first!");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Loading Screen */}
      {loading && (
        <div className="flex flex-1 items-center justify-center bg-gray-900 absolute inset-0 z-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-b-4 border-gray-800 mb-6"></div>
            <span className="text-lg text-blue-400 font-semibold">
              Loading transactions...
            </span>
          </div>
        </div>
      )}
      {/* Chat Header */}
      <div className="p-2 bg-gray-800 border-b border-gray-700 flex items-center">
        <button className="mr-3" onClick={() => navigate(-1)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <Link to={`/public-profile/${friendName._id}`}>
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-lg font-medium">
            {friendName.username
              ? friendName.username.charAt(0).toUpperCase()
              : "?"}
          </div>
        </Link>
        <div className="ml-3 flex items-start justify-between w-full">
          <div>
            <Link to={`/public-profile/${friendName._id}`}>
              <h2 className="cursor-pointer font-medium">
                {friendName.username}
              </h2>
            </Link>
            <div className="flex items-center space-x-2">
              <p className="text-xs text-gray-400 truncate">
                {friendName.upiId}
              </p>
              {friendName.upiId && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(friendName.upiId);
                    toast.success("UPI ID copied to clipboard!");
                  }}
                  className="p-1 bg-gray-600 rounded hover:bg-gray-700 transition flex items-center justify-center"
                  title="Copy UPI ID"
                >
                  <FaCopy className="h-3 w-3 text-white" />
                </button>
              )}
            </div>
          </div>

          <button
            title="Settle Up"
            onClick={handleSettleBalance}
            className="text-yellow-400 hover:text-yellow-300 transition ml-3 mt-2 mr-3"
          >
            <MdOutlineCurrencyExchange className="w-8 h-8" />
          </button>
        </div>
      </div>

      {/* Balance */}
      <div className="py-2 bg-gray-800/50 border-b border-gray-700 text-center">
        <p className="text-sm text-gray-400 mb-1">Net Balance</p>
        <p
          className={`text-3xl font-bold ${
            netBalance >= 0 ? "text-green-400" : "text-red-400"
          }`}
        >
          {netBalance >= 0 ? "₹" : "₹"}
          {Math.abs(netBalance).toFixed(2)}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          {netBalance >= 0
            ? `${friendName.username} owes you`
            : `You owe ${friendName.username}`}
        </p>
      </div>

      {/* Transactions */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 custom-scrollbar overflow-y-auto p-4 space-y-3 relative"
      >
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="w-16 h-16 mb-4 bg-gray-800 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-1">
              No transactions yet
            </h3>
            <p className="text-gray-500 text-sm">
              Start adding transactions with {friendName.username}
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto auto p-3">
            {transactions.map((tx) => {
              const isUser = tx.paidBy._id === currentUserId;
              const owedEntry = tx.owedBy.find((o) => o.user._id === friendId);
              const amount = owedEntry ? owedEntry.amount : tx.amount;
              return (
                <div
                  key={tx._id}
                  className={`mt-5 flex ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-3 rounded-2xl ${
                      isUser
                        ? "bg-red-900 rounded-br-none"
                        : "bg-green-800 rounded-bl-none"
                    }`}
                  >
                    <div className="flex flex-col items-start">
                      <span
                        className={`text-2xl font-bold ${
                          isUser ? "text-red-300" : "text-green-300"
                        }`}
                      >
                        ₹{amount.toFixed(2)}
                      </span>
                      {tx.title && (
                        <h2 className=" font-bold text-gray-200 mt-1">
                          {tx.title}
                        </h2>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-left mr-2">
                        <span className="text-xs text-white-500 mt-1">
                          {tx.groupName}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-300">
                          {isUser ? "You paid" : `${friendName.username} paid`}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 mt-1">
                      {new Date(tx.createdAt).toLocaleString([], {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
            {/* Bottom sentinel for scrollIntoView */}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Scroll-to-bottom arrow */}
      {!isAtBottom && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
          <button
            onClick={scrollToBottom}
            className="bg-blue-500 hover:bg-blue-600 mb-40 text-white p-2 rounded-full shadow-lg transition-all"
          >
            <FaArrowDown className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Input Section */}
      <div className="p-3 bg-gray-800 border-t border-gray-700">
        <div className="flex flex-col gap-2">
          {/* Amount Input */}
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => {
              let value = e.target.value;
              if (value === "") return setAmount("");
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
              setAmount(isNaN(parsed) ? "" : parsed);
            }}
            className="w-full bg-gray-700 border border-gray-600 px-4 py-2 text-sm focus:outline-none rounded"
            placeholder="Enter amount"
          />

          {/* Note Input */}
          <input
            type="text"
            placeholder="Add a note..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 px-4 py-2 text-sm focus:outline-none rounded"
          />

          {/* Buttons in a row */}
          <div className="flex gap-2">
            <button
              onClick={handleReceived}
              className={`flex-1 py-2 text-white rounded text-center ${
                loading
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              Received
            </button>
            <button
              onClick={handlePaid}
              className="flex-1 bg-red-600 hover:bg-red-700 py-2 text-white rounded text-center"
            >
              Paid
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
