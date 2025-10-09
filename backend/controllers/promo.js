
import { sendMultipleNotifications } from "./Notifications.js";
import { User } from "../models/schema.js";

export const sendPromotionalNotification = async (req, res) => {
  const { title, body } = req.body;

  try {
    // Fetch all users with a valid FCM token
    const users = await User.find({ fcmToken: { $ne: null } }, 'fcmToken');
    const fcmTokens = users.map(user => user.fcmToken).filter(Boolean);

    if (fcmTokens.length === 0) {
      return res.status(404).json({ success: false, message: "No users with FCM tokens found." });
    }

    await sendMultipleNotifications(fcmTokens, title, body);
    res.status(200).json({ success: true, message: "Promotional notifications sent successfully." });
  } catch (error) {
    console.error("Error sending promotional notifications:", error);
    res.status(500).json({ success: false, message: "Failed to send promotional notifications." });
  }
};
