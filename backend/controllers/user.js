import {User} from '../models/schema.js'
import mongoose from 'mongoose'
import db from '../index.js'
const userLogUp=async(req,res)=>{
    const {username, email, password}=req.body
    if(!username || !email || !password)
        return res.status(400).json({"message":"Not complete data received"})

    const user = await User.findOne({
        $or: [
            { username: username },
            { email: email }
        ]
    });
    if(user)
        return res.status(410).json({"message":"Username or email already taken"});

    const newuser= await User.create({
       username,email,password
    })
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

    return res.status(200).json(newuser);
}

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


export {userLogUp,userLogin,addEvent,addFriends,addPay}