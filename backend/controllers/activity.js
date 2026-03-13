import { Notification } from "../models/schema.js";

/**
 * Create a notification
 * Called internally when events happen
 */
export const createNotification = async (
  recipient,
  sender,
  type,
  message,
  referenceId = null
) => {
  try {
    const notification = new Notification({
      recipient,
      sender,
      type,
      message,
      referenceId,
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

/**
 * Get all notifications for a user
 * GET /notifications
 */
export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    // Auto cleanup: delete notifications older than 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await Notification.deleteMany({
      createdAt: { $lt: sevenDaysAgo }
    });

    const notifications = await Notification.find({
      recipient: userId,
      createdAt: { $gte: sevenDaysAgo }
    })
      .populate("sender", "username profilePhotoUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments({
      recipient: userId,
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      notifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

/**
 * Get unread notification count
 * GET /notifications/unread-count
 */
export const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;

    // Only count unread notifications from the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
};

/**
 * Mark a single notification as read
 * PUT /notifications/:notificationId/read
 */
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to mark as read" });
  }
};

/**
 * Mark all notifications as read for a user
 * PUT /notifications/:userId/read-all
 */
export const markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    // Only mark as read notifications from the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const result = await Notification.updateMany(
      {
        recipient: userId,
        isRead: false,
        createdAt: { $gte: sevenDaysAgo }
      },
      { isRead: true }
    );

    res.json({
      message: "All recent notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking all as read:", error);
    res.status(500).json({ error: "Failed to mark all as read" });
  }
};

/**
 * Delete all notifications for a user
 * DELETE /notifications/:userId/all
 */
export const deleteAllNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    // Only delete notifications from the last 7 days (visible ones)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const result = await Notification.deleteMany({
      recipient: userId,
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      message: "All recent notifications deleted",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    res.status(500).json({ error: "Failed to delete notifications" });
  }
};

