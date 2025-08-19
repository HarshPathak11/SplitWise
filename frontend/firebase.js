// Import Firebase functions
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

// Your Firebase config (use the one you pasted)
const firebaseConfig = {
  apiKey: "AIzaSyBn0KxR0mKhKn2Xffjjf4FYtUg1aVb8WZ0",
  authDomain: "fairfare-d765b.firebaseapp.com",
  projectId: "fairfare-d765b",
  storageBucket: "fairfare-d765b.firebasestorage.app",
  messagingSenderId: "644741718814",
  appId: "1:644741718814:web:3080bf2e604500f64edf0f",
  measurementId: "G-QXY6QD2GNN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔔 Add Messaging (for notifications)
const messaging = getMessaging(app);

onMessage(messaging, (payload) => {
  console.log("📩 Foreground message received:", payload);

  // Only show if the browser has permission
  if (Notification.permission === "granted") {
    new Notification(payload.notification?.title || payload.data?.title, {
      body: payload.notification?.body || payload.data?.body,
      icon: payload.notification?.icon || payload.data?.icon || "/default-icon.png",
    });
  }
});

export { app, messaging };
