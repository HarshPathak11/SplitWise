import {User} from '../models/schema.js'
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





export {userLogUp,userLogin}