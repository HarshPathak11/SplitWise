import dotenv from 'dotenv'
dotenv.config();
import express from 'express'
import cors from 'cors'
import connectDB from './db/db.js';
import {addData} from './controllers/expenses.js'
import { User } from './models/schema.js';
import { userLogin, userLogUp } from './controllers/user.js';

const app=express();

app.use(express.json({extended:true}))
app.use(cors())
connectDB()


app.get('/addData',addData);
app.get('/data',async(req,res)=>{
    const username=req.body.username;
    if(!username) return res.json({status:"Bhadwe poori info de!"});
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
app.get('/login',userLogin)




app.listen(8000,()=>{
    console.log('Server running on PORT:8000')
})