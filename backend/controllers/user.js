import {User} from '../models/schema.js'
import mongoose from 'mongoose'
const userLogUp=async(req,res)=>{
    const {username, email, password}=req.body
    if(!username || !email || !password)
        res.status(400).json({"message":"Not complete data received"})

    const user= await User.findOne(
        {username,email}
    )
    if(user)
        res.status(410).json({"message":"Username or email already taken"});

    const newuser= await User.create({
       username,email,password
    })

    return res.status(200).json(newuser);
}

const userLogin= async(req,res)=>{
    const {email, password}=req.body
    if(!password || !email){
        res.status(400).json({"message":"Not complete data received"})
    }

    const user=await User.findOne({
        email
    })
    if(!user)
        res.status(400).json({"message":"User not found"})
    const isPasswordOkay= await user.isPasswordCorrect(password);
    console.log(isPasswordOkay,password)
    if(!isPasswordOkay)
    return res.status(400).json({"message":"Password is not correct"});
    
    return res.status(200).json({"message":"Access Granted",user})
}

const addEvent=async(req,res)=>{
    const {email,eventName, eventDesc, amt, paidBy, paidFor}=req.body
    if(!email || !eventName || !amt || !paidBy || !paidFor){
        res.status(400).json({"message":"Not complete data received"})
    }
    const expenseDetails = [{
        _id: new mongoose.Types.ObjectId(),
        description: eventDesc,
        amount: amt,
        paidBy: paidBy,
        owedBy: paidFor
    }];
    const groupId = new mongoose.Types.ObjectId();
    const user=await User.findOneAndUpdate({
        email
    },{
        $push:{
            groups: {
                _id: groupId,
                name: eventName,
                expenses: expenseDetails
            }
        }
    },{
        new:true
    })
    if(!user)
        res.status(500).json({"message":"User not found"})
    return res.status(200).json({user})
}

const addFriends=async(req,res)=>{
    const {email, friendEmail}=req.body;
    if(!email || !friendEmail)
        res.status(400).json({"message":"Not complete data received"})
    const friend=await User.findOne({friendEmail})
    if(!friend)
        res.status(400).json({"message":"Wrong email of friend"})
    const user=await User.findOneAndUpdate({email},{$push:{
        friends:{type:friend.username}
    }},{new:true})
    if(!user)
        res.status(500).json({"message":"User not found"})

    const updatedFriendUser = await User.findOneAndUpdate(
        { email: friendEmail },
        { $push: { friends: { type: user.username } } },
        { new: true, runValidators: true }
    );
    if(!updatedFriendUser)
        res.status(500).json({"message":"Something went wrong"});
    res.status(200).json({"message":"friend added",user})
}





export {userLogUp,userLogin,addEvent,addFriends}