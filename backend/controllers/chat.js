// controllers/chat.js
import mongoose from 'mongoose';
import * as chatSvc from '../controllers/chatService.js';

/**
 * POST /chat/one
 */
export async function getOrCreateChat(req, res) {
  const { userId, otherUserId } = req.body;
  if (!mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(otherUserId)) {
    return res.status(400).json({ message: 'Invalid user IDs' });
  }
  const chat = await chatSvc.getOrCreateChatService(userId, otherUserId);
  return res.status(200).json(chat);
}

/**
 * GET /chat/user/:userId
 */
export async function getUserChats(req, res) {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId))
    return res.status(400).json({ message: 'Invalid user ID' });

  const chats = await chatSvc.getUserChatsService(userId);
  return res.status(200).json(chats);
}

/**
 * POST /chat/message
 */
export async function postMessage(req, res) {
  const { chatId, senderId, content } = req.body;
  if (!mongoose.Types.ObjectId.isValid(chatId) ||
      !mongoose.Types.ObjectId.isValid(senderId) ||
      !content) {
    return res.status(400).json({ message: 'Invalid data' });
  }
  const msg = await chatSvc.saveMessageAndBumpChat(chatId, senderId, content);
  return res.status(201).json(msg);
}

/**
 * GET /chat/:chatId/messages
 */
export async function getChatMessages(req, res) {
  const { chatId } = req.params;
  const limit  = parseInt(req.query.limit)  || 50;
  const offset = parseInt(req.query.offset) || 0;
  if (!mongoose.Types.ObjectId.isValid(chatId))
    return res.status(400).json({ message: 'Invalid chat ID' });

  const messages = await chatSvc.getChatMessagesService(chatId, limit, offset);
  return res.status(200).json(messages);
}

/**
 * POST /chat/reset-unread
 */
export async function resetUnread(req, res) {
  const { chatId, userId } = req.body;
  if (!mongoose.Types.ObjectId.isValid(chatId) ||
      !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid data' });
  }
  await chatSvc.clearUnreadService(chatId, userId);
  return res.status(200).json({ message: 'Unread cleared' });
}
