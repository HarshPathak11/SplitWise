import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const expenseSchema=new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    description: {type:String, required:true},
    amount:{type:Number, required:true},
    paidBy:{type:String, required:true},
    owedBy:[{type:String, required:true}]
});

const groupSchema=new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name:{type:String, required:true},
    expenses:[expenseSchema]
});

const friendSchema=new mongoose.Schema({
    type:String
})

const userSchema=new mongoose.Schema({
    username:{type:String, required:true},
    email:{type:String, required:true},
    password:{type:String, required:true},
    friends:[friendSchema],
    groups:[groupSchema]
});

userSchema.pre("save", async function(next){
    if(this.isModified("password")) // isModified is a function already given in mongoose to check if the fireld is chamged or not  
    this.password=await bcrypt.hash(this.password,10);
    next();
 })
 
 
 // custom methods - we can form as many custom methods as required
 userSchema.methods.isPasswordCorrect= async function(password){
    console.log(password,this.password)
     return await bcrypt.compare(password,this.password)
 }

export const User = mongoose.model('User', userSchema);

// export default {User};