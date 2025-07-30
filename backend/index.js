import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import connectDB from "./db/mongoDb.js";
import userRoutes from "./routes/user.js";
import groupRoutes from "./routes/group.js";

import session from "express-session";

const app = express();

app.use(express.json({ extended: true }));
app.use(
  cors({
    origin: [
      "https://fair-fare-phi.vercel.app",
      "https://fairfare-0hyl.onrender.com",
    ],
    // origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    // credentials: true // Allow credentials (cookies, authorization headers, etc.)
}));
app.use(session({
    secret: 'erfghluhafs',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 10 * 60 * 1000 },
  })
);

//Connecting to mongo DB
connectDB();

//Ping Route
app.get("/api/ping", (req, res) => {
  res.send("pong");
});

// Use user routes
app.use("/user", userRoutes);

//group routes
app.use("/group", groupRoutes);

// ✅ Self-ping function to prevent Render sleeping
function keepServerAwake() {
  setInterval(() => {
    fetch("https://fairfare-0hyl.onrender.com/api/ping")
      .then((res) => res.text())
      .then((data) => console.log("Self-ping success:", data))
      .catch((err) => console.log("Self-ping failed:", err.message));
  }, 5 * 60 * 1000); // every 5 minutes
}

keepServerAwake();

app.listen(8000, () => {
  console.log("Server running on PORT:8000");
});
