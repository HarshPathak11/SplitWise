import { User } from "../models/schema.js";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

// Send OTP to email
const sendOtp = async (req, res) => {
  const { email, username } = req.body;

  if (!email || !username)
    return res.status(400).json({ message: "Incomplete data received" });

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(410).json({ message: "Email already taken" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);
  console.log("otp sent ", otp);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SENDING_EMAIL,
      pass: process.env.SENDING_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Fair Fare" <${process.env.SENDING_EMAIL}>`,
    to: email,
    subject: `Welcome Onboard ${username}`,
    html: `<h1>Hi ${username},</h1><p>Your OTP for signup is: <h2><strong>${otp}</strong></h2></p><p>This code is valid for 5 minutes.</p><p>Thanks, Fair Fare Team</p>`,
  };

  try {
    const hashedOtp = await bcrypt.hash(otp.toString(), 10);

    await transporter.sendMail(mailOptions);

    return res
      .status(200)
      .json({ message: "OTP sent to email", otp: hashedOtp });
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    return res.status(500).json({ message: "Failed to send OTP email" });
  }
};

// Verify OTP and create user
const verifyOtp = async (req, res) => {
  const { otp, username, email, password, otpGenerated } = req.body;

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

    return res.status(200).json(newUser);
  } catch (error) {
    console.error("Error during user creation:", error);
    return res.status(500).json({ message: "Server error while creating user" });
  }
};

// User login
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Incomplete data received" });
    }

    // Find user and explicitly select the password field
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Debug logs
    // console.log("=== Login Debug Information ===");
    // console.log("Email:", email);
    // console.log("Input password type:", typeof password);
    // console.log("Stored password type:", typeof user.password);

    // Clean the input password
    const cleanPassword = String(password).trim();
    // console.log("Cleaned input password:", cleanPassword);

    // Use the schema's comparePassword method
    const isPasswordValid = await user.comparePassword(cleanPassword);
    // console.log("Password comparison result:", isPasswordValid);

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

    const user = await User.findById(userId).populate({
      path: "friends.friend",
      select: "username email", // optional: select only needed fields
    });
    console.log(user.friends) // exclude sensitive fields
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user: user });
  } catch (err) {
    console.error("Error fetching user details:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Function to update user profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const { username, email, mobile, upiId, dob, currency } = req.body;

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
  const { email, friendsArray } = req.body;

  if (!email || !Array.isArray(friendsArray) || friendsArray.length === 0) {
    return res.status(400).json({ message: "Incomplete data received" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log("friends array received ", friendsArray);

    const addedFriends = [];
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SENDING_EMAIL,
        pass: process.env.SENDING_PASSWORD,
      },
    });

    for (const friendEmail of friendsArray) {
      // Skip adding self
      if (friendEmail === email) continue;

      const friend = await User.findOne({ email: friendEmail });
      console.log("friend ", friend);

      if (friend) {
        // Check if friend is already added using ObjectId comparison.
        if (!user.friends.some((fId) => fId.equals(friend._id))) {
          user.friends.push(friend._id);
        }
        if (!friend.friends.some((fId) => fId.equals(user._id))) {
          friend.friends.push(user._id);
          await friend.save();
        }
        // For reporting purposes you can push details of the added friend.
        addedFriends.push({ _id: friend._id, email: friend.email, username: friend.username });
      } else {
        // Friend does not exist — send invitation email.
        const mailOptions = {
          from: `"Fair Fare" <${process.env.SENDING_EMAIL}>`,
          to: friendEmail,
          subject: `Heartfelt invitation from ${user.username}`,
          html: `<h1>Hi,</h1>
                 <p>Your friend <strong>${user.username}</strong> has added you as a friend on the Fair Fare App.</p>
                 <p>Please click on the link below to join: 
                 <a href="http://192.168.1.5:5173/${user._id}">Join Fair Fare</a></p>
                 <p>Thanks,<br/>Fair Fare Team</p>`,
        };
        await transporter.sendMail(mailOptions)
          .then(() => {
            console.log("Email sent to new friend ", friendEmail);
          });
      }
    }

    await user.save();
    console.log("new friends added ", addedFriends);

    return res.status(200).json({
      message: "Friends processed",
      addedFriends,
    });
  } catch (error) {
    console.error("Error in addFriends:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const removeFriend = async (req, res) => {
  const userId = req.user._id;
  const { friendId } = req.body;

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
}

//Fetching user details
const userData = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "incomplete data" });

  const user = await User.findOne({ email: email }, "--password");
  if (!user) {
    return res.status(500).json({ message: "user not found" });
  }
  return res.status(200).json({ user });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "incomplete data" });
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(500).json({ message: "user not found" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);
  console.log("otp sent ", otp);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SENDING_EMAIL,
      pass: process.env.SENDING_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Fair Fare" <${process.env.SENDING_EMAIL}>`,
    to: email,
    subject: `Account recovery initiated`,
    html: `<h1>Hi user,</h1><p>Your OTP for account recovery is: <h2><strong>${otp}</strong></h2></p><p>This code is valid for 5 minutes.</p><p>Thanks, Fair Fare Team</p>`,
  };

  try {
    const hashedOtp = await bcrypt.hash(otp.toString(), 10);

    await transporter.sendMail(mailOptions);

    return res
      .status(200)
      .json({ message: "OTP sent to email", otp: hashedOtp });
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    return res.status(500).json({ message: "Failed to send OTP email" });
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
  userData,
};
