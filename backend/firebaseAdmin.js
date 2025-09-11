import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

// Parse the JSON stored in environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
