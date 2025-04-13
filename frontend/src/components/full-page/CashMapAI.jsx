import React, { useState } from 'react';
import { ArrowLeft, Send, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

function CashMapAI() {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: "Hello! I'm CashMap AI, your personal finance assistant. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages(prev => [...prev, { type: 'user', content: input }]);
    // Here you would typically make an API call to your AI service
    setMessages(prev => [...prev, {
      type: 'bot',
      content: "I'm analyzing your spending patterns and will provide insights shortly..."
    }]);
    setInput('');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col text-white">
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/dash" className="flex items-center text-gray-400 hover:text-white">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center">
            <Bot className="h-6 w-6 text-emerald-500 mr-2" />
            <span className="font-semibold">CashMap AI Assistant</span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full p-4 overflow-auto">
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

      <div className="bg-gray-800 border-t border-gray-700 p-4">
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
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default CashMapAI;