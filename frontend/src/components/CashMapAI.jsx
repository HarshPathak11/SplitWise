import React, { useState, useEffect } from "react";
import { ArrowLeft, Bot, Send, ArrowDown, Zap, Loader2, Copy, Check } from "lucide-react";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import userIcon from "../../public/userIcon.png";
import api from "../utils/api";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

function CashMapAI() {
  const chatContainerRef = React.useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const timeoutRef = React.useRef(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
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
  const [dailyCount, setDailyCount] = useState(0);

  const fetchAiUsage = async () => {
    try {
      const userId = Cookies.get("id");
      if (!userId) {
        console.warn("⚠️ No User ID found in cookies for AI usage fetch.");
        return;
      }

      // Consistent with Dashboard.jsx usage: use absolute URL if needed, 
      // but api utility handles baseURL. Let's try relative first as per standard practice,
      // or match Dashboard's absolute style if it's proven to work.
      const response = await api.get(`/user/ai-usage/${userId}`);
      
      if (response.data && typeof response.data.usageCount === 'number') {
        setDailyCount(response.data.usageCount);
      } else if (response.data && typeof response.data.count === 'number') {
        setDailyCount(response.data.count);
      }
    } catch (error) {
      console.error("❌ Error fetching AI usage:", error);
    }
  };

  useEffect(() => {
    const chatEl = chatContainerRef.current;
    if (!chatEl) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatEl;
      const buffer = 100;
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
    fetchAiUsage();
  }, []);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setProfilePhotoUrl(JSON.parse(storedUser).profilePhotoUrl);
    }
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
      const userId = Cookies.get("id") || "";

      const response = await api.post("/user/ai", {
        userId,
        query: input,
      });
      clearTimeout(timeoutRef.current);
      setIsWaitingForResponse(false);

      const data = response?.data;
      const answer = data?.answer || "Sorry, something went wrong!";

      // Log the model used
      if (data?.modelUsed) {
        console.log(`ℹ️ AI response generated using: ${data.modelUsed}`);
      }

      setMessages((prev) => {
        const updated = [...prev];
        updated.pop(); // Remove analyzing message
        return [...updated, { type: "bot", content: answer }];
      });
      
      // Update count from the response if available, otherwise fetch
      if (typeof data?.usageCount === 'number') {
        setDailyCount(data.usageCount);
      } else {
        await fetchAiUsage();
      }
    } catch (error) {
      console.error("Error:", error);
      clearTimeout(timeoutRef.current);
      setIsWaitingForResponse(false);

      // Get error message from backend or use default
      const errorData = error?.response?.data;
      const errorMessage = errorData?.answer || "⚠ Error retrieving response. Please try again later.";
      const errorType = errorData?.errorType;

      setMessages((prev) => {
        const updated = [...prev];
        updated.pop(); // Remove analyzing message
        return [
          ...updated,
          {
            type: "bot",
            content: errorMessage,
          },
        ];
      });

      // Show appropriate toast based on error type
      if (errorType === 'QUOTA_EXCEEDED') {
        toast.error("AI quota exceeded. Try again after midnight UTC (5:30 AM IST).", {
          duration: 5000,
        });
      } else if (errorType === 'SERVICE_ERROR') {
        toast.error("AI service temporarily unavailable. Please try again in a few minutes.", {
          duration: 4000,
        });
      } else {
        toast.error("Failed to get AI response. Please try again.", {
          duration: 3000,
        });
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
    <div className="flex flex-col h-[100dvh] w-full bg-zinc-950 text-zinc-100 overflow-x-hidden overflow-y-hidden relative font-sans selection:bg-indigo-500/30">
      {/* --- PROFESSIONAL ATMOSPHERIC BACKGROUND --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Subtle top-down spotlight */}
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-zinc-950 to-zinc-950"></div>
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      {/* --- HEADER --- */}
      <header className="px-4 py-3 md:py-4 border-b border-white/5 backdrop-blur-xl bg-zinc-900/40 z-30 sticky top-0 transition-all">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            to="/dash"
            className="group flex items-center text-zinc-400 hover:text-white transition-all duration-300"
          >
            <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center mr-2 transition-colors">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="font-medium text-xs md:text-sm tracking-wide uppercase">Dashboard</span>
          </Link>
          
          <div className="flex items-center gap-2 md:gap-3 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 shadow-inner">
            <Bot className="h-4 w-4 md:h-5 md:w-5 text-indigo-400" />
            <span className="font-bold text-base md:text-lg tracking-tight">
              Fair<span className="text-zinc-400">AI</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full animate-pulse ${dailyCount >= 10 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Active System</span>
          </div>
        </div>
      </header>

      {/* --- STATUS BAR --- */}
      <div className="px-4 py-2 z-20 max-w-4xl mx-auto w-full relative">
        <div className={`text-center py-2 px-4 rounded-xl border backdrop-blur-md transition-all duration-500 ${
          dailyCount >= 10 
            ? "text-red-400 bg-red-500/10 border-red-500/20" 
            : "text-zinc-400 bg-white/5 border-white/5"
        }`}>
          <p className="text-[11px] md:text-xs font-medium flex items-center justify-center gap-2">
            <Zap className={`w-3 h-3 ${dailyCount >= 10 ? 'text-red-500' : 'text-indigo-400'}`} />
            {dailyCount >= 10 
              ? "System limit reached. Service resumes tomorrow." 
              : `Token Utilization: ${dailyCount} of 10 daily queries used.`}
          </p>
        </div>
      </div>

      {/* --- CHAT MESSAGES CONTAINER --- */}
      <main
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 z-10 max-w-4xl mx-auto w-full custom-scrollbar space-y-8"
      >
        {messages?.map((message, index) => (
          <div
            key={index}
            className={`flex items-start animate-in fade-in slide-in-from-bottom-2 duration-500 ${
              message.type === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            <div className={`shrink-0 mt-1 ${message.type === "user" ? "ml-3" : "mr-3"}`}>
              {message.type === "bot" ? (
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center shadow-lg group hover:border-indigo-500/50 transition-colors">
                  <Bot className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                </div>
              ) : (
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl overflow-hidden border border-white/10 shadow-lg p-0.5 bg-zinc-900 group">
                  <img
                    src={profilePhotoUrl || userIcon}
                    alt="User"
                    className="w-full h-full rounded-[10px] object-cover group-hover:scale-110 transition-transform"
                  />
                </div>
              )}
            </div>

            {/* Bubble Content */}
            <div className={`relative flex flex-col ${message.type === "user" ? "items-end max-w-[80%] md:max-w-[75%]" : "items-start max-w-[80%] md:max-w-[80%]"}`}>
              <div
                className={`group relative overflow-hidden px-4 md:px-5 py-3 md:py-4 rounded-2xl shadow-2xl transition-all duration-300 border ${
                  message.type === "user"
                    ? "bg-indigo-600 border-indigo-500/30 text-white rounded-tr-none"
                    : "bg-zinc-900/60 backdrop-blur-md border-white/5 text-zinc-100 rounded-tl-none"
                }`}
              >
                {/* Subtle sheen effect for user messages */}
                {message.type === "user" && (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                )}

                {/* Content Rendering */}
                {message.type === "bot" ? (
                  <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-sm md:text-[15px] leading-relaxed relative z-10 whitespace-pre-line">{message.content}</div>
                )}

                {/* Utility buttons for Bot messages */}
                {message.type === "bot" && message.content !== "I'm analyzing your spending patterns and will provide insights shortly..." && (
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-4">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(message.content);
                        toast.success("Copied to clipboard");
                      }}
                      className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-zinc-500 hover:text-indigo-400 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      Copy text
                    </button>
                    <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">FairAI Engine v2.0</span>
                  </div>
                )}
              </div>
              
              {/* Copy button for user messages (Overlay Style) */}
              {message.type === "user" && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(message.content);
                    toast.success("Message copied");
                  }}
                  className="mt-1 flex items-center gap-1 text-[10px] text-zinc-600 hover:text-indigo-400 transition-colors uppercase font-bold tracking-tighter"
                >
                  <Copy className="w-2.5 h-2.5" />
                  Copy
                </button>
              )}
            </div>
          </div>
        ))}
      </main>

      {/* --- FLOATING SCROLL BUTTON --- */}
      {!isAtBottom && (
        <div className="absolute bottom-28 right-6 z-20">
          <button
            onClick={scrollToBottom}
            className="w-10 h-10 md:w-12 md:h-12 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white rounded-full shadow-2xl border border-white/10 transition-all active:scale-95 group"
          >
            <ArrowDown className="h-5 w-5 mx-auto text-zinc-400 group-hover:text-white group-hover:translate-y-0.5 transition-all" />
          </button>
        </div>
      )}

      {/* --- INPUT AREA --- */}
      <footer className="p-4 md:p-6 border-t border-white/5 backdrop-blur-2xl bg-zinc-900/60 z-30 shrink-0 relative overflow-hidden">
        {/* Progress indicator glow */}
        {isWaitingForResponse && (
          <div className="absolute top-0 left-0 h-[2px] bg-indigo-500 animate-[loading_2s_infinite]"></div>
        )}
        
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-3 md:gap-4 items-end">
          <div className="flex-1 relative group">
            <textarea
              rows="1"
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
                  ? "Daily limit reached..."
                  : isWaitingForResponse
                  ? "Processing context..."
                  : "How is my spending this week?"
              }
              className={`w-full bg-zinc-800/50 border border-white/5 rounded-2xl px-4 py-3.5 pr-12 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-inner placeholder-zinc-600 text-sm md:text-base resize-none ${
                (dailyCount >= 10 || isWaitingForResponse) && "opacity-50 cursor-not-allowed"
              }`}
              disabled={dailyCount >= 10 || isWaitingForResponse}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = (e.target.scrollHeight) + 'px';
              }}
            />
            {/* Character count or extra hint could go here */}
          </div>

          <button
            type="submit"
            className={`shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl transition-all duration-300 shadow-xl flex items-center justify-center border ${
              dailyCount >= 10 || isWaitingForResponse
                ? "bg-zinc-800 border-white/5 text-zinc-600 cursor-not-allowed"
                : "bg-indigo-600 border-indigo-500/50 text-white hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 shadow-indigo-500/20"
            }`}
            disabled={dailyCount >= 10 || isWaitingForResponse}
          >
            {isWaitingForResponse ? (
              <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" />
            ) : (
              <Send className="h-5 w-5 md:h-6 md:w-6" />
            )}
          </button>
        </form>
        
        <div className="mt-3 text-[9px] md:text-[10px] text-center text-zinc-600 uppercase tracking-widest font-medium">
          Powered by FairAI Intelligence • Secure Financial Node
        </div>
      </footer>

      <style>{`
        @keyframes loading {
          0% { width: 0; left: 0; }
          50% { width: 40%; left: 30%; }
          100% { width: 0; left: 100%; }
        }

        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.1); }

        /* Markdown Professional Styling */
        .markdown-content {
          font-size: 0.9rem;
          line-height: 1.6;
          color: #e4e4e7;
        }

        @media (min-width: 768px) {
          .markdown-content { font-size: 0.95rem; }
        }

        .markdown-content h2 {
          font-size: 1.15rem;
          font-weight: 700;
          margin: 1.5rem 0 0.75rem;
          color: #818cf8;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .markdown-content h2::before {
          content: "";
          display: inline-block;
          width: 4px;
          height: 16px;
          background: #6366f1;
          border-radius: 2px;
        }
        
        .markdown-content p { margin-bottom: 0.75rem; }
        
        .markdown-content strong {
          color: #fff;
          font-weight: 600;
        }
        
        .markdown-content ul, .markdown-content ol {
          margin: 0.75rem 0 0.75rem 1.25rem;
          list-style-type: none;
        }
        
        .markdown-content li {
          position: relative;
          padding-left: 1.25rem;
          margin-bottom: 0.5rem;
        }

        .markdown-content ul li::before {
          content: "•";
          position: absolute;
          left: 0;
          color: #6366f1;
          font-weight: bold;
        }
        
        .markdown-content code {
          background-color: rgba(63, 66, 241, 0.15);
          color: #a5b4fc;
          padding: 0.1rem 0.3rem;
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85em;
          border: 1px solid rgba(99, 102, 241, 0.2);
        }
        
        .markdown-content pre {
          background-color: rgba(0, 0, 0, 0.3);
          padding: 1rem;
          border-radius: 12px;
          overflow-x: auto;
          margin: 1rem 0;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .markdown-content hr {
          border: none;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          margin: 1.5rem 0;
        }

        .markdown-content blockquote {
          background: rgba(99, 102, 241, 0.05);
          border-left: 2px solid #6366f1;
          padding: 0.75rem 1rem;
          margin: 1rem 0;
          border-radius: 0 8px 8px 0;
          font-style: italic;
          color: #a1a1aa;
        }
      `}</style>
    </div>
  );
}

export default CashMapAI;
