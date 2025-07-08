import dotenv from "dotenv";
dotenv.config();
import express from 'express'
import cors from 'cors'
import connectDB from './db/mongoDb.js';
import userRoutes from './routes/user.js';
import groupRoutes from './routes/group.js';

import session from "express-session";

const app = express();

app.use(express.json({extended:true}));
app.use(cors({
    origin: "https://fair-fare-phi.vercel.app",
    // origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true // Allow credentials (cookies, authorization headers, etc.)
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
app.get('/api/ping', (req, res) => {
  res.send('pong');
});


// Use user routes
app.use('/user', userRoutes);

//group routes
app.use('/group', groupRoutes);

app.listen(8000, () => {
  console.log("Server running on PORT:8000");
});
