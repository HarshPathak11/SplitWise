// server.js
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import connectDB from "./db/mongoDb.js";
import userRoutes from "./routes/user.js";
import groupRoutes from "./routes/group.js";
import expenseRoutes from "./routes/expense.js";
import promoRoutes from "./routes/promo.js";
import termsRoutes from "./routes/terms.js";
import aiRoutes from "./routes/ai.js";
import activityRoutes from "./routes/activity.js";
import { initExpenseCategorizer } from "./service/expenseCategorizer.js";
import session from "express-session";
const PORT = process.env.PORT || 8000;

const app = express(); 

const allowedOrigins = process.env.ORIGIN.split(",");

app.use(express.json({ extended: true }));
app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true // Allow credentials (cookies, authorization headers, etc.)
  }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'defaultsecret',
  resave: false,
  saveUninitialized: false, // Changed to false to prevent empty sessions
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: false,               // MUST be false for http://192.168.1.10
    httpOnly: true,
    sameSite: 'lax'              // 'lax' or false helps with cross-origin requests
  }
}));

//Ping Route
app.get("/api/ping", (req, res) => {
  res.send("ponging");
});

// Use user routes
app.use("/user", userRoutes);

//group routes
app.use("/group", groupRoutes);

//Expenses routes
app.use("/expenses", expenseRoutes);

// Promo notification route
app.use("/promo", promoRoutes);

// Terms & Conditions - Legal Versioning
app.use("/terms", termsRoutes);

// AI Features
app.use("/ai", aiRoutes);

// Activity/Notifications
app.use("/activity", activityRoutes);

// ✅ Self-ping function to prevent Render sleeping
function keepServerAwake() {
  setInterval(() => {
    fetch("https://fairfare-0hyl.onrender.com/api/ping")
      .then((res) => res.text())
      .then((data) => console.log("Self-ping successfully:", data))
      .catch((err) => console.log("Self-ping failed:", err.message));
  }, 5 * 60 * 1000); // every 5 minutes
}

keepServerAwake();

connectDB().then(() => {
  initExpenseCategorizer();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://10.155.179.198:${PORT}`);
  });
});
