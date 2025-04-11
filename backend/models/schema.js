import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

// Expense inside a group
const groupExpenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  owedBy: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      amount: { type: Number, required: true },
    },
  ],
}, { timestamps: true });

// Group schema
const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  expenses: [groupExpenseSchema],
}, { timestamps: true });

// Recent individual expenses (not in groups)
const recentExpenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  owedBy: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      amount: { type: Number, required: true },
    },
  ],
}, { timestamps: true });

// User schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
  recentExpense: [recentExpenseSchema],
  upiId: { type: String },
}, { timestamps: true });

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

const User = mongoose.model("User", userSchema);
const Group = mongoose.model("Group", groupSchema);

export { User, Group };
