import express from "express";
import { auth } from "../middleware/auth.js";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../controllers/activity.js";

const router = express.Router();

// Specific routes first (must come before generic :userId routes)
router.get("/:userId/unread-count", auth, getUnreadCount);
router.put("/:userId/read-all", auth, markAllAsRead);
router.delete("/:userId/all", auth, deleteAllNotifications);
router.put("/:notificationId/read", auth, markAsRead);
router.delete("/:notificationId", auth, deleteNotification);

// Generic routes last
router.get("/:userId", auth, getNotifications);

export default router;
