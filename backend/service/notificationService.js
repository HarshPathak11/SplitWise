import admin from "../firebaseAdmin.js";

// Single user
const sendService = async (token, title, body) => {
  const payload = {
    token,
    notification: {
      title,
      body,
      image: 'https://fair-fare-phi.vercel.app/newIcon-192x192.png',
      // badge: 'http://localhost:5173/newIconV2-512x512.png',
    },
    data : {url: 'https://fair-fare-phi.vercel.app'},
  };

  try {
    const res = await admin.messaging().send(payload);
    // console.log("Notification sent successfully");
    return res;
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
};

// Multiple users
const sendToMultiple = async (tokens, title, body) => {
  if (!Array.isArray(tokens) || tokens.length === 0) {
    throw new Error("Tokens array must not be empty");
  }

  const payload = {
    notification: {
      title,
      body,
      image: 'https://fair-fare-phi.vercel.app/newIcon-192x192.png',
      // badge: 'http://localhost:5173/newIconV2-512x512.png',
    },
    data : {url: 'https://fair-fare-phi.vercel.app'},
    tokens, // ✅ multiple tokens go here
  };

  try {
    const res = await admin.messaging().sendEachForMulticast(payload);
    // console.log(`Notifications sent: ${res.successCount} success, ${res.failureCount} failed`);
    if (res.responses.some(r => !r.success)) {
      console.error("Failed tokens:", res.responses.filter(r => !r.success));
    }
    return res;
  } catch (error) {
    console.error("Error sending notifications to multiple users:", error);
    throw error;
  }
};

export default { sendService, sendToMultiple };
