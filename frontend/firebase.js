import { initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

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

// Initialize Auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// 🔔 Defensive Messaging Initialization
let messaging = null;

// This function checks if messaging is supported before exporting it
const initMessaging = async () => {
  try {
    const supported = await isSupported();
    if (supported) {
      return getMessaging(app);
    }
    console.warn("FCM is not supported in this environment (likely due to http vs https).");
    return null;
  } catch (err) {
    console.error("Firebase Messaging failed to initialize:", err);
    return null;
  }
};

// Start the check
initMessaging().then((m) => {
  messaging = m;
});

export { app, messaging, auth, googleProvider };