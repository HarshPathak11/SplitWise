import express from 'express';
import {
  getOrCreateChat,
  getUserChats,
  postMessage,
  getChatMessages,
  resetUnread
} from '../controllers/chat.js';

const router = express.Router();

// POST  /chat/one      → get or create a 1‑on‑1 chat
router.post('/one', getOrCreateChat);

// GET   /chat/user/:userId        → list chats for inbox
router.get('/user/:userId', getUserChats);

// POST  /chat/message             → send a message
router.post('/message', postMessage);

// GET   /chat/:chatId/messages    → paginate messages
router.get('/:chatId/messages', getChatMessages);

// POST  /chat/reset-unread        → reset unread count
router.post('/reset-unread', resetUnread);

export default router;
