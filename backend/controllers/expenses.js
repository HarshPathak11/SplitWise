import { Expense } from '../models/schema.js';

const getUserFriendExpenses = async (req, res) => {
  try {
    const { currentUserId, friendId } = req.params;

    if (!currentUserId || !friendId) {
      return res.status(400).json({
        status: "Missing currentUserId or friendId"
      });
    }

      if (currentUserId === friendId) {
      return res.status(400).json({
        status: "Invalid request: friendId and currentUserId cannot be the same"
      });
    }

const expenses = await Expense.find({
  $or: [
    {
      paidBy: currentUserId,
      "owedBy.user": friendId
    },
    {
      paidBy: friendId,
      "owedBy.user": currentUserId
    }
  ]
})
  .populate("paidBy", "username email")
  .populate("owedBy.user", "username email");

    return res.status(200).json({
      status: "Success",
      count: expenses.length,
      expenses
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "Error",
      message: error.message
    });
  }
};

export { getUserFriendExpenses };
