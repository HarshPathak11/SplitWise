import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./db/mongoDb.js";
import { addData } from "./controllers/expenses.js";
import { connectSQL } from "./db/mysqlDB.js";
import { User } from "./models/schema.js";
import userRoutes from "./routes/user.js";

import session from "express-session";

const app = express();

app.use(express.json({ extended: true }));
app.use(
  cors({
    origin: ["http://localhost:5173", "http://192.168.156.226:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);
app.use(
  session({
    secret: "erfghluhafs",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 10 * 60 * 1000 },
  })
);

//Connecting to mongo DB
connectDB();
connectSQL();

//Routes
app.get("/addData", addData);
app.get("/data", async (req, res) => {
  const username = req.body.username;
  if (!username) return res.json({ status: "Bhai poori info de!" });
  const user = await User.findOne({
    username: username,
  });
  if (!user) return res.json({ Status: "No such user found!" });
  return res.json({ Group: user.groups });
});
app.get("/isup", (req, res) => {
  return res.status(200).json({
    status: "Site is up!",
  });
});
// Use user routes
app.use("/", userRoutes);
app.post("/demo", async (req, res) => {
  const event = req.body;

  // Verify webhook signature if needed
  // Process the email.created event
  console.log("Received event:", event);
  if (event.type === "user.created") {
    const emailData = event.data;

    console.log("New email created:", emailData);

    // Always return a 200 status to acknowledge receipt
    res.status(200).send("Webhook received");
  }
});

app.listen(8000, "0.0.0.0", () => {
  console.log("Server running on PORT:8000");
});
