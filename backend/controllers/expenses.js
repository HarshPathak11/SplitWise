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

export { getUserFriendExpenses };
