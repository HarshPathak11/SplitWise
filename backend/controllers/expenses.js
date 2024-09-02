import {User} from '../models/schema.js';

const addData=async(req,res)=>{
    const {username, email, groups}=req.body;
    if(!username||!email||!groups) return res.status(400).json({
        status: "Did not get required data!"
    });
    const user=await User.create({
        username,
        email,
        groups
    });
    return res.status(200).json({
        status:"User created Successfully",
        details:user
    })
}

export {addData};