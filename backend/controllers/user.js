import {User} from '../models/schema.js'
import mongoose from 'mongoose'
import nodemailer from 'nodemailer'
import db from '../index.js'
import bcrypt from 'bcrypt'

//Function to handle a signup request
const userLogUp=async(req,res,)=>{
    const {username, email, password}=req.body;
    if(!username || !email || !password)
        return res.status(400).json({"message":"Not complete data received"})

    //Finding if a user exists with same username or email
    const user = await User.findOne({
        $or: [
            { username: username },
            { email: email }
        ]
    });
    
    //If username exists then return username already taken
    if(user)
        return res.status(410).json({"message":"Username or email already taken"});

    //If no such user exists then redirect to next page which is otp verification
    res.redirect(`/otp-verification`);}
    
    //Function to send otp
    const otpVerification=async(req,res)=>{
        
        //Fetching user email
        const Email=req.body.email;

        //Checking if no email is passed then return
        if(!Email) 
            return res.status(400).json({
        Status: "No email detected"
    })
    
    //Generating OTP
    const otp=Math.ceil(1000000*Math.random()).toString();
    
    //Sending OTP via Email using Node Mailer API call
    let transportmail = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'splitwise666@gmail.com',
            pass:'tsumbpqsbzzddsel'
        }
    })
    
    let mailcontent ={
        from:"splitwise666@gmail.com",
            to: Email,
            subject: 'OTP for your SplitIt Account',
            text:`Your One Time Password Is : ${otp}`
        }
  
        transportmail. sendMail(mailcontent, async(err,val)=>{
            if(err){
                 console.log(err)}
            else{
                console.log("OTP Sent Successfully!",`OTP is:${otp}`);
                //Here we are hashing the otp and sending it as params to another route
                const OTP = await bcrypt.hash(otp,9);
                console.log("Hashed OTP is:",OTP);                
                return res.status(200).redirect(`/createUser/${OTP}`);
              }
            })
    }
    
    //Function to verify otp and create new user otherwise showing wrong otp
    const createNewUser=async(req,res)=>{

        //Requiring hashed otp value from params
        let value = req.params.value;
        // console.log("params otp is ",value);

        //Fetching necessary data from request body
        let {username, email, password, otp}=req.body;
        console.log("req.opt is ",otp);

        //Checking if otp is passed or not
        if(!otp) {
            console.log("Was sending and again redirect to:");
            console.log(`/createUser/${value}`);
            return res.status(200).json({"Status:":`OTP Sent to ${email}`});}

        //comparing if provided otp is equal to the hashed otp or not
        if(await bcrypt.compare(otp,value)){

    //Creating new user
    const newuser= await User.create({
       username,email,password
    })
    
    //Adding a new column in matrix
    const alterQuery = `ALTER TABLE user_matrix ADD COLUMN \`${username}\` DECIMAL(10, 2) DEFAULT 0;`;

    db.query(alterQuery, (err, result) => {
        if (err) {
            console.error('Error altering table:', err);
            return res.status(500).json({ error: 'Failed to add column in matrix' });
        }

        // Second query: Add a new row
        const insertQuery = `INSERT INTO user_matrix (user_name) VALUES (?);`;
        
        db.query(insertQuery, [username], (err, result) => {
            if (err) {
                console.error('Error inserting into table:', err);
                return res.status(500).json({ error: 'Failed to add row in matrix' });
            }
        });
    });
    //Returning new user after creation
    return res.status(200).json(newuser);}
    //If wrong otp provided then returning that wrong otp is given
    return res.status(400).json({
        "Status":"Wrong otp or otp not found"
    })
}

//User login route
const userLogin= async(req,res)=>{
    const {email, password}=req.body
    if(!password || !email){
       return res.status(400).json({"message":"Not complete data received"})
    }

    const user=await User.findOne({
        email
    })
    if(!user)
       return res.status(400).json({"message":"User not found"})
    const isPasswordOkay= await user.isPasswordCorrect(password);
    console.log(isPasswordOkay,password)
    if(!isPasswordOkay)
    return res.status(400).json({"message":"Password is not correct"});
    
    return res.status(200).json({"message":"Access Granted",user})
}

const addEvent=async(req,res)=>{
    const {email,eventName, eventDesc, amt, paidBy, paidFor}=req.body
    if(!email || !eventName || !amt || !paidBy || !paidFor){
        return res.status(400).json({"message":"Not complete data received"})
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
        return res.status(500).json({"message":"User not found"})
    return res.status(200).json({user})
}

const addFriends=async(req,res)=>{
    const {email, friendEmail}=req.body;
    if(!email || !friendEmail)
       return res.status(400).json({"message":"Not complete data received"})
    const friend=await User.findOne({friendEmail})
    if(!friend)
       return res.status(400).json({"message":"Wrong email of friend"})
    const user=await User.findOneAndUpdate({email},{$push:{
        friends:{type:friend.username}
    }},{new:true})
    if(!user)
       return res.status(500).json({"message":"User not found"})

    const updatedFriendUser = await User.findOneAndUpdate(
        { email: friendEmail },
        { $push: { friends: { type: user.username } } },
        { new: true, runValidators: true }
    );
    if(!updatedFriendUser)
       return res.status(500).json({"message":"Something went wrong"});
    return res.status(200).json({"message":"friend added",user})
}

const addPay=async(req,res)=>{
    const {payBy,payFor,amt}=req.body
    if(!payBy || !payFor || !amt)
       return res.status(400).json({"message":"Incomplete information"})
    const share=amt/(payFor.length+1).toFixed(2);
    console.log(share,payBy,payFor)

    for(let i=0;i<payFor.length;++i){
        const x=payFor[i]
        console.log(x);
        const query = `UPDATE user_matrix SET \`${x}\` = \`${x}\` + ${share} WHERE user_name = '${payBy}';`;
        db.query(query, (err, result) => {
            if (err) {
                console.error('Error inserting into table:', err);
                return res.status(500).json({ error: 'Failed to add row in matrix' });
            }
        });
    }
    return res.status(200).json({"message":"Entries added successfully"})
}

const resolvePay=async(req,res)=>{
     const {payBy,payFor,amt}=req.body
     if(!payBy || !payFor ||!amt)
        return res.status(400).json({"message":"Information is incomplete"});
     const x=payFor
     const share=x;
     const query = `UPDATE user_matrix SET \`${x}\` = \`${x}\` + ${share} WHERE user_name = '${payBy}';`;
     db.query(query, (err, result) => {
         if (err) {
             console.error('Error inserting into table:', err);
             return res.status(500).json({ error: 'Failed to add row in matrix' });
         }
     });
     return res.status(200).json({"message":"Payment added!!"});
}


export {userLogUp,userLogin,addEvent,addFriends,addPay,otpVerification,createNewUser}