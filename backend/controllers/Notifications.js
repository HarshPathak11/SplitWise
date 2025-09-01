import notificationService from '../service/notificationService.js';

const sendOneNotification = async (token, title, body) => {
  // const { token, title, body } = req.body;

  if (!token || !title || !body) {
    return;
  }

  try {
    const response = await notificationService.sendService(token, title, body);
    // console.log("Notification sent:", response);
    return;
  } catch (error) {
    console.error("Error sending notification:", error);
    return;
  }
};

const sendMultipleNotifications = async (tokens, title, body) => {
  // const { tokens, title, body } = req.body;

  if (!Array.isArray(tokens) || tokens.length === 0 || !title || !body) {
    return;
  }

  try {
    const response = await notificationService.sendToMultiple(tokens, title, body);
    // console.log("Notifications sent:", response);
    return;
  } catch (error) {
    console.error("Error sending notifications:", error);
    return;
  }
};

export {
  sendOneNotification,
  sendMultipleNotifications
};
