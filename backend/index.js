// server.js
import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import session from "express-session";

import connectDB from './db/mongoDb.js';
import userRoutes from './routes/user.js';
import groupRoutes from './routes/group.js';
import chatRoutes from './routes/chat.js';
import * as chatSvc from './controllers/chatService.js'

import { postMessage, resetUnread } from './controllers/chat.js';

const app = express();

// Middleware
app.use(express.json({ extended: true }));
app.use(cors({
  origin: true,
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true
}));
app.use(session({
  secret: process.env.SESSION_SECRET || 'defaultsecret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 10 * 60 * 1000 }
}));

// Connect to MongoDB
connectDB();

// Routes
app.get('/api/ping', (req, res) => res.send('pong'));
app.use('/user', userRoutes);
app.use('/group', groupRoutes);
app.use('/chat', chatRoutes);

// HTTP + WebSocket server
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: true,
    credentials: true
  }
});

// Socket.IO Handlers


io.on('connection', socket => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join_chat', async ({ userId, otherUserId, chatId }) => {
    // Optionally create/fetch
    if (userId && otherUserId) {
      const chat = await chatSvc.getOrCreateChatService(userId, otherUserId);
      chatId = chat._id.toString();
    }
    socket.join(chatId);
    socket.emit('joined', { chatId });
  });

  socket.on('send_message', async ({ chatId, senderId, content }) => {
    try {
      const msg = await chatSvc.saveMessageAndBumpChat(chatId, senderId, content);
      io.to(chatId).emit('new_message', msg);
    } catch (err) {
      socket.emit('error', { message: 'Failed to send message.' });
    }
  });

  socket.on('reset_unread', async ({ chatId, userId }) => {
    try {
      await chatSvc.clearUnreadService(chatId, userId);
      socket.emit('unread_reset', { chatId, userId });
    } catch (err) {
      console.error(err);
    }
  });

  socket.on('typing', ({ chatId, userId }) => {
    socket.to(chatId).emit('typing', { chatId, userId });
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Start the server
const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => {
  console.log(`Server & Socket.IO running on port ${PORT}`);
});
