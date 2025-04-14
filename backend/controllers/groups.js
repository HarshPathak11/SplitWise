import { Group } from "../models/schema.js";
import { User } from "../models/schema.js";
import { Expense } from "../models/schema.js";
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

  console.log("Group ID:", groupId);
  console.log("Member IDs to add:", members);

  if (!groupId || !Array.isArray(members)) {
    return res.status(400).json({ message: "Invalid input" });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const existingMemberIds = group.members.map((id) => id.toString());
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

    const updatedGroup = await Group.findById(groupId).populate("members");
    res.status(200).json(updatedGroup);
  } catch (err) {
    console.error("Add Members Error:", err);
    res.status(500).json({ message: "Server error" });
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

    // Commit transaction if all operations succeed
    await session.commitTransaction();
    session.endSession();

    const updatedGroup = await Group.findById(groupId).populate(
      "members",
      "username email"
    );
    return res
      .status(200)
      .json({ success: true, expense: newExpense, updatedGroup: updatedGroup });
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

export {
  createGroup,
  getGroupDetails,
  addMembers,
  getAllGroupsOfAUser,
  addExpenseController,
  getUserTrips,
  getRecentExpenses,
};
