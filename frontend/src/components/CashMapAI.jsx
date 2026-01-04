import React, { useState, useEffect } from "react";
import { ArrowLeft, Bot, Send, ArrowDown, Zap, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import userIcon from "../../public/userIcon.png";
import api from "../utils/api";

function CashMapAI() {
  const chatContainerRef = React.useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const timeoutRef = React.useRef(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);

  const [messages, setMessages] = useState(() => {
    const storedChat = localStorage.getItem("chatMessages");
    if (storedChat) {
      try {
        return JSON.parse(storedChat);
      } catch (error) {
        console.error("Error parsing chatMessages:", error);
      }
    }
    return [
      {
        type: "bot",
        content:
          "Hello! I'm Fair AI, your personal finance assistant. How can I help you today?",
      },
    ];
  });

  const [input, setInput] = useState("");
  const [dailyCount, setDailyCount] = useState(() => {
    const stored = localStorage.getItem("user");
    const parsedStored = stored ? JSON.parse(stored) : null;

    let count = 0;

    if (parsedStored?.aiChatUsage?.count) {
      count = parseInt(parsedStored.aiChatUsage.count);
    }

    localStorage.setItem("dailyAIQueryCounter", count.toString());

    return parseInt(localStorage.getItem("dailyAIQueryCounter")) || 0;
  });

  useEffect(() => {
    const chatEl = chatContainerRef.current;
    if (!chatEl) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatEl;
      const buffer = 100; // Allow a little wiggle room
      if (scrollTop + clientHeight >= scrollHeight - buffer) {
        setIsAtBottom(true);
      } else {
        setIsAtBottom(false);
      }
    };

    chatEl.addEventListener("scroll", handleScroll);
    return () => chatEl.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    scrollToBottom();
    
    // Check if we need to reset the daily counter based on lastUsed timestamp
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const aiChatUsage = user?.aiChatUsage;
        
        if (aiChatUsage?.lastUsed) {
          const lastUsedDate = new Date(aiChatUsage.lastUsed);
          const currentDate = new Date();
          const hoursDifference = (currentDate - lastUsedDate) / (1000 * 60 * 60);
          
          // If more than 24 hours have passed, reset the counter
          if (hoursDifference >= 24) {
            localStorage.setItem("dailyAIQueryCounter", "0");
            setDailyCount(0);
            return;
          }
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
    
    // Otherwise, use the existing counter value
    const dailyAIQueryCount = localStorage.getItem("dailyAIQueryCounter");
    setDailyCount(parseInt(dailyAIQueryCount) || 0);
  }, []);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
    setProfilePhotoUrl(JSON.parse(localStorage.getItem("user")).profilePhotoUrl);
  }, [messages]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const chatEl = chatContainerRef.current;
    if (!chatEl) return;

    let scrollTimeout;

    const handleScroll = () => {
      chatEl.classList.add("show-scrollbar");

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        chatEl.classList.remove("show-scrollbar");
      }, 1200); // adjust as needed
    };

    chatEl.addEventListener("scroll", handleScroll);

    return () => {
      chatEl.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { type: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsWaitingForResponse(true); // Disable input

    const tempBotMessage = {
      type: "bot",
      content:
        "I'm analyzing your spending patterns and will provide insights shortly...",
    };
    setMessages((prev) => [...prev, tempBotMessage]);
    setTimeout(() => nudgeForAIReply(), 200); // add a slight delay to let DOM update

    scrollToBottom();

    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : {};
      const userId = user?._id || "";

      const response = await api.post("https://fair-ai.onrender.com/assist", {
        userId,
        query: input,
      });
      clearTimeout(timeoutRef.current); // Clear timeout if response arrives
      setIsWaitingForResponse(false);

      const data = response?.data;
      const answer = data?.answer || "Sorry, something went wrong!";

      setMessages((prev) => {
        const updated = [...prev];
        updated.pop(); // Remove analyzing message
        return [...updated, { type: "bot", content: answer }];
      });
    } catch (error) {
      console.error("Error:", error);
      clearTimeout(timeoutRef.current);
      setIsWaitingForResponse(false);

      setMessages((prev) => {
        const updated = [...prev];
        updated.pop(); // Remove analyzing message
        return [
          ...updated,
          {
            type: "bot",
            content: "⚠ Error retrieving response. Please try again.",
          },
        ];
      });
    } finally {
      // Fetch updated user data from backend and update localStorage
      // This runs regardless of success or error
      try {
        const storedUser = localStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : {};
        const userId = user?._id || "";

        const API_BASE = import.meta.env.VITE_API_BASE_URL;
        const userResponse = await api.get(`${API_BASE}/user/${userId}`);
        if (userResponse?.data) {
          localStorage.setItem("user", JSON.stringify(userResponse.data.user));
          
          // Update dailyAIQueryCounter based on fetched user data
          const updatedCount = userResponse.data?.user?.aiChatUsage?.count || 0;
          localStorage.setItem("dailyAIQueryCounter", updatedCount.toString());
          setDailyCount(updatedCount);
        }
      } catch (userFetchError) {
        console.error("Error fetching updated user data:", userFetchError);
        // Don't throw - this is a non-critical update
      }
    }
  };

  const nudgeForAIReply = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight - 100, // approx 2-3 lines
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-950 text-white overflow-hidden relative font-sans">
      {/* --- PREMIUM ATMOSPHERIC BACKGROUND --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Background Gradients (Enhanced, Subtler Colors) */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      {/* --- HEADER (Fixed Top Bar) --- */}
      <div className="p-4 border-b border-white/10 backdrop-blur-md bg-slate-900/80 z-20 sticky top-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            to="/dash"
            className="group flex items-center text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-3 group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-medium text-sm tracking-wide">Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-cyan-400" />
            <span className="font-extrabold text-xl tracking-tight text-white">
              Fair <span className="text-cyan-400">AI</span>
            </span>
          </div>
        </div>
      </div>

      {/* --- Query Limit Status Bar --- */}
      <div className="px-4 py-2 text-center text-sm z-10 max-w-4xl mx-auto w-full">
        {dailyCount >= 10 ? (
          <div className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg py-2">
            <Zap className="inline-block w-4 h-4 mr-2" />
            You've reached your **10 query limit** for today! 🚫
          </div>
        ) : (
          <div className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg py-2">
            <Zap className="inline-block w-4 h-4 mr-2" />
            You've used **{dailyCount} of 10** queries today.
          </div>
        )}
      </div>

      {/* --- CHAT MESSAGES CONTAINER --- */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 z-10 max-w-4xl mx-auto w-full custom-scrollbar"
      >
        <div className="space-y-6">
          {messages?.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {/* Profile Avatar/Icon for AI */}
              {message.type !== "user" && (
                <div className="w-8 h-8 rounded-full bg-cyan-600/20 border border-cyan-600/50 flex items-center justify-center mr-3 shrink-0 self-start mt-1">
                  <Bot className="w-4 h-4 text-cyan-400" />
                </div>
              )}

              <div
                style={{ whiteSpace: "pre-line" }}
                className={`max-w-[75%] rounded-2xl p-4 transition-all duration-300 shadow-xl ${
                  message.type === "user"
                    ? "bg-indigo-600 text-white rounded-br-md self-start"
                    : "bg-slate-800/80 text-gray-100 rounded-tl-md border border-white/5"
                }`}
              >
                {/* User Message Text */}
                {message.content}
              </div>

              {/* Profile Avatar/Icon for User */}
              {message.type === "user" && (
                <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-600/50 flex items-center justify-center ml-3 shrink-0 self-start mt-1">
                  <img
                    src={profilePhotoUrl || userIcon}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* --- Scroll to bottom arrow (FAB) --- */}
      {!isAtBottom && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-20">
          <button
            onClick={scrollToBottom}
            className="w-12 h-12 bg-cyan-500 hover:bg-cyan-600 text-white p-2 rounded-full shadow-2xl shadow-cyan-500/40 transition-all duration-300 animate-bounce active:scale-95"
          >
            <ArrowDown className="h-5 w-5 mx-auto" />
          </button>
        </div>
      )}

      {/* --- INPUT FIELD BAR (Sticky Bottom) --- */}
      <div className="p-4 border-t border-white/5 backdrop-blur-md bg-slate-900/80 z-20 shrink-0">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-3">
          <div className="flex-1 relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder={
                dailyCount >= 10
                  ? "Query limit reached for today!"
                  : isWaitingForResponse
                  ? "Waiting for AI response..."
                  : "Ask about your finances, balances, or insights..."
              }
              className={`w-full bg-slate-800/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-inner placeholder-slate-500 text-sm ${
                (dailyCount >= 10 || isWaitingForResponse) &&
                "opacity-60 cursor-not-allowed"
              }`}
              disabled={dailyCount >= 10 || isWaitingForResponse}
            />
          </div>

          <button
            type="submit"
            className={`w-12 h-12 rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center ${
              dailyCount >= 10 || isWaitingForResponse
                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-600 to-indigo-600 text-white hover:from-cyan-500 hover:to-indigo-500 active:scale-95"
            }`}
            disabled={dailyCount >= 10 || isWaitingForResponse}
          >
            {isWaitingForResponse ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>

      <style>{`
        /* Assuming 'User' icon is available, otherwise replace with a generic icon or initials */
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.6; }
        }
        .animate-pulse { animation: pulse 4s ease-in-out infinite; }
        
        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.25); }
      `}</style>
    </div>
  );
}

export default CashMapAI;
