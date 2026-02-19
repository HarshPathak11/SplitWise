import mongoose from "mongoose";
import { Expense, User } from "../models/schema.js";

const getUserFriendExpenses = async (req, res) => {
  try {
    const { currentUserId, friendId } = req.params;

    if (!currentUserId || !friendId) {
      return res.status(400).json({
        status: "Missing currentUserId or friendId",
      });
    }

    if (currentUserId === friendId) {
      return res.status(400).json({
        status:
          "Invalid request: friendId and currentUserId cannot be the same",
      });
    }

    const expenses = await Expense.find({
      $or: [
        {
          paidBy: currentUserId,
          "owedBy.user": friendId,
        },
        {
          paidBy: friendId,
          "owedBy.user": currentUserId,
        },
      ],
    })
      .populate("group", "name") // ✅ populate group name if exists
      .populate("paidBy", "username email")
      .populate("owedBy.user", "username email")
      .lean(); // return plain JS objects so we can modify easily

    // ✅ Add a safe `groupName` field even if group doesn't exist
    const expensesWithGroupName = expenses.map((exp) => ({
      ...exp,
      groupName: exp.group?.name || null, // null means no group assigned
    }));

    // Fetch friend's activity status
    const friend = await User.findById(friendId).select("lastActive updatedAt").lean();

    const friendActivity = {};
    if (friend) {
      if (friend.lastActive) {
        friendActivity.lastAtive = friend.lastActive;
      } else {
        friendActivity.updatedAt = friend.updatedAt;
      }
    }

    return res.status(200).json({
      status: "Success",
      count: expensesWithGroupName.length,
      expenses: expensesWithGroupName,
      ...friendActivity,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const createPersonalExpense = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { description, amount, date } = req.body;
    const userId = req.user.id;

    if (!description || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let newExpense;

    await session.withTransaction(async () => {
      newExpense = new Expense({
        title: description,
        amount: parseFloat(amount.toFixed(2)),
        date: date || Date.now(),
        paidBy: userId
      });

      await newExpense.save({ session });
      await User.findByIdAndUpdate(userId, {
        $push: { recentExpense: newExpense._id }
      }, { session });
    });

    res.status(201).json(newExpense);
  } catch (error) {
    console.error("Error creating personal expense:", error);
    res.status(500).json({ message: "Server error" });
  } finally {
    session.endSession();
  }
};

const getPersonalExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const expenses = await Expense.find({
      paidBy: userId,
      owedBy: {$size: 0},
    }).sort({ date: -1 });

    res.status(200).json(expenses);
  } catch (error) {
    console.error("Error fetching personal expenses:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deletePersonalExpense = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const expense = await Expense.findOne({ _id: id, paidBy: userId });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found or unauthorized" });
    }

    await session.withTransaction(async () => {
      await Expense.findByIdAndDelete(id, { session });
      await User.findByIdAndUpdate(userId, {
        $pull: { recentExpense: id }
      }, { session });
    });

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting personal expense:", error);
    res.status(500).json({ message: "Server error" });
  } finally {
    session.endSession();
  }
};

export {
  getUserFriendExpenses,
  createPersonalExpense,
  getPersonalExpenses,
  deletePersonalExpense
};
