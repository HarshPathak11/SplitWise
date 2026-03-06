import mongoose from "mongoose";
import { Expense, User } from "../models/schema.js";

const getUserFriendExpenses = async (req, res) => {
  try {
    const { currentUserId, friendId } = req.params;
    const { limit, cursor } = req.query;

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

    // Base filter: expenses between the two users
    const baseFilter = {
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
    };

    // If cursor is provided, only fetch items older than the cursor
    if (cursor) {
      baseFilter.createdAt = { $lt: new Date(cursor) };
    }

    const parsedLimit = limit ? parseInt(limit, 10) : null;

    let query = Expense.find(baseFilter)
      .populate("group", "name")
      .populate("paidBy", "username email")
      .populate("owedBy.user", "username email")
      .sort({ createdAt: -1 });

    // If limit is provided, fetch one extra to check if more exist
    if (parsedLimit) {
      query = query.limit(parsedLimit + 1);
    }

    const expenses = await query.lean();

    // Determine hasMore and trim the extra item
    let hasMore = false;
    let nextCursor = null;
    if (parsedLimit && expenses.length > parsedLimit) {
      hasMore = true;
      expenses.pop(); // remove the extra probe item
    }

    // nextCursor is the createdAt of the oldest item in this batch
    if (parsedLimit && expenses.length > 0) {
      nextCursor = expenses[expenses.length - 1].createdAt;
    }

    // Add a safe `groupName` field even if group doesn't exist
    const expensesWithGroupName = expenses.map((exp) => ({
      ...exp,
      groupName: exp.group?.name || null,
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
      hasMore,
      nextCursor,
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

const updatePersonalExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { description, amount, date } = req.body;

    const expense = await Expense.findOne({ _id: id, paidBy: userId, owedBy: { $size: 0 } });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found or unauthorized" });
    }

    if (description !== undefined) expense.title = description;
    if (amount !== undefined) expense.amount = parseFloat(Number(amount).toFixed(2));
    if (date !== undefined) expense.date = new Date(date);

    await expense.save();

    res.status(200).json(expense);
  } catch (error) {
    console.error("Error updating personal expense:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export {
  getUserFriendExpenses,
  createPersonalExpense,
  getPersonalExpenses,
  deletePersonalExpense,
  updatePersonalExpense
};
