import dotenv from 'dotenv'
dotenv.config();
import express from 'express'
import cors from 'cors'
import connectDB from './db/db.js';

const app=express();

app.use(express.json())
app.use(cors())
connectDB()







app.listen(8000,()=>{
    console.log('Server running on PORT:8000')
})