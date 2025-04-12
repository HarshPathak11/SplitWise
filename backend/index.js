import dotenv from 'dotenv'
dotenv.config();
import express from 'express'
import cors from 'cors'
import connectDB from './db/mongoDb.js';
import userRoutes from './routes/user.js';
import groupRoutes from './routes/group.js';

import session from 'express-session'

const app=express();

app.use(express.json({extended:true}));
app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true // Allow credentials (cookies, authorization headers, etc.)
}));
app.use(session({
    secret: 'erfghluhafs',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 10 * 60 * 1000 }
}));

//Connecting to mongo DB
connectDB();

// Use user routes
app.use('/user', userRoutes);

//group routes
app.use('/group', groupRoutes);

app.listen(8000,'0.0.0.0',()=>{
    console.log('Server running on PORT:8000')
})