import mongoose from 'mongoose'

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
    friends:[friendSchema],
    groups:[groupSchema]
});

export const User = mongoose.model('User', userSchema);

// export default {User};