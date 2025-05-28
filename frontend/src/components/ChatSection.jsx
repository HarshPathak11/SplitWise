// ChatsPage.jsx
import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Cookies from 'js-cookie';
import { FaArrowLeft, FaPaperPlane } from 'react-icons/fa';

const ChatsPage = () => {
  const u=JSON.parse(localStorage.getItem('user') || '[]')
  const userId = u._id;
  const friends = u.friends.map(friend => friend.friend)
  console.log(friends)

  const [activeChatId, setActiveChatId] = useState(null);
  const [activeFriend, setActiveFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newContent, setNewContent] = useState('');
  const [socket, setSocket] = useState(null);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const scrollRef = useRef();

  // Initialize socket once
  useEffect(() => {
    const sock = io('http://localhost:5000', { withCredentials: true });
    setSocket(sock);
    return () => sock.disconnect();
  }, []);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;
    socket.on('new_message', (msg) => {
      if (msg.chat === activeChatId) {
        setMessages(prev => [...prev, msg]);
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    });
    return () => socket.off('new_message');
  }, [socket, activeChatId]);

  // When user selects a friend → getOrCreateChat, load history, join room
  const openChat = async (friend) => {
    setLoadingMsgs(true);
    setActiveFriend(friend);
    // 1) Create or fetch chat
    const { data: chat } = await axios.post('/chat/one', {
      userId,
      otherUserId: friend._id
    });
    setActiveChatId(chat._id);

    // 2) Join Socket.io room
    socket.emit('join_chat', { chatId: chat._id });

    // 3) Load history
    const res = await axios.get(`/chat/${chat._id}/messages?limit=100`);
    setMessages(res.data);
    setLoadingMsgs(false);

    // Scroll down
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  // Sending a new message
  const sendMessage = async () => {
    if (!newContent.trim()) return;
    const payload = { chatId: activeChatId, senderId: userId, content: newContent };
    // Optimistic UI
    setMessages(prev => [...prev, { ...payload, createdAt: new Date() }]);
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    setNewContent('');

    // Emit to Socket.IO (will also be persisted server‑side)
    socket.emit('send_message', payload);
  };

  // Layout breakpoints: on mobile, hide list when a chat is open
  const isMobile = window.innerWidth < 640;

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Friend List */}
      {(!isMobile || !activeChatId) && (
        <div className="w-full sm:w-1/3 border-r border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold">Chats</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {friends.map(fr => (
              <button
                key={fr._id}
                onClick={() => openChat(fr)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-800 transition 
                  ${activeFriend?._id === fr._id ? 'bg-gray-800' : ''}`}
              >
                <div className="font-medium">{fr.username}</div>
                <div className="text-sm text-gray-400">{fr.email}</div>
              </button>
            ))}
            {friends.length === 0 && (
              <p className="p-4 text-gray-500">No friends to chat with.</p>
            )}
          </div>
        </div>
      )}

      {/* Chat Window */}
      {activeChatId && (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center p-4 border-b border-gray-700">
            {isMobile && (
              <button
                onClick={() => setActiveChatId(null)}
                className="mr-4 p-2 rounded-full hover:bg-gray-800"
              >
                <FaArrowLeft />
              </button>
            )}
            <h2 className="text-lg font-semibold">
              {activeFriend?.username}
            </h2>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {loadingMsgs && <p className="text-center">Loading…</p>}
            {!loadingMsgs && messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-xs px-3 py-2 rounded-lg 
                  ${m.sender === userId ? 'bg-blue-600 self-end' : 'bg-gray-800 self-start'}`}
              >
                <p className="text-sm">{m.content}</p>
                <span className="text-[10px] text-gray-400 mt-1 block">
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-700 flex items-center space-x-2">
            <input
              className="flex-1 bg-gray-800 rounded-full px-4 py-2 focus:outline-none"
              placeholder="Type a message…"
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              onKeyDown={e => e.key === 'Enter' ? sendMessage() : null}
            />
            <button
              onClick={sendMessage}
              className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 transition"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatsPage;
