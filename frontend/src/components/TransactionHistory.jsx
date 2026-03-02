import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { FaArrowDown, FaBell, FaCopy, FaShareAlt } from "react-icons/fa";
import { Forward } from "lucide-react";
import Cookies from "js-cookie";
import api from "../utils/api";
import html2canvas from "html2canvas";
import { motion, AnimatePresence } from "framer-motion";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

const TransactionHistory = () => {
  const { friendId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [transactions, setTransactions] = useState([]);
  const [friendName, setFriendName] = useState("");
  const [netBalance, setNetBalance] = useState(0);
  const [amount, setAmount] = useState(0);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);
  const [activityInfo, setActivityInfo] = useState(null);

  const chatContainerRef = useRef(null);
  const bottomRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [storedUser, setStoredUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPaidConfirm, setShowPaidConfirm] = useState(false);
  const [showReceivedConfirm, setShowReceivedConfirm] = useState(false);
  const [showReminderConfirm, setShowReminderConfirm] = useState(false);
  const [successOverlay, setSuccessOverlay] = useState(null); // { type: 'paid'|'received', amount: number }
  const userId = storedUser?._id;

  // Handle shared links: if friendId is the logged-in user, swap with sharer's ID
  useEffect(() => {
    const currentUserId = Cookies.get("id");
    if (currentUserId && friendId === currentUserId) {
      // Try getting from location.search first (standard query param)
      let sharerId = new URLSearchParams(location.search).get("sharer");

      // Fallback: Check if it's in the hash (e.g. if using HashRouter or weird URL formation)
      if (!sharerId && location.hash.includes("?")) {
        const hashParams = new URLSearchParams(location.hash.split("?")[1]);
        sharerId = hashParams.get("sharer");
      }

      if (sharerId) {
        // Redirect to the correct transaction history (with the sharer as the friend)
        // Ensure we preserve the transaction hash ID (the part after the last #)
        const txHash = location.hash.split("?")[0];
        navigate(`/transaction-history/${sharerId}${txHash}`, { replace: true });
        return;
      }
    }
  }, [friendId, location]);


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

  const handleShareTransaction = async (txId, amount, friendName, payerUpi) => {
    const element = document.getElementById(`tx-card-${txId}`);
    if (!element) return;

    const shareLink = `https://fair-fare-phi.vercel.app/transaction-history/${friendId}?sharer=${userId}#${txId}`;
    let shareText = `Hey! Just a friendly reminder about the transaction of ₹${amount}. You can check the details here: ${shareLink}`;
    if (payerUpi) {
      shareText += `\n\nPay to UPI: ${payerUpi}`;
    }

    try {
      // Get element dimensions for html2canvas (prevents 0-dimension errors on mobile)
      const rect = element.getBoundingClientRect();
      const captureWidth = Math.max(rect.width, 340);
      const captureHeight = Math.max(rect.height, 100);

      const canvas = await html2canvas(element, {
        backgroundColor: "#0a0a0a",
        scale: 3, // Increased scale for better text clarity
        useCORS: true,
        logging: false,
        width: captureWidth,
        height: captureHeight,
        ignoreElements: (el) => el.tagName === "BUTTON",
        // FIX FOR SMALL SCREENSHOT: Enlarge the card in the clone phase
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById(`tx-card-${txId}`);
          if (clonedElement) {
            clonedElement.style.overflow = "visible";
            clonedElement.style.minWidth = "340px";
            clonedElement.style.width = `${captureWidth}px`;
            clonedElement.style.paddingTop = "36px";
            clonedElement.style.paddingLeft = "24px";
            clonedElement.style.paddingRight = "24px";
            clonedElement.style.paddingBottom = "28px";
            clonedElement.style.borderRadius = "16px";
            // Remove the tight corner override that causes clipping
            clonedElement.style.borderTopRightRadius = "16px";
            clonedElement.style.borderTopLeftRadius = "16px";
            // Remove any background images that could cause createPattern errors
            clonedElement.style.backgroundImage = "none";
            // Scale up text for readability in shared image
            const allText = clonedElement.querySelectorAll("h4, span, div");
            allText.forEach((el) => {
              el.style.lineHeight = "1.6";
              el.style.overflow = "visible";
              el.style.backgroundImage = "none";
              const currentSize = parseFloat(window.getComputedStyle(el).fontSize);
              if (currentSize < 14) el.style.fontSize = `${currentSize * 1.3}px`;
            });
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

  const handleShareBalance = async () => {
    const balanceText = netBalance >= 0
      ? `Hi ${friendName.username} you owe me ₹${Math.abs(netBalance).toFixed(2)}`
      : `Hi ${friendName.username} I owe you ₹${Math.abs(netBalance).toFixed(2)}`;
    let shareText = `💰 Balance Update\n${balanceText}`;
    if (netBalance >= 0) {
      shareText += `\n\nPay to UPI: ${storedUser.upiId}`;
    } else {
      shareText += `\n\nPay to UPI: ${friendName.upiId}`;
    }
    shareText += `\n\n— Tracked on FairFare`;

    // Build a premium screenshot card with pure inline styles (no Tailwind)
    const isPositive = netBalance >= 0;
    const accentColor = isPositive ? "#34d399" : "#fb7185";
    const accentColorDim = isPositive ? "rgba(52,211,153,0.15)" : "rgba(251,113,133,0.15)";
    const accentBorder = isPositive ? "rgba(52,211,153,0.25)" : "rgba(251,113,133,0.25)";

    const container = document.createElement("div");
    // FIX: Use opacity:0 instead of left:-9999px to prevent zero-dimension
    // rendering on mobile browsers. The element must remain in the visible
    // viewport area so the browser actually computes its layout dimensions.
    container.style.cssText = `
      position: fixed; left: 0; top: 0; z-index: -1;
      opacity: 0; pointer-events: none;
      width: 420px; padding: 44px 40px 36px;
      background: #0d0d10;
      border-radius: 24px;
      border: 1px solid ${accentBorder};
      display: flex; flex-direction: column; align-items: center;
      font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
    `;

    // Top accent line
    const topLine = document.createElement("div");
    topLine.style.cssText = `
      width: 50px; height: 3px; border-radius: 3px;
      background: ${accentColor}; margin-bottom: 28px; opacity: 0.6;
    `;
    container.appendChild(topLine);

    // "NET POSITION" label
    const label = document.createElement("div");
    label.textContent = "NET POSITION";
    label.style.cssText = `
      font-size: 10px; font-weight: 700; letter-spacing: 4px;
      color: #52525b; margin-bottom: 16px; text-transform: uppercase;
    `;
    container.appendChild(label);

    // Amount
    const amountEl = document.createElement("div");
    const sign = isPositive ? "+" : "-";
    amountEl.textContent = `${sign}₹${Math.abs(netBalance).toFixed(2)}`;
    amountEl.style.cssText = `
      font-size: 48px; font-weight: 700; letter-spacing: -1px;
      color: ${accentColor};
      margin-bottom: 12px; font-family: 'Segoe UI', Arial, sans-serif;
    `;
    container.appendChild(amountEl);

    // "X owes you" / "You owe X" subtitle badge
    const subtitle = document.createElement("div");
    subtitle.style.cssText = `
      display: inline-flex; align-items: center; gap: 8px;
      font-size: 13px; font-weight: 500; color: #a1a1aa;
      background: ${accentColorDim}; padding: 6px 16px; border-radius: 20px;
      border: 1px solid ${accentBorder};
    `;
    // Status dot
    const dot = document.createElement("span");
    dot.style.cssText = `
      width: 6px; height: 6px; border-radius: 50%;
      background: ${accentColor}; display: inline-block;
    `;
    subtitle.appendChild(dot);
    const subtitleText = document.createElement("span");
    subtitleText.textContent = isPositive
      ? `${friendName.username} owes you`
      : `You owe ${friendName.username}`;
    subtitle.appendChild(subtitleText);
    container.appendChild(subtitle);

    // UPI info (if available)
    const upiId = storedUser?.upiId;
    if (upiId) {
      // Separator — use solid color instead of gradient to avoid createPattern issues
      const sep = document.createElement("div");
      sep.style.cssText = `
        width: 100%; height: 1px; margin: 24px 0;
        background: rgba(255,255,255,0.06);
      `;
      container.appendChild(sep);

      const upiBox = document.createElement("div");
      upiBox.style.cssText = `
        width: 100%; display: flex; align-items: center; gap: 14px;
        padding: 14px 20px; border-radius: 14px;
        background: rgba(99,102,241,0.06); border: 1px solid rgba(99,102,241,0.15);
      `;
      // UPI Icon circle — use text-align instead of flex centering for html2canvas compat
      const iconCircle = document.createElement("div");
      iconCircle.textContent = "₹";
      iconCircle.style.cssText = `
        width: 36px; height: 36px; min-width: 36px; min-height: 36px;
        border-radius: 10px;
        background: rgba(99,102,241,0.12); color: #818cf8;
        text-align: center; line-height: 36px;
        font-size: 16px; font-weight: 700;
      `;
      upiBox.appendChild(iconCircle);

      const upiTextCol = document.createElement("div");
      upiTextCol.style.cssText = `display: flex; flex-direction: column; gap: 2px;`;
      const upiLabel = document.createElement("div");
      upiLabel.textContent = "PAY VIA UPI";
      upiLabel.style.cssText = `
        font-size: 9px; font-weight: 700; letter-spacing: 2px;
        color: rgba(129,140,248,0.5); text-transform: uppercase;
      `;
      const upiValue = document.createElement("div");
      upiValue.textContent = upiId;
      upiValue.style.cssText = `
        font-size: 15px; font-weight: 500; color: #c7d2fe;
        font-family: 'Segoe UI', Arial, sans-serif;
      `;
      upiTextCol.appendChild(upiLabel);
      upiTextCol.appendChild(upiValue);
      upiBox.appendChild(upiTextCol);
      container.appendChild(upiBox);
    }

    // Branding footer — use solid color instead of gradient
    const footerSep = document.createElement("div");
    footerSep.style.cssText = `
      width: 100%; height: 1px; margin-top: 24px;
      background: rgba(255,255,255,0.04);
    `;
    container.appendChild(footerSep);

    const footer = document.createElement("div");
    footer.textContent = "Tracked on FairFare";
    footer.style.cssText = `
      font-size: 10px; font-weight: 500; letter-spacing: 1.5px;
      color: #27272a; margin-top: 16px; text-transform: uppercase;
    `; 
    container.appendChild(footer);

    document.body.appendChild(container);

    // Force a layout reflow so the browser computes actual dimensions
    // before html2canvas tries to read them. This is critical on mobile.
    // eslint-disable-next-line no-unused-expressions
    container.offsetHeight;

    try {
      // Read actual computed dimensions after reflow
      const containerRect = container.getBoundingClientRect();
      const captureW = Math.max(containerRect.width, 420);
      const captureH = Math.max(containerRect.height, 200);

      const canvas = await html2canvas(container, {
        backgroundColor: "#0a0a0a",
        scale: 3,
        useCORS: true,
        logging: false,
        width: captureW,
        height: captureH,
        // Strip any remaining gradients/images in the clone to prevent createPattern errors
        onclone: (clonedDoc, clonedEl) => {
          clonedEl.style.opacity = "1";
          clonedEl.style.position = "static";
          // Remove any background-image on all children to prevent canvas pattern errors
          const allEls = clonedEl.querySelectorAll("*");
          allEls.forEach((el) => {
            const bg = window.getComputedStyle(el).backgroundImage;
            if (bg && bg !== "none") {
              el.style.backgroundImage = "none";
            }
          });
        },
      });

      document.body.removeChild(container);

      const dataUrl = canvas.toDataURL("image/png");
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "balance.png", { type: "image/png" });

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({
            files: [file],
            title: "Balance Summary",
            text: shareText,
          });
        } catch (shareError) {
          navigator.clipboard.writeText(shareText);
          toast.success("Balance text copied!");
        }
      } else {
        const item = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([item]);
        toast.success("Balance image copied! Paste in WhatsApp.");
        setTimeout(() => {
          navigator.clipboard.writeText(shareText);
          toast("Balance text copied!", { icon: "🔗" });
        }, 1500);
      }
    } catch (error) {
      // Safely remove container if it's still in the DOM
      if (container.parentNode) {
        document.body.removeChild(container);
      }
      console.error("Error sharing balance:", error);
      // Fallback: share text only instead of failing silently
      try {
        if (navigator.share) {
          await navigator.share({ title: "Balance Summary", text: shareText });
        } else {
          await navigator.clipboard.writeText(shareText);
          toast.success("Balance text copied to clipboard!");
        }
      } catch (fallbackErr) {
        toast.error("Failed to share balance");
      }
    }
  };

  useEffect(() => {
    if (!transactions || transactions.length === 0) return;

    const hash = window.location.hash.replace("#", "");
    if (hash) {
      // Scroll to the specific transaction from the URL hash
      requestAnimationFrame(() => {
        const target = document.getElementById(`tx-card-${hash}`);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          // Brief highlight effect
          target.style.transition = "box-shadow 0.3s ease";
          target.style.boxShadow = "0 0 0 2px #818cf8, 0 0 20px rgba(129,140,248,0.3)";
          setTimeout(() => {
            target.style.boxShadow = "";
          }, 3000);
        }
      });
    } else {
      requestAnimationFrame(() => {
        scrollToBottom();
        handleScroll();
      });
    }
  }, [transactions]);

  useEffect(() => {
    handleScroll();
    const el = chatContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  async function fetchData(initialUser, silent = false) {
    try {
      const currentUserId = Cookies.get("id");
      if (!currentUserId) {
        toast.error("User session expired. Please log in again.");
        navigate("/login");
        return;
      }

      let user = initialUser;

      // 1. Sync User Data if needed (compare updatedAt)
      try {
        if (user) {
          const lastUpdatedAtUser = await api.get(
            `${API_BASE}/user/last-updated-at/${currentUserId}`
          );
          if (
            new Date(lastUpdatedAtUser.data.lastUpdatedAt).getTime() !==
            new Date(user.updatedAt).getTime()
          ) {
            const response = await api.get(`${API_BASE}/user/${currentUserId}`);
            if (response.status === 200) {
              user = response.data.user;
              setStoredUser(user);
              localStorage.setItem("user", JSON.stringify(user));
            }
          }
        } else {
          const response = await api.get(`${API_BASE}/user/${currentUserId}`);
          if (response.status === 200) {
            user = response.data.user;
            setStoredUser(user);
            localStorage.setItem("user", JSON.stringify(user));
          }
        }
      } catch (syncErr) {
        console.error("Failed to sync user data:", syncErr);
        // Continue with local data if sync fails
      }

      if (!user) {
        toast.error("No user data found");
        return;
      }

      // 2. Immediately set basic info from current user data
      const friend = user?.friends?.find((f) => f.friend?._id === friendId);

      // If this person is not a friend, redirect to their public profile
      // BUT first check if it's a self-share link (friendId === currentUserId)
      // If so, let the useEffect handle the redirect to the sharerId
      if (!friend) {
        if (friendId === currentUserId) return;
        navigate(`/public-profile/${friendId}?from=transactions`, { replace: true });
        return;
      }

      setFriendName(friend?.friend || { username: "Unknown" });
      setNetBalance(friend?.balance || 0);

      // Only set global loading to false if this is the first load
      if (!silent) setLoading(false);

      // 3. Fetch remote data (Transactions & Last Seen)
      if (!silent) setTxLoading(true);
      const txRes = await api.get(`${API_BASE}/expenses/${currentUserId}/${friendId}`);
      
      // Sort & Process transactions
      const sortedTransactions = txRes.data.expenses.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setTransactions(sortedTransactions.reverse());

      // Extract activity info
      if (txRes.data.lastAtive) {
        setActivityInfo({ lastAtive: txRes.data.lastAtive });
      } else if (txRes.data.updatedAt) {
        setActivityInfo({ updatedAt: txRes.data.updatedAt });
      } else {
        setActivityInfo(null);
      }
    } catch (err) {
      toast.error("Error fetching data!");
      console.error(err);
    } finally {
      setTxLoading(false);
    }
  }

  useEffect(() => {
    fetchData(storedUser);
  }, [friendId]);

  const confirmPaid = () => {
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
    setShowPaidConfirm(true);
  };

  const handlePaid = async () => {
    setShowPaidConfirm(false);
    const paidAmount = Math.abs(amount);
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
      setSuccessOverlay({ type: "paid", amount: paidAmount });
      setTimeout(() => setSuccessOverlay(null), 2000);
      setAmount(0);
      setText("");
      // Silent refetch to avoid flickering
      await fetchData(storedUser, true);
    } catch (error) {
      toast.error("Error updating friend balance (paid)");
      console.error("Error updating friend balance (paid):", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmReceived = () => {
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
    setShowReceivedConfirm(true);
  };

  const handleReceived = async () => {
    setShowReceivedConfirm(false);
    const receivedAmount = Math.abs(amount);
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
      setSuccessOverlay({ type: "received", amount: receivedAmount });
      setTimeout(() => setSuccessOverlay(null), 2000);
      setAmount(0);
      setText("");
      // Silent refetch to avoid flickering
      await fetchData(storedUser, true);
    } catch (error) {
      toast.error("Error updating friend balance (received)");
      console.error("Error updating friend balance (received):", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmSendReminder = () => {
    const currentBalance = netBalance;
    if (currentBalance === 0) {
      toast.error("No balance to remind.");
      return;
    }
    if (currentBalance < 0) {
      toast.error("You owe money. Cannot send reminder.");
      return;
    }
    setShowReminderConfirm(true);
  };

  const handleSendReminder = async () => {
    setShowReminderConfirm(false);
    try {
      await api.post(`${API_BASE}/user/notify`, {
        userId: userId,
        friendId: friendId,
      });
      toast.success("Payment reminder sent!");
    } catch (error) {
      toast.error("Notification not enabled by this friend");
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
      setLoading(true);
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
      await fetchData(storedUser, true);
      setNetBalance(0);
    } catch (error) {
      toast.error("Please refresh the page first!");
    } finally {
      setLoading(false);
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

  const getActivityText = () => {
    if (!activityInfo) return "NO_ACTIVITY_DATA";

    const value = activityInfo.lastAtive || activityInfo.updatedAt;
    if (!value) return "NO_ACTIVITY_DATA";

    const lastSeenDate = new Date(value);
    const now = new Date();
    let diffInSeconds = Math.floor((now - lastSeenDate) / 1000);

    if (diffInSeconds < 0) {
      diffInSeconds = Math.abs(diffInSeconds);
      if (diffInSeconds >= 10) {
        diffInSeconds -= 10;
      }
    }

    if (activityInfo.lastAtive && diffInSeconds <= 10) {
      return "Active";
    }

    const options = { hour: "numeric", minute: "numeric", hour12: true };
    const timeStr = lastSeenDate.toLocaleTimeString([], options);

    const isToday = lastSeenDate.toDateString() === now.toDateString();
    if (isToday) {
      return `Last seen today at ${timeStr}`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      lastSeenDate.toDateString() === yesterday.toDateString();
    if (isYesterday) {
      return `Last seen yesterday at ${timeStr}`;
    }

    return `Last seen on ${lastSeenDate.toLocaleDateString()} at ${timeStr}`;
  };

  const handleCopyUpi = () => {
    if (friendName?.upiId) {
      navigator.clipboard.writeText(friendName.upiId);
      toast.success("UPI ID copied to clipboard!");
    } else {
      toast.error("UPI ID not available");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30 overflow-hidden relative">
      {/* --- BACKGROUND FX --- */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* --- SUCCESS CELEBRATION OVERLAY --- */}
      <AnimatePresence>
        {successOverlay && (
          <motion.div
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setSuccessOverlay(null)}
          >
            {/* Glow ring */}
            <motion.div
              className={`absolute w-44 h-44 rounded-full blur-3xl ${
                successOverlay.type === "paid" ? "bg-rose-500/20" : "bg-emerald-500/20"
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />

            {/* Particle burst */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-2 h-2 rounded-full ${
                  successOverlay.type === "paid" ? "bg-rose-400" : "bg-emerald-400"
                }`}
                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1, 0.5],
                  x: Math.cos((i * Math.PI * 2) / 8) * 80,
                  y: Math.sin((i * Math.PI * 2) / 8) * 80,
                  opacity: [1, 1, 0],
                }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              />
            ))}

            {/* Checkmark circle */}
            <motion.div
              className={`relative w-24 h-24 rounded-full border-2 flex items-center justify-center mb-5 ${
                successOverlay.type === "paid"
                  ? "border-rose-500"
                  : "border-emerald-500"
              }`}
              initial={{ scale: 0, rotate: -60 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.05 }}
            >
              <motion.div
                className={`absolute inset-0 rounded-full ${
                  successOverlay.type === "paid"
                    ? "bg-rose-600/20"
                    : "bg-emerald-600/20"
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.25, duration: 0.3 }}
              />
              <svg className={`w-12 h-12 ${
                successOverlay.type === "paid" ? "text-rose-400" : "text-emerald-400"
              }`} viewBox="0 0 24 24" fill="none">
                <motion.path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.35, duration: 0.4, ease: "easeOut" }}
                />
              </svg>
            </motion.div>

            {/* Text */}
            <motion.p
              className="text-xl font-bold text-white mb-1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              {successOverlay.type === "paid" ? "Payment Recorded!" : "Receipt Recorded!"}
            </motion.p>
            <motion.p
              className={`text-3xl font-mono font-bold tracking-tight ${
                successOverlay.type === "paid" ? "text-rose-400" : "text-emerald-400"
              }`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              {successOverlay.type === "paid" ? "-" : "+"}₹{successOverlay.amount.toFixed(2)}
            </motion.p>
            <motion.p
              className="text-xs text-zinc-500 mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Tap anywhere to dismiss
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- HEADER: The Control Panel --- */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-20 bg-zinc-900/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20"
      >
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
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
              className="flex items-center gap-2 group"
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
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-white leading-none mb-2 mt-2 group-hover:text-indigo-300 transition-colors truncate">
                  {friendName.username}
                </h2>
                <div className="flex items-center mt-0 overflow-hidden">
                  {(txLoading || loading) ? (
                    <div className="flex items-center gap-1.5 py-1">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                      <span className="text-[10px] font-mono text-indigo-400/70 animate-pulse tracking-tight">
                        SYNCING_STATUS...
                      </span>
                    </div>
                  ) : (
                    <span
                      className={`text-[10px] font-mono whitespace-nowrap ${getActivityText() === "Active" ? "text-emerald-400 font-bold" : "text-zinc-500"}`}
                      style={{ wordSpacing: "-0.15em" }}
                    >
                      {getActivityText()}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={confirmSendReminder}
              className="p-2.5 rounded-xl bg-zinc-800/50 hover:bg-yellow-500/10 text-zinc-400 hover:text-yellow-400 border border-transparent hover:border-yellow-500/20 transition-all"
              title="Send Reminder"
            >
              <FaBell size={16} />
            </button>
            <button
              onClick={confirmSettle}
              disabled={loading || txLoading}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-900/30 transition-all duration-300 group whitespace-nowrap ${loading || txLoading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:from-indigo-500 hover:to-violet-500 active:scale-95'
                }`}
              title="Settle Up"
            >
              {loading || txLoading ? 'Loading...' : 'Settle All'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* --- BALANCE TICKER --- */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="relative z-10 py-4 bg-zinc-950/50 border-b border-white/5 backdrop-blur-sm"
      >
        <div id="balance-ticker-card" className="max-w-3xl mx-auto flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-1">
            Net Position
          </span>
          <div
            className={`text-4xl font-mono font-medium tracking-tighter ${netBalance >= 0
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

          {friendName?.upiId && (
            <div className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-indigo-500/5 border border-indigo-500/20 rounded-lg group hover:bg-indigo-500/10 transition-all duration-300">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-indigo-400/70 font-bold leading-none mb-0.5">
                  UPI ID
                </span>
                <span className="text-sm font-mono text-indigo-200">
                  {friendName.upiId}
                </span>
              </div>
              <button
                onClick={handleCopyUpi}
                className="ml-2 p-1.5 rounded-md text-indigo-400 hover:text-indigo-200 hover:bg-indigo-500/20 transition-colors"
                title="Copy UPI ID"
              >
                <FaCopy size={14} />
              </button>
            </div>
          )}

          {/* Share Balance Button */}
          <button
            data-ignore-screenshot="true"
            onClick={handleShareBalance}
            className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/50 hover:bg-indigo-500/10 text-zinc-400 hover:text-indigo-400 border border-transparent hover:border-indigo-500/20 transition-all text-xs font-medium"
            title="Share Balance"
          >
            <FaShareAlt size={12} />
            Share Balance
          </button>
        </div>
      </motion.div>

      {/* --- STREAM AREA --- */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 custom-scrollbar relative z-0"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {(txLoading || loading) ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              {/* Sequential pulse bars for transaction list loading */}
              {[1, 2, 3].map((i) => (
                <div key={i} className={`w-full max-w-[70%] h-24 bg-zinc-900/50 rounded-xl border border-white/5 animate-pulse flex flex-col p-4 gap-2 ${i % 2 === 0 ? 'self-end' : 'self-start'}`}>
                  <div className="w-1/3 h-3 bg-zinc-800 rounded"></div>
                  <div className="w-1/2 h-2 bg-zinc-800/50 rounded"></div>
                  <div className="mt-auto self-end w-1/4 h-6 bg-indigo-900/20 rounded"></div>
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="h-full mt-20 flex flex-col items-center justify-center opacity-50">
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
                const isUser = tx.paidBy._id === userId;
                const owedEntry = isUser
                  ? tx.owedBy.find((o) => o.user._id === friendId)
                  : tx.owedBy.find((o) => o.user._id === userId);
                const amount = owedEntry ? owedEntry.amount : 0;

                return (
                  <div
                    key={tx._id}
                    className={`flex w-full items-center group ${isUser ? "justify-end" : "justify-start"
                      } animate-in slide-in-from-bottom-2 duration-500`}
                  >
                    {/* Forward button on the LEFT for user's transactions */}
                    {isUser && (
                      <button
                        onClick={() => handleShareTransaction(tx._id, amount, friendName, tx.paidBy._id === userId ? storedUser?.upiId : friendName?.upiId)}
                        className="p-2 rounded-full text-zinc-500 hover:text-indigo-400 hover:bg-white/5 transition-all opacity-60 group-hover:opacity-100 mr-1 flex-shrink-0"
                        title="Share Receipt"
                      >
                        <Forward size={18} className="ml-0.5" />
                      </button>
                    )}

                    {/* Digital Receipt Bubble */}
                    <div className={`relative max-w-[85%] sm:max-w-xs`}>
                      {/* Visual Connector Line to Side */}
                      <div
                        className={`absolute top-4 w-2 h-[1px] ${isUser
                          ? "-right-2 bg-indigo-500/50"
                          : "-left-2 bg-zinc-600/50"
                          }`}
                      ></div>

                      <div
                        id={`tx-card-${tx._id}`}
                        className={`
                        relative p-4 rounded-xl border backdrop-blur-md shadow-lg transition-all duration-300
                        ${isUser
                            ? "bg-indigo-950/30 border-indigo-500/30 rounded-tr-sm hover:border-indigo-500/50"
                            : "bg-zinc-900/60 border-white/10 rounded-tl-sm hover:border-white/20"
                          }
                      `}
                      >
                        {/* Header: Title & Date */}
                        <div className="flex justify-between items-start gap-4 mb-2 border-b border-white/5 pb-2">
                          <span
                            className={`text-sm font-bold truncate ${isUser ? "text-indigo-200" : "text-zinc-200"
                              }`}
                          >
                            {tx.title || "Untitled Transaction"}
                          </span>
                          <div className="flex justify-between iterms-start gap-1">
                            <span className="text-[10px] font-mono text-zinc-500 whitespace-nowrap pt-0.5">
                              {new Date(tx.createdAt).toLocaleDateString([])}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500 whitespace-nowrap pt-0.5">
                              {new Date(tx.createdAt).toLocaleTimeString([])}
                            </span>
                          </div>
                        </div>

                        {/* Content: Amount & Who Paid */}
                        <div className="flex justify-between items-end">
                          <div className="flex flex-col mr-2">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">
                              {isUser ? "You Paid" : "They Paid"}
                            </span>
                            <span className="text-[10px] text-zinc-400 bg-black/20 px-1.5 py-0.5 rounded">
                              {tx.groupName}
                            </span>
                          </div>
                          <div
                            className={`text-2xl font-mono font-medium tracking-tight ${isUser ? "text-indigo-400" : "text-white"
                              }`}
                          >
                            ₹{amount.toFixed(2)}
                          </div>
                        </div>

                        {/* Corner Decoration */}
                        <div
                          className={`absolute bottom-0 w-3 h-3 border-b border-l ${isUser
                            ? "right-0 border-indigo-500/30 rounded-bl-lg"
                            : "left-0 border-zinc-500/30 rounded-br-lg"
                            }`}
                        ></div>
                      </div>
                    </div>

                    {/* Forward button on the RIGHT for friend's transactions */}
                    {!isUser && (
                      <button
                        onClick={() => handleShareTransaction(tx._id, amount, friendName, tx.paidBy._id === userId ? storedUser?.upiId : friendName?.upiId)}
                        className="p-2 rounded-full text-zinc-500 hover:text-indigo-400 hover:bg-white/5 transition-all opacity-60 group-hover:opacity-100 ml-1 flex-shrink-0"
                        title="Share Receipt"
                      >
                        <Forward size={18} className="ml-0.5" />
                      </button>
                    )}
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </>
          )}
        </div>
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
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        className="p-4 bg-zinc-950/80 backdrop-blur-xl border-t border-white/5 relative z-30"
      >
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
              onClick={confirmReceived}
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98]"
            >
              + Received
            </button>
            <button
              onClick={confirmPaid}
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98]"
            >
              - Paid
            </button>
          </div>
        </div>
      </motion.div>

      {/* --- CONFIRMATION MODAL - SETTLE UP --- */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl"
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
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
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 shadow-lg shadow-emerald-900/20"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- CONFIRMATION MODAL - PAID --- */}
      <AnimatePresence>
        {showPaidConfirm && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl"
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              <h3 className="text-lg font-bold text-white mb-2">
                Confirm Payment?
              </h3>
              <p className="text-sm text-zinc-400 mb-4">
                You are recording that <strong className="text-rose-400">you paid ₹{Math.abs(amount)}</strong> to{" "}
                <strong className="text-white">{friendName.username}</strong>.
                Or on behalf of <strong className="text-white">{friendName.username}</strong>.
              </p>
              <p className="text-xs text-zinc-500 bg-zinc-800/50 border border-white/5 rounded-lg p-3 mb-6">
                <strong className="text-zinc-300">Note:</strong> "{text}"<br />
                <strong className="text-zinc-300 mt-2 block">Effect:</strong> This will reduce your balance by ₹{Math.abs(amount)}. If they owed you money, they will owe less. If you already owe them, you'll owe more.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaidConfirm(false)}
                  className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 font-medium hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaid}
                  className="flex-1 py-2.5 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-500 shadow-lg shadow-rose-900/20 transition-colors"
                >
                  Confirm Payment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- CONFIRMATION MODAL - RECEIVED --- */}
      <AnimatePresence>
        {showReceivedConfirm && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl"
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              <h3 className="text-lg font-bold text-white mb-2">
                Confirm Receipt?
              </h3>
              <p className="text-sm text-zinc-400 mb-4">
                You are recording that you <strong className="text-emerald-400">received ₹{Math.abs(amount)}</strong> from{" "}
                <strong className="text-white">{friendName.username}</strong>.
                Or <strong className="text-white">{friendName.username}</strong> paid <strong className="text-emerald-400">received ₹{Math.abs(amount)}</strong> on your behalf.
              </p>
              <p className="text-xs text-zinc-500 bg-zinc-800/50 border border-white/5 rounded-lg p-3 mb-6">
                <strong className="text-zinc-300">Note:</strong> "{text}"<br />
                <strong className="text-zinc-300 mt-2 block">Effect:</strong> This will increase your balance by ₹{Math.abs(amount)}. If they owed you money, they will owe more. If you owed them, you'll owe less.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReceivedConfirm(false)}
                  className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 font-medium hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReceived}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 transition-colors"
                >
                  Confirm Receipt
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- CONFIRMATION MODAL - SEND REMINDER --- */}
      <AnimatePresence>
        {showReminderConfirm && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl"
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              <h3 className="text-lg font-bold text-white mb-2">
                Send Payment Reminder?
              </h3>
              <p className="text-sm text-zinc-400 mb-4">
                Do you want to send a reminder to{" "}
                <strong className="text-white">{friendName.username}</strong> to settle the balance between you guys?
              </p>
              <p className="text-xs text-zinc-500 bg-zinc-800/50 border border-white/5 rounded-lg p-3 mb-6">
                <strong className="text-zinc-300">Current Balance:</strong> <span className="text-emerald-400">+₹{Math.abs(netBalance).toFixed(2)}</span><br />
                <strong className="text-zinc-300 mt-2 block">Effect:</strong> This will send a push notification to {friendName.username} reminding them about the pending balance.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReminderConfirm(false)}
                  className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 font-medium hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendReminder}
                  className="flex-1 py-2.5 rounded-lg bg-yellow-600 text-white font-medium hover:bg-yellow-500 shadow-lg shadow-yellow-900/20 transition-colors"
                >
                  Send Reminder
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TransactionHistory;
