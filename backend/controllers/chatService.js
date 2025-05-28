// services/chatService.js
import { Chat, Message } from '../models/schema.js';

/**
 * Create or fetch a 1‑on‑1 chat.
 */
export async function getOrCreateChatService(userId, otherUserId) {
  let chat = await Chat.findOne({
    participants: { $all: [userId, otherUserId] },
    'participants.2': { $exists: false }
  });

  if (!chat) {
    chat = await Chat.create({
      participants: [userId, otherUserId],
      unreadCounts: { [userId]: 0, [otherUserId]: 0 }
    });
  }
  return chat;
}

/**
 * List all chats for a user (with unread count).
 */
export async function getUserChatsService(userId) {
  const chats = await Chat.find({ participants: userId })
    .sort('-updatedAt')
    .populate('participants', 'username email')
    .lean();

  return chats.map(c => ({
    ...c,
    unread: c.unreadCounts.get(userId) || 0
  }));
}

/**
 * Save a message and bump lastMessage + unreadCounts.
 */
export async function saveMessageAndBumpChat(chatId, senderId, content) {
  const msg = await Message.create({ chat: chatId, sender: senderId, content });

  const chat = await Chat.findById(chatId);
  const otherIds = chat.participants
    .map(id => id.toString())
    .filter(uid => uid !== senderId);

  const inc = otherIds.reduce((acc, uid) => {
    acc[`unreadCounts.${uid}`] = 1;
    return acc;
  }, {});

  await Chat.findByIdAndUpdate(chatId, {
    $set: {
      'lastMessage.sender':    senderId,
      'lastMessage.content':   content,
      'lastMessage.createdAt': msg.createdAt
    },
    $inc: inc
  });

  return msg;
}

/**
 * Paginate messages for a chat.
 */
export async function getChatMessagesService(chatId, limit=50, offset=0) {
  return Message.find({ chat: chatId })
    .sort('createdAt')
    .skip(offset)
    .limit(limit)
    .populate('sender', 'username email');
}

/**
 * Clear unread count and mark messages as read.
 */
export async function clearUnreadService(chatId, userId) {
  await Chat.findByIdAndUpdate(chatId, {
    $set: { [`unreadCounts.${userId}`]: 0 }
  });
  await Message.updateMany(
    { chat: chatId, readBy: { $ne: userId } },
    { $push: { readBy: userId } }
  );
}
