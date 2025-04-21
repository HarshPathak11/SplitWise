import React, { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaRobot,
  FaArrowDown,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function CashMapAI() {
  const chatContainerRef = React.useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const timeoutRef = React.useRef(null);

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
    const dailyAIQueryCount = localStorage.getItem("dailyAIQueryCounter");    
      setDailyCount(parseInt(dailyAIQueryCount) || 0);
  }, []);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
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

    if (dailyCount >= 10) {
      toast.error("You've reached the 10 queries limit for today!");
      return;
    }

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

    // Timeout in case no response in 5 seconds
    timeoutRef.current = setTimeout(() => {
      setIsWaitingForResponse(false); // Re-enable input
      setMessages((prev) => {
        const updated = [...prev];
        updated.pop(); // Remove the "analyzing..." message
        return [
          ...updated,
          {
            type: "bot",
            content: "⚠️ Sorry, something went wrong. Please try again.",
          },
        ];
      });
    }, 5000); // 5 seconds fallback timeout

    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : {};
      const userId = user?._id || "";

      const response = await axios.post("http://localhost:5000/assist", {
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

      setDailyCount(response?.data?.updatedCount);
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
            content: "⚠️ Error retrieving response. Please try again.",
          },
        ];
      });
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
    <div className="flex flex-col h-[100dvh] bg-[#000000] text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="w-[500px] h-[500px] bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-30 animate-move"></div>
        <div className="w-[400px] h-[400px] bg-gradient-to-r from-blue-500 to-green-500 rounded-full blur-3xl opacity-30 animate-rotate delay-2000"></div>
        <div className="w-[600px] h-[600px] bg-gradient-to-r from-yellow-500 to-red-500 rounded-full blur-3xl opacity-30 animate-move delay-4000"></div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-lg opacity-50 animate-bounce"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full blur-lg opacity-50 animate-bounce delay-3000"></div>
      </div>

      {/* Header */}
      <div className="bg-glass-800 p-4 border-b border-gray-700 z-10 relative">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/dash" className="flex items-center text-white-400">
            <FaArrowLeft className="h-5 mr-2 w-5" cursor-pointer />
          </Link>
          <div className="flex items-center">
            <FaRobot className="h-6 w-6 text-emerald-500 mr-2" />
            <span className="font-semibold">Fair AI</span>
          </div>
        </div>
      </div>

      {dailyCount >= 10 ? (
        <div className="text-center text-red-500 bg-glass p-2 rounded mb-2 z-10 relative">
          You&apos;ve reached your 10 query limit for today! Please come back
          tomorrow.
        </div>
      ) : (
        <div className="text-center text-emerald-400 bg-transparent p-2 rounded mb-2 z-10 relative">
          You’ve used {dailyCount} of 10 queries today.
        </div>
      )}

      {/* Chat Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 z-10 relative max-w-4xl mx-auto w-full custom-scrollbar"
      >
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.type === "user"
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-800 text-gray-100"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/*Scroll to bottom arrow*/}
      {!isAtBottom && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20">
          <button
            onClick={scrollToBottom}
            className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-full shadow-lg transition-all"
          >
            <FaArrowDown className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Input Field */}
      <div className="p-4 border-t border-gray-700 bg-glass-800 z-10 relative">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}            
            placeholder={
              dailyCount >= 10
                ? "Query limit reached for today!"
                : isWaitingForResponse
                ? "Waiting for AI response..."
                : "Ask about your expenses, balances, or get financial insights..."
            }
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
            disabled={dailyCount >= 10 || isWaitingForResponse}
          />

          <button
            type="submit"
            className={`px-4 py-2 rounded-lg transition-colors ${
              dailyCount >= 10 || isWaitingForResponse
                ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                : "bg-emerald-500 text-white hover:bg-emerald-600"
            }`}
            disabled={dailyCount >= 10 || isWaitingForResponse}
          >
            <FaArrowRight className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default CashMapAI;
