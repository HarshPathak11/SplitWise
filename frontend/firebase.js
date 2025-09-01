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

export { app, messaging };
