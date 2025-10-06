import { User, Expense } from "../models/schema.js";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import {
  sendOneNotification,
  sendMultipleNotifications,
} from "../controllers/Notifications.js";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
dotenv.config();

// Send OTP to email

const sendOtp = async (req, res) => {
  const { email, username } = req.body;


  if (!email || !username)
    return res.status(400).json({ message: "Incomplete data received" });

  

  const existingUser = await User.findOne({ email });
  const existingUsername = await User.findOne({ username });

  if (existingUsername) {
    return res.status(400).json({ message: "Username already taken" });
  }

  if (existingUser) {
    return res.status(410).json({ message: "Email already taken" });
  }
  

  const otp = Math.floor(100000 + Math.random() * 900000);


  // Ensure API key is set
  if (!process.env.SENDGRID_API_KEY) {
    console.error("SENDGRID_API_KEY not set in env");
    return res.status(500).json({ message: "Email service not configured" });
  }
  if (!process.env.SENDING_EMAIL) {
    console.error("SENDING_EMAIL not set in env");
    return res.status(500).json({ message: "Sender email not configured" });
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: email,
    from: process.env.SENDING_EMAIL,
    subject: `Welcome Onboard ${username}`,
    html: `<h1>Hi ${username},</h1>
           <p>Your OTP for signup is:</p>
           <h2><strong>${otp}</strong></h2>
           <p>This code is valid for 5 minutes.</p>
           <p>Thanks, Fair Fare Team</p>`
  };

  try {
  
    const hashedOtp = await bcrypt.hash(String(otp), 10);

    // send the email
    await sgMail.send(msg);

    // console.log("otp sent via SendGrid");

    // Optionally store hashedOtp + expiry in DB here so you can validate later
    // e.g. await OtpModel.create({ email, otp: hashedOtp, expiresAt: Date.now() + 5*60*1000 });

    return res.status(200).json({ message: "OTP sent to email", otp: hashedOtp });
  } catch (error) {
    // SendGrid errors may include response body with details
    console.error("SendGrid error:", error);
    if (error.response && error.response.body) {
      console.error("SendGrid response body:", error.response.body);
    }
    return res.status(500).json({ message: "Failed to send OTP email" });
  }
};

// Verify OTP and create user
const verifyOtp = async (req, res) => {
  const { otp, username, email, password, otpGenerated, referId } = req.body;

  if (!otp || !email || !otpGenerated || !username || !password) {
    return res.status(400).json({ message: "Incomplete data received" });
  }

  const isOtpValid = await bcrypt.compare(otp, otpGenerated);
  if (!isOtpValid) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  try {
    // 1️⃣ Clean the password
    const cleanPassword = String(password).trim();

    // 4️⃣ Create user in MongoDB
    const newUser = await User.create({
      username,
      email,
      password: cleanPassword, // schema middleware handles hashing
    });

    if (referId) {
      const referUser = await User.findById(referId);
      if (!referUser) {
        return res.status(400).json({ message: "Invalid referral ID" });
      }
      // Add new user to referer's friends list
      await User.updateOne(
        { _id: referId },
        { $push: { friends: { friend: newUser._id, balance: 0 } } }
      );

      await User.updateOne(
        { _id: newUser._id },
        { $push: { friends: { friend: referId, balance: 0 } } }
      );
    }

    return res.status(200).json(newUser);
  } catch (error) {
    console.error("Error during user creation:", error);
    return res
      .status(500)
      .json({ message: "Server error while creating user" });
  }
};

// User login
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log("email and password ", email, password);

    if (!email || !password) {
      return res.status(400).json({ message: "Incomplete data received" });
    }

    // Find user and explicitly select the password field
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const cleanPassword = String(password).trim();

    // Use the schema's comparePassword method
    const isPasswordValid = await user.comparePassword(cleanPassword);
    // console.log("Password comparison result: ", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Password is not correct",
      });
    }

    // Remove password from user object before sending response
    const userWithoutPassword = { ...user.toObject() };
    delete userWithoutPassword.password;

    return res.status(200).json({
      message: "Access Granted",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Internal server error during login",
      error: error.message,
    });
  }
};

//Function to fetch user details
const userDetails = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId)
      .populate({
        path: "friends.friend",
        select: "username email upiId", // optional: select only needed fields
      })
      .populate({
        path: "recentExpense",
        populate: [
          { path: "paidBy", select: "username email" },
          { path: "owedBy.user", select: "username email" },
          { path: "group", select: "name description" },
        ],
      });
    // console.log(user.friends) // exclude sensitive fields
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user: user });
  } catch (err) {
    console.error("Error fetching user details:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const setFcmToken = async (req, res) => {
  try {
    const { fcmToken, userId } = req.body;

    if (!fcmToken) {
      return res.status(400).json({ message: "FCM token is required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { fcmToken },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "FCM token set successfully", user });
  } catch (error) {
    console.error("Error setting FCM token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const removeFcmToken = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findByIdAndUpdate(userId, { fcmToken: null }, { new: true });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "FCM token removed successfully" });
  } catch (error) {
    console.error("Error removing FCM token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Function to update user profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const { username, upiId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, {
      username,
      upiId,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error updating user profile:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//Adding the friends

const addFriends = async (req, res) => {
  const { email, friendsArray, autoAdd } = req.body;

  if (!email || !Array.isArray(friendsArray) || friendsArray.length === 0) {
    return res.status(400).json({ message: "Incomplete data received" });
  }

  // Ensure SendGrid config available (used only for invitation emails)
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDING_EMAIL) {
    console.warn("SendGrid config missing - invitation emails won't be sent");
  } else {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  if (autoAdd) {
    const user = await User.findOne({ email });
    const friend = await User.findOne({ _id: friendsArray[0] });

    if (!user || !friend) {
      return res.status(404).json({ message: "User or Friend not found" });
    }

    await User.updateOne(
      { _id: friend._id },
      { $addToSet: { friends: { friend: user._id, balance: 0 } } }
    );

    await User.updateOne(
      { _id: user._id, "friends.friend": { $ne: friend._id } }, // prevent duplicates
      { $push: { friends: { friend: friend._id, balance: 0 } } }
    );

    // Send FCM notification if available
    if (friend.fcmToken) {
      const tokens = [friend.fcmToken];
      const title = "New Friend Added";
      const body = `${user.username} has added you as a friend!`;
      await sendMultipleNotifications(tokens, title, body);
    }

    return res.status(200).json({
      message: "Friend added successfully",
      friend,
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const addedFriends = [];

    for (const friendEmail of friendsArray) {
      // Skip adding self
      if (friendEmail === email) continue;

      const friend = await User.findOne({ email: friendEmail });

      if (friend) {
        // Add friend to user's list if not present
        if (!user.friends.some((f) => f.friend.equals(friend._id))) {
          await User.updateOne(
            { _id: user._id, "friends.friend": { $ne: friend._id } }, // prevent duplicates
            { $push: { friends: { friend: friend._id, balance: 0 } } }
          );
        }

        // Ensure friendship is mutual
        if (!friend.friends.some((f) => f.friend?.equals(user._id))) {
          await User.updateOne(
            { _id: friend._id },
            { $addToSet: { friends: { friend: user._id, balance: 0 } } }
          );
        }

        addedFriends.push({
          _id: friend._id,
          email: friend.email,
          username: friend.username,
        });

        //Send FCM Notification
        if (friend.fcmToken) {
          const tokens = [friend.fcmToken];
          const title = "New Friend Added";
          const body = `${user.username} has added you as a friend!`;
          await sendMultipleNotifications(tokens, title, body);
        }
      } else {
        // Friend does not exist — send invitation email via SendGrid (if configured)
        if (!process.env.SENDGRID_API_KEY || !process.env.SENDING_EMAIL) {
          console.warn(`Skipping invite email to ${friendEmail} — SendGrid not configured`);
          continue;
        }

        const inviteLink = `https://fair-fare-phi.vercel.app/signup/${user._id}`;
        const msg = {
          to: friendEmail,
          from: process.env.SENDING_EMAIL,
          subject: `Heartfelt invitation from ${user.username}`,
          text: `${user.username} has invited you to join Fair Fare. Join here: ${inviteLink}`,
          html: `
            <h1>Hi,</h1>
            <p>Your friend <strong>${user.username}</strong> has added you as a friend on the Fair Fare App.</p>
            <p>Please click on the link below to join:</p>
            <p><a href="${inviteLink}">Join Fair Fare</a></p>
            <p>Thanks,<br/>Fair Fare Team</p>
          `,
        };

        try {
          await sgMail.send(msg);
          // Optionally log or track successful invite sends
        } catch (err) {
          // Log the SendGrid error but continue processing other friends
          console.error(`Failed to send invite email to ${friendEmail}:`, err);
          if (err.response && err.response.body) {
            console.error("SendGrid response body:", err.response.body);
          }
        }
      }
    }

    return res.status(200).json({
      message: "Friends processed",
      addedFriends,
    });
  } catch (error) {
    console.error("Error in addFriends:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateFriendBalance = async (req, res) => {
  const { userEmail, friendEmail, amount, action, note } = req.body;

  if (!userEmail || !friendEmail || !amount || !action || !note) {
    return res.status(400).json({ message: "Incomplete data received" });
  }

  const value = parseFloat(amount);
  if (isNaN(value) || value <= 0) {
    return res
      .status(400)
      .json({ message: "Amount must be a positive number" });
  }

  try {
    // Fetch both users
    const user = await User.findOne({ email: userEmail });
    const friend = await User.findOne({ email: friendEmail });

    if (!user || !friend) {
      return res.status(404).json({ message: "User or friend not found" });
    }

    // ✅ Check if balance is already 0 and note says "Cleared Everything"
    const friendRecord = user.friends.find(
      (f) => f.friend.toString() === friend._id.toString()
    );
    // console.log(friendRecord);

    if (
      friendRecord &&
      friendRecord.balance === 0 &&
      note === "Cleared Everything"
    ) {
      return res.status(400).json({ message: "Balance already settled" });
    }

    let userIncrement, friendIncrement;
    let payer, owedUser;

    if (action === "paid") {
      userIncrement = value;
      friendIncrement = -value;
      payer = user;
      owedUser = friend;
    } else if (action === "received") {
      userIncrement = -value;
      friendIncrement = value;
      payer = friend;
      owedUser = user;
    } else {
      return res.status(400).json({ message: "Invalid action type" });
    }

    // Update the user's friend record (user -> friend)
    const userUpdateResult = await User.updateOne(
      { email: userEmail, "friends.friend": friend._id },
      { $inc: { "friends.$.balance": userIncrement } }
    );

    // Update the friend's record (friend -> user)
    const friendUpdateResult = await User.updateOne(
      { email: friendEmail, "friends.friend": user._id },
      { $inc: { "friends.$.balance": friendIncrement } }
    );

    // Create expense document
    const expense = await Expense.create({
      title: note,
      amount: value,
      paidBy: payer._id,
      owedBy: [
        {
          user: owedUser._id,
          amount: value,
        },
      ],
    });

    // Push expense to payer's recentExpense
    await User.updateOne(
      { _id: payer._id },
      { $push: { recentExpense: expense } }
    );

    // ✅ Send notifications    
    if (friend.fcmToken) {
      
      sendOneNotification(
        friend.fcmToken,
        "Balance Updated",
        `Your transaction with ${user.username} has been updated.`
      );
    }

    return res.status(200).json({
      message: "Friend balance updated & expense added",
      userUpdate: userUpdateResult,
      friendUpdate: friendUpdateResult,
      expense,
    });
  } catch (error) {
    console.error("Error updating friend balance:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const removeFriend = async (req, res) => {
  const { friendId, userId } = req.body;

  if (!friendId) {
    return res.status(400).json({ message: "Friend ID is required." });
  }

  try {
    // Remove friend from current user
    await User.findByIdAndUpdate(userId, {
      $pull: { friends: { friend: friendId } },
    });

    // Remove current user from friend's list
    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: { friend: userId } },
    });

    return res.status(200).json({ message: "Friend removed successfully." });
  } catch (error) {
    console.error("Error removing friend:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Incomplete data" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000);
  console.log("Password reset OTP generated:", otp);

  // Check SendGrid config
  if (!process.env.SENDGRID_API_KEY) {
    console.error("SENDGRID_API_KEY not set in environment");
    return res.status(500).json({ message: "Email service not configured" });
  }

  if (!process.env.SENDING_EMAIL) {
    console.error("SENDING_EMAIL not set in environment");
    return res.status(500).json({ message: "Sender email not configured" });
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: email,
    from: process.env.SENDING_EMAIL, // must be a verified sender in SendGrid
    subject: "Account Recovery - Fair Fare",
    html: `
      <h1>Password Reset Requested</h1>
      <p>Hi ${user.username || "User"},</p>
      <p>Your OTP for account recovery is:</p>
      <h2><strong>${otp}</strong></h2>
      <p>This code is valid for 5 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
      <br/>
      <p>Thanks,</p>
      <p><strong>Fair Fare Team</strong></p>
    `,
  };

  try {
    const hashedOtp = await bcrypt.hash(String(otp), 10);

    // Send email via SendGrid
    await sgMail.send(msg);

    console.log(`OTP email sent successfully to ${email}`);

    return res.status(200).json({
      message: "OTP sent to email",
      otp: hashedOtp,
    });
  } catch (error) {
    console.error("Failed to send password reset email:", error);

    if (error.response && error.response.body) {
      console.error("SendGrid error details:", error.response.body);
    }

    return res.status(500).json({
      message: "Failed to send OTP email",
    });
  }
};
const verifyForgotPassword = async (req, res) => {
  const { otpGenerated, otp, email } = req.body;
  if (!otp || !otpGenerated)
    return res.status(400).json({ message: "incomplete data" });

  try {
    const isOtpValid = await bcrypt.compare(otp, otpGenerated);
    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    const user = await User.findOne({ email: email });

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error during user creation:", error);
    return res
      .status(500)
      .json({ message: "Server error while creating user" });
  }
};

const changePassword = async (req, res) => {
  const { userId, newPassword } = req.body;
  // console.log(userId,newPassword)

  // Validate required fields
  if (!userId || !newPassword) {
    return res
      .status(400)
      .json({ message: "Please provide userId and newPassword." });
  }

  try {
    // Find the user. Note: If the password field is excluded by default,
    // you may use `.select("+password")` if needed for the pre-save hook.
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const cleanPassword = String(newPassword).trim();

    // Use the schema's comparePassword method
    const isPasswordValid = await user.comparePassword(cleanPassword);
    // console.log("Password comparison result: ", isPasswordValid);

    if (isPasswordValid) {
      return res.status(400).json({
        message: "New password cannot be same as old password",
      });
    }

    // Set the new password. The pre-save middleware in your schema will hash it.
    user.password = newPassword;

    // Save the updated user document
    await user.save();

    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Error changing password:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

const getUpdatedFriendBalances = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Fetch the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create an array of friend balances in the desired format
    const updatedData = user.friends.map((f) => ({
      friendId: f.friend._id, // friend ID
      balance: f.balance, // balance
    }));

    // Send the updated data as response
    return res.status(200).json(updatedData);
  } catch (error) {
    console.error("Error fetching updated friend balances:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export {
  sendOtp,
  userLogin,
  addFriends,
  verifyForgotPassword,
  forgotPassword,
  updateUserProfile,
  verifyOtp,
  removeFriend,
  userDetails,
  updateFriendBalance,
  changePassword,
  getUpdatedFriendBalances,
  setFcmToken,
  removeFcmToken,
};
