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
    email:String,
    name:String,
    balance:{type:Number, default:0},
})

const userSchema=new mongoose.Schema({
    username:{type:String, required:true},
    email:{type:String, required:true, unique:true},
    password:{type:String, required:true, select:false},
    friends:[friendSchema],
    groups:[groupSchema],
    dob:{type:Date},
    mobile:{type:String},
    currency:{type:String},
    recentExpense:[expenseSchema],
    upiId:{type:String},
});

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

export const User = mongoose.model('User', userSchema);