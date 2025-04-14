import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaArrowRight, FaRobot } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';

function CashMapAI() {
  // Lazy initialization: check localStorage and load the chat history if it exists.
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
        type: 'bot',
        content: "Hello! I'm CashMap AI, your personal finance assistant. How can I help you today?"
      }
    ];
  });
  const [input, setInput] = useState('');

  // Persist messages to localStorage on every change.
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Append user's message.
    const userMessage = { type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);

    // Get the user id from localStorage.
    let userId = "";
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        userId = user?._id || "";
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
      }
    }

    // Append a temporary bot message.
    const tempBotMessage = {
      type: 'bot',
      content: "I'm analyzing your spending patterns and will provide insights shortly..."
    };
    setMessages(prev => [...prev, tempBotMessage]);

    try {
      // Call the /assist endpoint with the userId and query.
      const response = await axios.post('http://192.168.1.5:5000/assist', { userId, query: input });
      // Assume the API returns an object with an 'answer' property.
      const answer = response.data?.answer || "Sorry, something went wrong!";
      
      // Replace the temporary bot message with the API response.
      setMessages(prev => {
        const updated = [...prev];
        updated.pop(); // Remove the temporary message.
        return [...updated, { type: 'bot', content: answer }];
      });
    } catch (error) {
      console.error("Error calling /assist API:", error);
      // Remove the temporary message and add an error message.
      setMessages(prev => {
        const updated = [...prev];
        updated.pop();
        return [...updated, { type: 'bot', content: "Error retrieving response. Please try again." }];
      });
    }
    
    setInput('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#000000] text-white overflow-hidden relative">
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
            Back to Dashboard
          </Link>
          <div className="flex items-center">
            <FaRobot className="h-6 w-6 text-emerald-500 mr-2" />
            <span className="font-semibold">CashMap AI Assistant</span>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-4 overflow-y-auto z-10 relative">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.type === 'user'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-800 text-gray-100'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Field */}
      <div className="bottom-0 bg-glass-800 border-t border-gray-700 p-4 z-10 relative">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your expenses, balances, or get financial insights..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
          >
            <FaArrowRight className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default CashMapAI;