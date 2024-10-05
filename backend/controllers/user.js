import {User} from '../models/schema.js'
import mongoose from 'mongoose'
import nodemailer from 'nodemailer'
import db from '../index.js'
import bcrypt from 'bcrypt'

const userLogUp = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
        return res.status(400).json({ "message": "Not complete data received" });

    // Finding if a user exists with the same username or email
    const user = await User.findOne({
        $or: [
            { username: username },
            { email: email }
        ]
    });

    // If user already exists, return an error
    if (user)
        return res.status(410).json({ "message": "Username or email already taken" });

    // Store email and username in session and redirect to OTP verification
    req.session.email = email;
    req.session.username = username;
    req.session.password = password;
    res.redirect(`/otp-verification`);
};

const otpVerification = async (req, res) => {
    // Fetching user email from session
    const email = req.session.email;

    // Checking if email exists in session
    if (!email)
        return res.status(400).json({ "Status": "No email detected" });

    // Generating OTP
    const otp = Math.ceil(1000000 * Math.random()).toString();

    // Sending OTP via Email using NodeMailer
        let transportmail = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'splitwise666@gmail.com',
            pass:'tsumbpqsbzzddsel'
        }
    })

        let mailcontent ={
        from:"splitwise666@gmail.com",
            to: email,
            subject: 'OTP for your SplitIt Account',
            text:`Your One Time Password Is : ${otp}`
        }

    transportmail.sendMail(mailcontent, (err, val) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Failed to send OTP" });
        } else {
            console.log("OTP Sent Successfully!", `OTP is: ${otp}`);
            
            // Storing the OTP in the session
            req.session.otp = otp;
            return res.status(200).json({ message: "OTP Sent Successfully" });
        }
    });
};

const createNewUser = async (req, res) => {
    const { otp: enteredOtp } = req.body;

    // Fetching OTP from the session
    const storedOtp = req.session.otp;

    // If no OTP in session, return an error
    if (!storedOtp) {
        return res.status(400).json({ "Status": "OTP not found or expired" });
    }

    // Compare entered OTP with stored OTP
    if (enteredOtp === storedOtp) {
        const { username, email, password } = req.session;

        // Hashing the password before storing in the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Creating new user
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword
        });

        // Adding a new column in matrix
        const alterQuery = `ALTER TABLE user_matrix ADD COLUMN \`${email}\` DECIMAL(10, 2) DEFAULT 0;`;

        db.query(alterQuery, (err, result) => {
            if (err) {
                console.error('Error altering table:', err);
                return res.status(500).json({ error: 'Failed to add column in matrix' });
            }

            // Second query: Add a new row
            const insertQuery = `INSERT INTO user_matrix (user_name) VALUES (?);`;

            db.query(insertQuery, [email], (err, result) => {
                if (err) {
                    console.error('Error inserting into table:', err);
                    return res.status(500).json({ error: 'Failed to add row in matrix' });
                }
            });
        });

        // Clear the session after successful user creation
        req.session.destroy((err) => {
            if (err) {
                console.error('Failed to destroy session:', err);
            }
        });

        // Returning the newly created user
        return res.status(200).json(newUser);
    } else {
        return res.status(400).json({ "Status": "Invalid or expired OTP" });
    }
};

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

const fetchUserMatrixData = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        // First, fetch the entire row where the user_name is the entered email
        const rowQuery = `SELECT * FROM user_matrix WHERE user_name = ?`;
        
        db.query(rowQuery, [email], (err, rowResult) => {
            if (err) {
                console.error('Error fetching row:', err);
                return res.status(500).json({ error: 'Failed to fetch row' });
            }

            if (rowResult.length === 0) {
                return res.status(404).json({ message: "User not found in matrix" });
            }

            // Now, fetch all values from the column corresponding to the email (dynamic column name)
            const columnQuery = `SELECT user_name, \`${email}\` FROM user_matrix`;

            db.query(columnQuery, (err, columnResult) => {
                if (err) {
                    console.error('Error fetching column:', err);
                    return res.status(500).json({ error: 'Failed to fetch column' });
                }

                // Return both row and column data
                return res.status(200).json({
                    row: rowResult[0], // The entire row corresponding to the entered email
                    column: columnResult, // The entire column corresponding to the entered email
                });
            });
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

const userData=async(req,res)=>{
    const {email}=req.body;
    if(!email)
        return res.status(400).json({"message":"incomplete data"});

    const user=await User.findOne({"email":email},"--password")
    if(!user){
        return res.status(500).json({"message":"user not found"});
    }
    return res.status(200).json({user})
}



export {userLogUp,userLogin,addEvent,addFriends,addPay,otpVerification,createNewUser,fetchUserMatrixData,userData }