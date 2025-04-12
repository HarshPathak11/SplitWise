import { Group } from "../models/schema.js";
import { User } from "../models/schema.js";
import dotenv from "dotenv";
dotenv.config();

const createGroup = async (req, res) => {
  const { name, description, from, to, members } = req.body;
  try {
    // Create and save the new group
    const group = new Group({
      name,
      description,
      from,
      to,
      members, // should be user ObjectIds
    });

    await group.save();
    // Update users to include this group
    const updatedUsers = await Promise.all(
      members.map(async (userId) => {
        return await User.findByIdAndUpdate(
          userId,
          { $addToSet: { groups: group._id } },
          { new: true }
        );
      })
    );
    res
      .status(201)
      .json({ message: "Group created successfully", group, updatedUsers });
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
  
      for (const userId of members) {
        // Add to group if not already present
        if (!group.members.includes(userId)) {
          group.members.push(userId);
        }
  
        // Add group to user's groups list
        const user = await User.findById(userId);
        if (user && !user.groups.includes(group._id)) {
          user.groups.push(group._id);
          await user.save(); // ✅ save user after modification
        }
      }
  
      await group.save(); // ✅ save group after pushing members
  
      const updatedGroup = await Group.findById(groupId).populate("members", "username email");
      res.status(200).json(updatedGroup);
    } catch (err) {
      console.error("Add Members Error:", err);
      res.status(500).json({ message: "Server error" });
    }
  };
  

const getGroupDetails = async (req, res) => {
  const groupId = req.params.id; // Assuming you have the group ID from the request
  try {
    const group = await Group.findById(groupId).populate(
      "members",
      "username email"
    ); // Populate members with their username and email
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    res.status(200).json(group);
  } catch (error) {
    console.error("Error fetching group details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { createGroup, getGroupDetails, addMembers, getAllGroupsOfAUser };
