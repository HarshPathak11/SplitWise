import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { FaArrowDown, FaBell, FaCopy } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import { Forward } from "lucide-react";
import { MdOutlineCurrencyExchange } from "react-icons/md";
import html2canvas from "html2canvas";
import api from "../utils/api";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

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
  const [showConfirm, setShowConfirm] = useState(false);
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

  const handleShareTransaction = async (txId, amount, friendName) => {
    const element = document.getElementById(`tx-card-${txId}`);
    if (!element) return;

    const shareLink = `https://your-app-link.com/transaction/${txId}`;
    const shareText = `Hey! Just a friendly reminder about the transaction of ₹${amount}. You can check the details here: ${shareLink}`;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: "#0a0a0a",
        scale: 3, // Increased scale for better text clarity
        useCORS: true,
        logging: false,
        ignoreElements: (el) => el.tagName === "BUTTON",
        // FIX FOR CUT OFF TEXT: Add padding during the clone phase
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById(`tx-card-${txId}`);
          if (clonedElement) {
            // Add extra padding to the bottom of the container to prevent clipping
            clonedElement.style.paddingBottom = "10px";
            // Ensure all text has enough line-height
            const titles = clonedElement.querySelectorAll("h4, span");
            titles.forEach((el) => (el.style.lineHeight = "1.4"));
          }
        },
      });

      const dataUrl = canvas.toDataURL("image/png");
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "receipt.png", { type: "image/png" });

      // MOBILE SHARE LOGIC
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({
            files: [file],
            title: "Transaction Receipt",
            text: shareText, // WhatsApp usually prefers text + file on Android
          });
        } catch (shareError) {
          // If sharing both fails, share text first then file
          console.log("Dual share failed, trying text-only fallback");
          navigator.clipboard.writeText(shareText);
          toast.success("Reminder text copied! Now share the image.");
        }
      } else {
        // DESKTOP FALLBACK
        const item = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([item]);
        toast.success("Image copied! Paste in WhatsApp.");

        // Copy text to clipboard after a short delay
        setTimeout(() => {
          navigator.clipboard.writeText(shareText);
          toast("Reminder link copied!", { icon: "🔗" });
        }, 1500);
      }
    } catch (error) {
      console.error("Error sharing:", error);
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
      const res = await api.get(`${API_BASE}/user/${userId}`);
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

      const friend = user?.friends?.find((f) => f.friend?._id === friendId);

      setFriendName(friend?.friend || "Unknown");

      const txRes = await api.get(`${API_BASE}/expenses/${userId}/${friendId}`);

      // Sort the transactions by createdAt (latest first)
      const sortedTransactions = txRes.data.expenses.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      // Reverse the sorted transactions so that latest expense is at the bottom
      setTransactions(sortedTransactions.reverse());
      setNetBalance(friend.balance || 0);
    } catch (err) {
      toast.error("No longer friends!");
      console.error(err);
      navigate("/dash");
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
    if (paidAmount > 50000) {
      toast.error("Amount cannot be more than 50k");
      return;
    }
    try {
      setLoading(true);
      await api.post(`${API_BASE}/user/update-friend-balance`, {
        userEmail: storedUser?.email,
        friendEmail: friendName?.email,
        amount: paidAmount,
        action: "paid",
        note: text,
        friendFcmToken: friendName?.fcmToken,
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
    if (receivedAmount > 50000) {
      toast.error("Amount cannot be more than 50k");
      return;
    }
    try {
      setLoading(true);
      await api.post(`${API_BASE}/user/update-friend-balance`, {
        userEmail: storedUser?.email,
        friendEmail: friendName?.email,
        amount: receivedAmount,
        action: "received",
        note: text,
        friendFcmToken: friendName?.fcmToken,
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

  const handleSendReminder = async () => {
    const currentBalance = netBalance;
    if (currentBalance === 0) {
      toast.error("No balance to remind.");
      return;
    }
    if (currentBalance < 0) {
      toast.error("You owe money. Cannot send reminder.");
      return;
    }
    try {
      await api.post(`${API_BASE}/user/notify`, {
        userId: userId,
        friendId: friendId,
      });
      toast.success("Payment reminder sent!");
    } catch (error) {
      toast.error("Error sending payment reminder");
      console.error("Error sending payment reminder:", error);
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
        await api.post(`${API_BASE}/user/update-friend-balance`, {
          userEmail: storedUser?.email,
          friendEmail: friendName?.email,
          amount: currentBalance,
          action: "received",
          note: "Cleared Everything",
          friendFcmToken: friendName?.fcmToken,
        });
      } else {
        await api.post(`${API_BASE}/user/update-friend-balance`, {
          userEmail: storedUser?.email,
          friendEmail: friendName?.email,
          amount: Math.abs(currentBalance),
          action: "paid",
          note: "Cleared Everything",
          friendFcmToken: friendName?.fcmToken,
        });
      }
      fetchUser();
      setNetBalance(0);
    } catch (error) {
      toast.error("Please refresh the page first!");
    }
  };

  const confirmSettle = () => {
    setShowConfirm(true);
  };

  const handleConfirmYes = () => {
    setShowConfirm(false);
    handleSettleBalance();
  };

  const handleConfirmNo = () => {
    setShowConfirm(false);
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30 overflow-hidden relative">
      {/* --- BACKGROUND FX --- */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* --- LOADING OVERLAY (System Boot Style) --- */}
      {loading && (
        <div className="absolute inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-zinc-800 border-t-indigo-500 rounded-full animate-spin"></div>
          <span className="mt-4 text-xs font-mono text-indigo-400 animate-pulse">
            SYNCING_LEDGER_DATA...
          </span>
        </div>
      )}

      {/* --- HEADER: The Control Panel --- */}
      <div className="relative z-20 px-4 py-3 bg-zinc-900/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <Link
            to={`/public-profile/${friendName._id}`}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/10 overflow-hidden relative shadow-inner">
              {friendName?.profilePhotoUrl ? (
                <img
                  src={friendName.profilePhotoUrl}
                  alt="User"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-indigo-400 font-bold">
                  {friendName.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-none group-hover:text-indigo-300 transition-colors">
                {friendName.username}
              </h2>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[10px] font-mono text-zinc-500 tracking-wider truncate max-w-[100px]">
                  {friendName.upiId || "NO_UPI_LINKED"}
                </span>
                {friendName.upiId && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      navigator.clipboard.writeText(friendName.upiId);
                      toast.success("Copied");
                    }}
                    className="text-zinc-600 hover:text-indigo-400 transition-colors"
                  >
                    <FaCopy size={10} />
                  </button>
                )}
              </div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSendReminder}
            className="p-2.5 rounded-xl bg-zinc-800/50 hover:bg-yellow-500/10 text-zinc-400 hover:text-yellow-400 border border-transparent hover:border-yellow-500/20 transition-all"
            title="Send Reminder"
          >
            <FaBell size={16} />
          </button>
          <button
            onClick={confirmSettle}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20 transition-all"
            title="Settle Up"
          >
            <MdOutlineCurrencyExchange size={18} />
          </button>
        </div>
      </div>

      {/* --- BALANCE TICKER --- */}
      <div className="relative z-10 py-4 bg-zinc-950/50 border-b border-white/5 backdrop-blur-sm">
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-1">
            Net Position
          </span>
          <div
            className={`text-4xl font-mono font-medium tracking-tighter ${
              netBalance >= 0
                ? "text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                : "text-rose-400 drop-shadow-[0_0_15px_rgba(251,113,133,0.3)]"
            }`}
          >
            {netBalance >= 0 ? "+" : "-"}₹{Math.abs(netBalance).toFixed(2)}
          </div>
          <span className="text-xs text-zinc-600 mt-1 font-medium bg-zinc-900 px-2 py-0.5 rounded border border-white/5">
            {netBalance >= 0
              ? `${friendName.username} owes you`
              : `You owe ${friendName.username}`}
          </span>
        </div>
      </div>

      {/* --- STREAM AREA --- */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar relative z-0"
      >
        {transactions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-50">
            <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-dashed border-zinc-700 flex items-center justify-center mb-4">
              <span className="text-4xl">🧾</span>
            </div>
            <p className="text-zinc-500 font-mono text-sm">LEDGER_EMPTY</p>
            <p className="text-zinc-600 text-xs mt-1">
              Initialize transaction stream.
            </p>
          </div>
        ) : (
          <>
            {transactions.map((tx) => {
              const isUser = tx.paidBy._id === currentUserId;
              const owedEntry = isUser
                ? tx.owedBy.find((o) => o.user._id === friendId)
                : tx.owedBy.find((o) => o.user._id === currentUserId);
              const amount = owedEntry ? owedEntry.amount : 0;

              return (
                <div
                  key={tx._id}
                  className={`flex w-full ${
                    isUser ? "justify-end" : "justify-start"
                  } mb-4 px-2`}
                >
                  {/* 1. RELATIVE WRAPPER: Centers the button and the bubble as one unit */}
                  <div className="relative group flex items-center max-w-[85%] sm:max-w-sm">
                    {/* 2. ABSOLUTE FORWARD BUTTON: Must be outside the bubble's DOM flow */}
                    <button
                      onClick={() => handleShareTransaction(tx._id)}
                      className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center 
          w-9 h-9 rounded-full bg-zinc-900/90 border border-white/10 
          text-zinc-400 hover:text-white hover:bg-zinc-800 
          transition-all duration-300 shadow-2xl z-30
          ${isUser ? "-left-14" : "-right-14"}`}
                    >
                      <Forward size={18} className="ml-0.5" />
                    </button>

                    {/* 3. THE BUBBLE: Added 'flex-1' and 'w-full' to prevent compression */}
                    <div
                      id={`tx-card-${tx._id}`}
                      className="relative w-full flex-1"
                    >
                      {/* Connector Line */}
                      <div
                        className={`absolute top-4 w-2 h-[1px] ${
                          isUser
                            ? "-right-2 bg-indigo-500/50"
                            : "-left-2 bg-zinc-600/50"
                        }`}
                      />

                      <div
                        className={`relative p-4 rounded-xl border backdrop-blur-md shadow-lg 
            ${
              isUser
                ? "bg-indigo-950/30 border-indigo-500/30"
                : "bg-zinc-900/60 border-white/10"
            }`}
                      >
                        {/* Header Section */}
                        <div className="flex justify-between items-center gap-4 mb-2 border-b border-white/5 pb-2">
                          {/* Title: whitespace-nowrap ensures it doesn't wrap or compress unless it hits max width */}
                          <span
                            className={`text-sm font-bold whitespace-nowrap truncate ${
                              isUser ? "text-indigo-200" : "text-zinc-200"
                            }`}
                          >
                            {tx.title || "Untitled"}
                          </span>
                          <div className="flex flex-row gap-1">
                            <span className="text-[9px] font-mono text-zinc-500">
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </span>
                            <span className="text-[9px] font-mono text-zinc-500">
                              {new Date(tx.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Amount Section */}
                        <div className="flex justify-between items-end mt-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                              {isUser ? "You Paid" : "They Paid"}
                            </span>
                            <span className="text-[10px] text-zinc-400 bg-black/20 px-1.5 py-0.5 rounded mt-1">
                              {tx.groupName}
                            </span>
                          </div>
                          <div
                            className={`text-2xl font-mono font-medium ${
                              isUser ? "text-indigo-400" : "text-white"
                            }`}
                          >
                            ₹{amount.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* --- SCROLL TO BOTTOM --- */}
      {!isAtBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-36 left-1/2 -translate-x-1/2 z-50 p-3 rounded-full bg-zinc-800 text-indigo-400 shadow-lg border border-white/10 hover:bg-zinc-700 transition-all"
        >
          <FaArrowDown size={14} />
        </button>
      )}

      {/* --- COMMAND BAR (Input) --- */}
      <div className="p-4 bg-zinc-950/80 backdrop-blur-xl border-t border-white/5 relative z-30">
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          {/* Input Capsule */}
          <div className="flex items-center gap-3 p-1.5 bg-zinc-900 border border-white/10 rounded-2xl shadow-inner focus-within:border-indigo-500/50 transition-colors">
            {/* Amount Field */}
            <div className="relative pl-3">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => {
                  /* keeping existing logic */
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
                className="w-24 bg-transparent text-white font-mono font-medium focus:outline-none pl-4 py-2 placeholder-zinc-600"
                placeholder="0.00"
              />
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-zinc-700"></div>

            {/* Description Field */}
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 bg-transparent text-white text-sm focus:outline-none px-2 py-2 placeholder-zinc-600"
              placeholder="Add a note..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleReceived}
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98]"
            >
              + Received
            </button>
            <button
              onClick={handlePaid}
              className="flex-1 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98]"
            >
              - Paid
            </button>
          </div>
        </div>
      </div>

      {/* --- CONFIRMATION MODAL --- */}
      {showConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">
              Execute Settlement?
            </h3>
            <p className="text-sm text-zinc-400 mb-6">
              This will zero out all pending balances with{" "}
              <strong className="text-white">{friendName.username}</strong>.
              Confirm authorization?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmNo}
                className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 font-medium hover:bg-zinc-800"
              >
                Abort
              </button>
              <button
                onClick={handleConfirmYes}
                className="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 shadow-lg shadow-emerald-900/20"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
