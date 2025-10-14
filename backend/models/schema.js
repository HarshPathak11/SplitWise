import mongoose from "mongoose";
import bcrypt from "bcrypt";

//Expense Schema
const expenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, default: null, index: true },
    subcategory: { type: String, default: null, index: true },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        amount: { type: Number, required: true },
      },
    ],
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" }, // optional, if expense is part of a group
  },
  { timestamps: true }
);

// Group schema
const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    from: { type: Date },
    to: { type: Date },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    tripTotal: { type: Number, default: 0 },
    expenses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Expense" }],
  },
  { timestamps: true }
);

// Friend Request Schema
const friendRequestSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// User schema
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    fcmToken: { type: String, default: null },
    friends: [
      {
        friend: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        balance: { type: Number, default: 0 },
      },
    ],
    requests: { type: Number, default: 0 },
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
    recentExpense: [{ type: mongoose.Schema.Types.ObjectId, ref: "Expense" }],
    upiId: { type: String },
    aiChatUsage: {
      count: { type: Number, default: 0 },
      lastUsed: { type: Date, default: null },
    },
    profilePhotoUrl: { type: String, default: null }, // secure_url from Cloudinary
    profilePhotoId:  { type: String, default: null }, // public_id used for deletion
  },
  { timestamps: true }
);

//Label schema
const LabelCategorySchema = new mongoose.Schema({
  label: { type: String, unique: true, index: true },
  category: String,
  subcategory: String,
},
{ timestamps: true });

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

expenseSchema.index({ paidBy: 1, "owedBy.user": 1 });

const Expense = mongoose.model("Expense", expenseSchema);
const User = mongoose.model("User", userSchema);
const Group = mongoose.model("Group", groupSchema);
const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);
const LabelCategory = mongoose.model("LabelCategory", LabelCategorySchema);

export { User, Group, Expense, FriendRequest, LabelCategory };
