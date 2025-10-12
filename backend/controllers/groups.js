import { Group } from "../models/schema.js";
import { User } from "../models/schema.js";
import { Expense } from "../models/schema.js";
import {
  sendOneNotification,
  sendMultipleNotifications,
} from "../controllers/Notifications.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const createGroup = async (req, res) => {
  const { name, description, from, to, members } = req.body;

  try {
    // Step 1: Create the group
    const group = new Group({
      name,
      description,
      from,
      to,
      members, // Array of user ObjectIds
    });

    await group.save();

    // Step 2: Add group reference to each user
    await Promise.all(
      members.map(async (userId) => {
        await User.findByIdAndUpdate(
          userId,
          { $addToSet: { groups: group._id } },
          { new: true }
        );
      })
    );

    // Step 3: Ensure mutual friendship between all members
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const userA = members[i];
        const userB = members[j];

        // Add userB to userA's friends if not present
        await User.updateOne(
          { _id: userA, "friends.friend": { $ne: userB } },
          { $push: { friends: { friend: userB, balance: 0 } } }
        );

        // Add userA to userB's friends if not present
        await User.updateOne(
          { _id: userB, "friends.friend": { $ne: userA } },
          { $push: { friends: { friend: userA, balance: 0 } } }
        );
      }
    }

    res.status(201).json({
      message: "Group created and friendships updated successfully",
      group,
    });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Function to Fetch all groups of a user
const getAllGroupsOfAUser = async (req, res) => {
  const userId = req.params.id; // Assuming you have the user ID from the request
  try {
    const groups = await Group.find({ members: userId });
    res.status(200).json(groups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const addMembers = async (req, res) => {
  const groupId = req.params.id;
  const { members } = req.body; // members = array of user._id

  if (!groupId || !Array.isArray(members)) {
    return res.status(400).json({ message: "Invalid input" });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const existingMemberIds = group.members.map((id) => id.toString());
    const newMembers = members.filter((id) => !existingMemberIds.includes(id)); // ✅ only new users
    const allMembers = [
      ...new Set([...existingMemberIds, ...members.map((id) => id.toString())]),
    ];

    // Step 1: Add new members to the group
    for (const userId of members) {
      if (!existingMemberIds.includes(userId)) {
        group.members.push(userId);
      }

      // Add group to user's groups list
      const user = await User.findById(userId);
      if (user && !user.groups.includes(group._id)) {
        await User.updateOne(
          { _id: userId },
          { $addToSet: { groups: group._id } }
        );
      }
    }

    // Step 2: Ensure all group members are mutual friends
    for (let i = 0; i < allMembers.length; i++) {
      for (let j = i + 1; j < allMembers.length; j++) {
        const userA = allMembers[i];
        const userB = allMembers[j];

        await User.updateOne(
          { _id: userA, "friends.friend": { $ne: userB } },
          { $push: { friends: { friend: userB, balance: 0 } } }
        );

        await User.updateOne(
          { _id: userB, "friends.friend": { $ne: userA } },
          { $push: { friends: { friend: userA, balance: 0 } } }
        );
      }
    }

    await group.save();

    // Step 3: 🔔 Notify newly added members
    if (newMembers.length > 0) {
      const users = await User.find(
        { _id: { $in: newMembers } },
        "fcmToken username"
      );

      // Collect all valid tokens
      const tokens = users.map((u) => u.fcmToken).filter(Boolean);

      if (tokens.length > 0) {
        const title = "Added to a Group";
        const body = `You have been added to the group "${group.name}".`;
        await sendMultipleNotifications(tokens, title, body); // ✅ send in one request
      }
    }

    const updatedGroup = await Group.findById(groupId).populate("members");
    res.status(200).json(updatedGroup);
  } catch (err) {
    console.error("Add Members Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const removeMembers = async (req, res) => {
  const groupId = req.params.id;
  const { members } = req.body; // members = array of user._id
  // console.log("Removing members from group:", groupId, "Members:", members);

  if (!groupId || !Array.isArray(members)) {
    return res.status(400).json({ message: "Invalid input" });
  }

  try {
    const group = await Group.findById(groupId).populate(
      "members",
      "username email groups"
    );

    if (!group) return res.status(404).json({ message: "Group not found" });

    // Step 1: Remove members from the group
    group.members = group.members.filter(
      (member) => !members.includes(member._id.toString())
    );
    await group.save();

    // Step 2: Remove group reference from each removed user
    await User.updateMany(
      { _id: { $in: members } },
      { $pull: { groups: groupId } }
    );

    // Step 3: 🔔 Notify removed members
    const removedUsers = await User.find(
      { _id: { $in: members } },
      "fcmToken username"
    );
    // Collect all valid tokens
    const tokens = removedUsers.map((u) => u.fcmToken).filter(Boolean);

    if (tokens.length > 0) {
      const title = "Removed from Group";
      const body = `You have been removed from the group "${group.name}".`;
      await sendMultipleNotifications(tokens, title, body); // ✅ one request to FCM
    }

    // ✅ Return updated group
    const updatedGroup = await Group.findById(groupId).populate(
      "members",
      "username"
    );
    return res.status(200).json(updatedGroup);
  } catch (err) {
    console.error("Remove Members Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getGroupDetails = async (req, res) => {
  const groupId = req.params.id; // Assuming you have the group ID from the request
  try {
    const group = await Group.findById(groupId)
      .populate("members", "username email")
      .populate({
        path: "expenses",
        populate: [
          { path: "paidBy", select: "username email" },
          { path: "owedBy.user", select: "username email" },
        ],
      });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    res.status(200).json(group);
  } catch (error) {
    console.error("Error fetching group details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * addExpenseController
 *
 * This controller:
 * - Creates a new Expense document.
 * - Depending on the split mode, calculates the owedBy details.
 * - Pushes the entire expense document (as an embedded subdocument) into:
 *    - the Group's expenses array (if a group is specified),
 *    - the payer User’s recentExpense field.
 * - Updates friend balances based on the shared expense.
 *
 * Expected req.body:
 * {
 *   title: String,
 *   amount: Number, // total expense amount
 *   paidBy: String, // payer's user _id
 *   groupId: String, // optional if expense belongs to a group
 *   splitMode: 'equally' | 'unequally',
 *   involvedMembers: Array of user _ids,  // for the expense splitting (owedBy)
 *   customAmounts: { [userId]: Number }    // provided only if splitMode === 'unequally'
 * }
 */
const addExpenseController = async (req, res) => {
  const {
    title,
    amount, // e.g., "300"
    paidBy, // payer's user _id
    groupId, // group _id if applicable (or null)
    splitMode, // either "equally" or "unequally"
    involvedMembers, // array of user _ids who are part of the expense splitting
    customAmounts, // object mapping user _id to amount (for uneven splits)
  } = req.body;

  // Basic validation
  if (
    !title ||
    !amount ||
    !paidBy ||
    !involvedMembers ||
    !Array.isArray(involvedMembers) ||
    involvedMembers.length === 0
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  if (involvedMembers.length === 1 && involvedMembers[0] === paidBy) {
    return res.status(400).json({
      success: false,
      message: "Cannot split expense with only the payer involved.",
    });
  }

  // Get payer's friends list
  const payer = await User.findById(paidBy).select("friends username");
  if (!payer) {
    return res.status(404).json({ success: false, message: "Payer not found" });
  }

  const friendIds = payer.friends.map((f) => f.friend.toString());
    
  // Find all non-friends from involvedMembers (skip self)
  const notFriends = involvedMembers.filter(
    (memberId) =>
      memberId.toString() !== paidBy.toString() && // ✅ skip self
      !friendIds.includes(memberId.toString())
  );

  console.log("Not friends with:", notFriends);

  if (notFriends.length > 0) {
    // Fetch names of non-friends
    const nonFriendUsers = await User.find({ _id: { $in: notFriends } }).select(
      "username"
    );

    const nonFriendNames = nonFriendUsers.map((u) => u.username);

    return res.status(400).json({
      success: false,
      message: `Cannot add expense since ${
        payer.username
      } is not friends with ${nonFriendNames.join(", ")}`,
    });
  }

  // Start a transaction session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Build the owedBy array for the expense document
    let owedByArray = [];

    if (splitMode === "equally") {
      // Equal splitting: Divide the amount evenly among all involved members.
      // Note: Even if the payer is in involvedMembers, that's fine; we’ll skip balance updates for self-payments.
      const share = parseFloat(amount) / involvedMembers.length;
      owedByArray = involvedMembers.map((memberId) => ({
        user: memberId,
        amount: parseFloat(share.toFixed(2)),
      }));
    } else if (splitMode === "unequally") {
      // Unequal splitting: Ensure provided custom amounts add up correctly.
      const totalCustom = Object.values(customAmounts).reduce(
        (sum, val) => sum + parseFloat(val || 0),
        0
      );

      if (
        parseFloat(totalCustom.toFixed(2)) !==
        parseFloat(parseFloat(amount).toFixed(2))
      ) {
        throw new Error(
          "Total of custom amounts does not match the expense amount."
        );
      }

      owedByArray = involvedMembers.map((memberId) => ({
        user: memberId,
        amount: parseFloat(parseFloat(customAmounts[memberId]).toFixed(2)),
      }));
    } else {
      throw new Error("Invalid split mode provided.");
    }

    // Create a new Expense document (from the Expense collection)
    const newExpense = new Expense({
      title,
      amount: parseFloat(amount),
      paidBy,
      owedBy: owedByArray,
      group: groupId || null,
    });

    // Save the new expense within the transaction
    await newExpense.save({ session });

    // -------------------------------
    // Update Group and User by pushing the entire expense document as an embedded subdocument.
    // Since the Group.expenses and User.recentExpense fields are defined using expenseSchema,
    // pushing newExpense.toObject() embeds the complete expense data (with createdAt, updatedAt, etc.).
    // -------------------------------
    if (groupId) {
      await Group.findByIdAndUpdate(
        groupId,
        {
          $push: { expenses: newExpense.toObject() },
          $inc: { tripTotal: newExpense.amount }, // 👈 increment tripTotal
        },
        { session }
      );
    }

    await User.findByIdAndUpdate(
      paidBy,
      { $push: { recentExpense: newExpense.toObject() } },
      { session }
    );

    // -------------------------------
    // Update friend balances:
    // For each owedBy entry, if the owed user is not the payer, update balances.
    // In the payer's document, increase the balance for that friend.
    // In the friend's document, decrease the balance for the payer.
    // -------------------------------
    for (const owed of owedByArray) {
      if (owed.user.toString() === paidBy.toString()) continue; // Skip self-payment

      // Update payer's record: increment the balance for this friend
      await User.updateOne(
        { _id: paidBy, "friends.friend": owed.user },
        { $inc: { "friends.$.balance": owed.amount } },
        { session }
      );

      // Update the friend's record: decrement the balance for the payer
      await User.updateOne(
        { _id: owed.user, "friends.friend": paidBy },
        { $inc: { "friends.$.balance": -owed.amount } },
        { session }
      );
    }

    // Send Notification to all owedBy users (including payer)
    const userIds = owedByArray.map((owed) => owed.user);
    // include payer as well if not already in owedByArray
    if (!userIds.includes(paidBy)) {
      userIds.push(paidBy);
    }

    // Fetch their FCM tokens from User collection
    const users = await User.find(
      { _id: { $in: userIds } },
      "fcmToken username"
    );

    // Extract tokens
    const tokens = users.map((u) => u.fcmToken).filter(Boolean);

    // Prepare notification
    if (tokens.length > 0) {
      const payer = users.find((u) => u._id.toString() === paidBy.toString());
      const title = "Tap to see";
      const body = `${newExpense.title} expense has been paid by ${
        payer?.username || "Someone"
      }. \nAmount: ${newExpense.amount}`;

      await sendMultipleNotifications(tokens, title, body);
    }

    // Commit transaction if all operations succeed
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ success: true, expense: newExpense });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    console.error("Error in addExpenseController:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getUserTrips = async (req, res) => {
  const { userId } = req.params; // Expecting URL like /api/user/:userId/trips
  try {
    // Find the user and populate their groups (trips) along with members.
    const user = await User.findById(userId).populate({
      path: "groups",
      populate: {
        path: "members", // Populate the members in each group.
        select: "username email", // Only retrieve username and email.
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Sort the groups (trips) in descending order (newest first) based on createdAt.
    const sortedTrips = user.groups.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Return the sorted trips information.
    return res.status(200).json({ trips: sortedTrips });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getRecentExpenses = async (req, res) => {
  const { userId } = req.params; // Expecting URL like /api/user/:userId/recent-expenses
  try {
    // Find the user and populate the recentExpense field.
    const user = await User.findById(userId).populate({
      path: "recentExpense",
      populate: [
        {
          path: "paidBy",
          select: "username email",
        },
        {
          path: "owedBy.user",
          select: "username email",
        },
        {
          path: "group",
          select: "name description",
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Sort the recent expenses by createdAt in descending order.
    const sortedExpenses = user.recentExpense.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    // Return the sorted recent expenses.
    return res.status(200).json({ recentExpenses: sortedExpenses });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addafterDeleteExpenseController = async (req, res) => {
  const {
    title,
    amount, // e.g., "300"
    paidBy, // payer's user _id
    groupId, // group _id if applicable (or null)
    splitMode, // either "equally" or "unequally"
    involvedMembers, // array of user _ids who are part of the expense splitting
    customAmounts, // object mapping user _id to amount (for uneven splits)
    createdAt: clientCreatedAt, // optionally provided by client to preserve original timestamp
  } = req.body;

  // Basic validation
  if (
    !title ||
    !amount ||
    !paidBy ||
    !involvedMembers ||
    !Array.isArray(involvedMembers) ||
    involvedMembers.length === 0
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Build owedBy array
    let owedByArray = [];
    if (splitMode === "equally") {
      const share = parseFloat(amount) / involvedMembers.length;
      owedByArray = involvedMembers.map((memberId) => ({
        user: memberId,
        amount: parseFloat(share.toFixed(2)),
      }));
    } else if (splitMode === "unequally") {
      const totalCustom = Object.values(customAmounts).reduce(
        (sum, val) => sum + parseFloat(val || 0),
        0
      );

      if (
        parseFloat(totalCustom.toFixed(2)) !==
        parseFloat(parseFloat(amount).toFixed(2))
      ) {
        throw new Error(
          "Total of custom amounts does not match the expense amount."
        );
      }

      owedByArray = involvedMembers.map((memberId) => ({
        user: memberId,
        amount: parseFloat(parseFloat(customAmounts[memberId]).toFixed(2)),
      }));
    } else {
      throw new Error("Invalid split mode provided.");
    }

    // Create new Expense (possibly overriding createdAt if provided)
    const expenseData = {
      title,
      amount: parseFloat(amount),
      paidBy,
      owedBy: owedByArray,
      group: groupId || null,
    };
    if (clientCreatedAt) {
      expenseData.createdAt = new Date(clientCreatedAt);
      // updatedAt will be set automatically
    }

    const newExpense = new Expense(expenseData);
    await newExpense.save({ session });

    // 1) Update Group (if any)
    if (groupId) {
      await Group.findByIdAndUpdate(
        groupId,
        {
          $push: { expenses: newExpense.toObject() },
          $inc: { tripTotal: newExpense.amount },
        },
        { session }
      );
    }

    // 2) Update payer's recentExpense
    await User.findByIdAndUpdate(
      paidBy,
      { $push: { recentExpense: newExpense.toObject() } },
      { session, select: false }
    );

    // 3) Update friend balances
    for (const owed of owedByArray) {
      if (owed.user.toString() === paidBy.toString()) continue;
      // Payer's friend subdocument: increment by owed.amount
      await User.updateOne(
        { _id: paidBy, "friends.friend": owed.user },
        { $inc: { "friends.$.balance": owed.amount } },
        { session }
      );
      // Friend's friend subdocument: decrement by owed.amount
      await User.updateOne(
        { _id: owed.user, "friends.friend": paidBy },
        { $inc: { "friends.$.balance": -owed.amount } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    // ✅ Send notifications after successful edit
    try {
      let notifyUsers = [];

      if (groupId) {
        // If it's a group expense → notify all group members
        const group = await Group.findById(groupId).populate(
          "members",
          "fcmToken username"
        );
        notifyUsers = group.members;
      } else {
        // If it's a non-group expense → notify only involved members
        notifyUsers = await User.find(
          { _id: { $in: involvedMembers } },
          "fcmToken username"
        );
      }

      // Collect tokens
      const tokens = notifyUsers.map((u) => u.fcmToken).filter(Boolean); // remove null/undefined

      if (tokens.length > 0) {
        const body = `Expense "${title}" has been updated for ₹${amount}.`;
        await sendMultipleNotifications(tokens, title, body);
      }
    } catch (notifyErr) {
      console.error("Error sending expense edited notification:", notifyErr);
    }

    return res.status(200).json({ success: true, expense: newExpense });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error in addExpenseController:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------
// 2) deleteExpenseController
// -----------------------------------------
const deleteExpenseController = async (req, res) => {
  const { expenseId } = req.params;
  const { action } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1) Load the existing expense (including owedBy, paidBy, amount, group)
    const expense = await Expense.findById(expenseId).session(session);
    if (!expense) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Expense not found" });
    }

    const { paidBy, owedBy, amount, group: groupId } = expense;

    // 2) Reverse each balance update
    for (const owed of owedBy) {
      const owedUserId = owed.user.toString();
      const payerId = paidBy.toString();
      const owedAmount = owed.amount;

      if (owedUserId === payerId) continue;

      // In payer's document: decrement that friend's balance by owedAmount
      await User.updateOne(
        { _id: paidBy, "friends.friend": owed.user },
        { $inc: { "friends.$.balance": -owedAmount } },
        { session }
      );
      // In friend's document: increment payer's balance by owedAmount
      await User.updateOne(
        { _id: owed.user, "friends.friend": paidBy },
        { $inc: { "friends.$.balance": owedAmount } },
        { session }
      );
    }

    // 3) Remove from payer's recentExpense
    await User.updateOne(
      { _id: paidBy },
      { $pull: { recentExpense: { _id: expenseId } } },
      { session }
    );

    // 4) If part of a group, remove from Group.expenses and decrement tripTotal
    if (groupId) {
      await Group.updateOne(
        { _id: groupId },
        {
          $pull: { expenses: { _id: expenseId } },
          $inc: { tripTotal: -amount },
        },
        { session }
      );
    }

    // 5) Delete the Expense document itself
    await Expense.deleteOne({ _id: expenseId }, { session });

    // 6) 🔔 Notify group members about the deleted expense
    if (groupId && action !== "edit") {
      const group = await Group.findById(groupId).populate(
        "members",
        "fcmToken username"
      );
      if (group && group.members.length > 0) {
        const tokens = group.members.map((m) => m.fcmToken).filter(Boolean);
        if (tokens.length > 0) {
          const title = "Expense Deleted";
          const body = `An expense "${expense.title}" of amount ₹${expense.amount} has been deleted from group "${group.name}".`;
          await sendMultipleNotifications(tokens, title, body);
        }
      }
    }

    await session.commitTransaction();
    session.endSession();
    return res.status(200).json({ success: true, message: "Expense deleted" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error in deleteExpenseController:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------
// 3) getExpenseController (fetch one expense by ID)
// -----------------------------------------
const getExpenseController = async (req, res) => {
  const { expenseId } = req.params;
  try {
    // Populate owedBy.user and paidBy so that the frontend sees usernames etc.
    const expense = await Expense.findById(expenseId)
      .populate("owedBy.user", "username")
      .populate("paidBy", "username")
      .lean();

    if (!expense) {
      return res
        .status(404)
        .json({ success: false, message: "Expense not found" });
    }

    return res.status(200).json({ success: true, expense });
  } catch (error) {
    console.error("Error in getExpenseController:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

//Get top categories for a user
// const getTopCategoriesForGroupExpense = async (req, res) => {
//   try {
//     const { groupId } = req.params;
//     if (!groupId) {
//       return res.status(400).json({ message: "Group ID is required" });
//     }

//     const groupObjectId = new mongoose.Types.ObjectId(groupId);

//     const categories = await Expense.aggregate([
//       { $match: { "group": groupObjectId } },
//       { $group: { _id: "$category", total: { $sum: "$amount" } } },
//       { $sort: { total: -1 } },
//       // { $limit: 4 },
//     ]);

//     // Optional: rename _id to name for frontend convenience
//     const formattedCategories = categories.map((cat) => ({
//       name: cat._id,
//       total: cat.total,
//     }));

//     res.status(200).json({ categories: formattedCategories });
//   } catch (error) {
//     console.error("Error fetching top categories:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
const getTopCategoriesForGroupExpense = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { startDate, endDate } = req.query; // frontend sends these as query params

    if (!groupId) {
      return res.status(400).json({ message: "Group ID is required" });
    }

    const groupObjectId = new mongoose.Types.ObjectId(groupId);

    // Base match condition
    const matchConditions = { group: groupObjectId };

    // Add date filter if provided
    if (startDate || endDate) {
      matchConditions.createdAt = {};
      if (startDate) matchConditions.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const adjustedEnd = new Date(endDate);
        adjustedEnd.setHours(23, 59, 59, 999);
        matchConditions.createdAt.$lte = adjustedEnd;
      }
    }

    const categories = await Expense.aggregate([
      { $match: matchConditions },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
      // { $limit: 4 },
    ]);

    const formattedCategories = categories.map((cat) => ({
      name: cat._id,
      total: cat.total,
    }));

    res.status(200).json({ categories: formattedCategories });
  } catch (error) {
    console.error("Error fetching top categories:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// //Get subcategories for a user within a category
// const getSubCategoriesForGroup = async (req, res) => {
//   try {
//     const { groupId, category } = req.body;

//     if (!groupId) {
//       return res.status(400).json({ message: "Group ID is required" });
//     }

//     const groupObjectId = new mongoose.Types.ObjectId(groupId);

//     const subcategories = await Expense.aggregate([
//       {
//         $match: { "group": groupObjectId, ...(category && { category }) },
//       },
//       { $group: { _id: "$subcategory", total: { $sum: "$amount" } } },
//       { $sort: { total: -1 } },
//     ]);

//     const formattedSubcategories = subcategories.map((sub) => ({
//       name: sub._id,
//       total: sub.total,
//     }));

//     res.status(200).json({ subcategories: formattedSubcategories });
//   } catch (error) {
//     console.error("Error fetching subcategories:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// //Get all expenses for a user in a specific subcategory
// const getAllExpensesForASubcategoryInGroup = async (req, res) => {
//   try {
//     const { groupId, category, subcategory } = req.body;

//     if (!groupId || !category || !subcategory) {
//       return res.status(400).json({ message: "Incomplete data received" });
//     }

//     const userObjectId = new mongoose.Types.ObjectId(groupId);

//     // Build the query
//     const query = {
//       "group": userObjectId,
//       category: category,
//       subcategory: subcategory,
//     };

//     // Fetch expenses and sort by updatedAt descending
//     const expenses = await Expense.find(query)
//       .populate({ path: "paidBy", select: "username" })
//       .populate({ path: "owedBy.user", select: "username" })
//       .sort({ updatedAt: -1 });

//     res.status(200).json({ expenses });
//   } catch (error) {
//     console.error("Error fetching expenses:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// Get subcategories for a group within a category (with optional timeline filter)
const getSubCategoriesForGroup = async (req, res) => {
  try {
    const { groupId, category, startDate, endDate } = req.body;

    if (!groupId) {
      return res.status(400).json({ message: "Group ID is required" });
    }

    const groupObjectId = new mongoose.Types.ObjectId(groupId);

    // Build match stage
    const matchStage = { group: groupObjectId, ...(category && { category }) };

    // Add timeline filter
    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      matchStage.createdAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      matchStage.createdAt = { $lte: new Date(endDate) };
    }

    const subcategories = await Expense.aggregate([
      { $match: matchStage },
      { $group: { _id: "$subcategory", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]);

    const formattedSubcategories = subcategories.map((sub) => ({
      name: sub._id,
      total: sub.total,
    }));

    res.status(200).json({ subcategories: formattedSubcategories });
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all expenses for a subcategory within a group (with optional timeline filter)
const getAllExpensesForASubcategoryInGroup = async (req, res) => {
  try {
    const { groupId, category, subcategory, startDate, endDate } = req.body;

    if (!groupId || !category || !subcategory) {
      return res.status(400).json({ message: "Incomplete data received" });
    }

    const groupObjectId = new mongoose.Types.ObjectId(groupId);

    // Build the query
    const query = {
      group: groupObjectId,
      category,
      subcategory,
    };

    // Add optional date filters
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      query.createdAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.createdAt = { $lte: new Date(endDate) };
    }

    // Fetch expenses and sort by updatedAt descending
    const expenses = await Expense.find(query)
      .populate({ path: "paidBy", select: "username" })
      .populate({ path: "owedBy.user", select: "username" })
      .sort({ updatedAt: -1 });

    res.status(200).json({ expenses });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export {
  createGroup,
  getGroupDetails,
  addMembers,
  getAllGroupsOfAUser,
  addExpenseController,
  getUserTrips,
  getRecentExpenses,
  removeMembers,
  addafterDeleteExpenseController,
  deleteExpenseController,
  getExpenseController,
  getTopCategoriesForGroupExpense,
  getSubCategoriesForGroup,
  getAllExpensesForASubcategoryInGroup,
};
