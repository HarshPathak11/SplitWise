import dotenv from 'dotenv'
dotenv.config();
import express from 'express'
import cors from 'cors'
import connectDB from './db/db.js';
import {addData} from './controllers/expenses.js'
import { User } from './models/schema.js';
import { addEvent, addFriends, addPay, userLogin,otpVerification, userLogUp, createNewUser, fetchUserMatrixData, userData } from './controllers/user.js';
import mysql2 from 'mysql2'
import session from 'express-session'

const app=express();

app.use(express.json({extended:true}))
app.use(cors())
app.use(session({
    secret: 'erfghluhafs',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 10 * 60 * 1000 }  // 10-minute expiration for OTP session
}));
connectDB()


const db = mysql2.createConnection({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});



app.get('/addData',addData);
app.get('/data',async(req,res)=>{
    const username=req.body.username;
    if(!username) return res.json({status:"Bhai poori info de!"});
    const user=await User.findOne({
        username:username
    })
    if(!user) return res.json({"Status":"No such user found!"})
        return res.json({"Group":user.groups})
})
app.get('/',(req,res)=>{
    return res.status(200).json({
        status:"Site is up!"
    })
})
app.get('/logup',userLogUp)
app.get('/otp-verification',otpVerification)
app.get('/createUser',createNewUser)
app.get('/login',userLogin)
app.get('/addEvent',addEvent)
app.get('/addf',addFriends)
app.get('/pay',addPay)
app.get('/payData',fetchUserMatrixData)
app.get('/user',userData)
 



app.listen(8000,()=>{
    console.log('Server running on PORT:8000')
})

export default db;