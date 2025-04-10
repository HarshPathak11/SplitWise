import { User } from "../models/schema.js";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import { db } from "../db/mysqlDB.js";
import bcrypt from "bcrypt";

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
      user: "splitwise666@gmail.com",
      pass: "gtqn wjdh ztkf vfkf",
    },
  });

  const mailOptions = {
    from: '"Fair Fare" <splitwise666@gmail.com>',
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
    // Clean the password but don't hash it (schema middleware will handle hashing)
    const cleanPassword = String(password).trim();
    console.log("Password before saving:", cleanPassword);

    const alterQuery = `ALTER TABLE user_matrix ADD COLUMN \`${email}\` DECIMAL(10, 2) DEFAULT 0;`;
    db.query(alterQuery, (err) => {
      if (err) {
        console.error("Error altering table:", err);
        return res
          .status(500)
          .json({ error: "Failed to add column in matrix" });
      }

      const insertQuery = `INSERT INTO user_matrix (user_name) VALUES (?);`;
      db.query(insertQuery, [email], (err) => {
        if (err) {
          console.error("Error inserting into table:", err);
          return res.status(500).json({ error: "Failed to add row in matrix" });
        }
      });
    });

    const newUser = await User.create({
      username,
      email,
      password: cleanPassword, // Schema middleware will hash this
    });

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

    const user = await User.findById(userId); // exclude sensitive fields

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
      email,
      mobile,
      upiId,
      dob,
      currency,
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

const addEvent = async (req, res) => {
  const { email, eventName, eventDesc, amt, paidBy, paidFor } = req.body;
  if (!email || !eventName || !amt || !paidBy || !paidFor) {
    return res.status(400).json({ message: "Not complete data received" });
  }
  const expenseDetails = [
    {
      _id: new mongoose.Types.ObjectId(),
      description: eventDesc,
      amount: amt,
      paidBy: paidBy,
      owedBy: paidFor,
    },
  ];
  const groupId = new mongoose.Types.ObjectId();
  const user = await User.findOneAndUpdate(
    {
      email,
    },
    {
      $push: {
        groups: {
          _id: groupId,
          name: eventName,
          expenses: expenseDetails,
        },
      },
    },
    {
      new: true,
    }
  );
  if (!user) return res.status(500).json({ message: "User not found" });
  return res.status(200).json({ user });
};

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
    console.log("friends array recieved ", friendsArray);

    const addedFriends = [];
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "splitwise666@gmail.com",
        pass: "gtqn wjdh ztkf vfkf",
      },
    });

    for (const friendEmail of friendsArray) {
      if (friendEmail === email) continue; // skip self

      const friend = await User.findOne({ email: friendEmail });

      if (friend) {
        if (user.friends.some((f) => f.email === email)) continue;
        // If not already friends, add both ways
        if (!user.friends.some((f) => f.email === friendEmail)) {
          user.friends.push({
            email: friendEmail,
            name: friend.username || friend.email,
          });
        }
        if (!friend.friends.some((f) => f.email === email)) {
          friend.friends.push({
            email: email,
            name: user.username || user.email,
          });
          await friend.save();
        }
        addedFriends.push({
          email: friendEmail,
          name: friend.username || friend.email,
        });
      } else {
        // Friend does not exist — send email (placeholder) 
        const mailOptions = {
          from: '"Fair Fare" <splitwise666@gmail.com>',
          to: friendEmail,
          subject: `Heartfelt invitation from ${user.username}`,
          html: `<h1>Hi user,</h1><p>Your friend <strong>${
            user.username
          }</strong> has added you as a friend on the Fare Fare App</p><p>Please click on the link below to see what happens next ${`http://192.168.1.5:5173/${user._id}`}</p><p>Thanks, Fair Fare Team</p>`,
        };
        await transporter
          .sendMail(mailOptions)
          .then(() => {
            console.log("Email sent to new friend ", friendEmail);
          })
          .finally(() => {
            // addedFriends.push({ email: friendEmail, name: friendEmail });
            // user.friends.push({ email: friendEmail, name: friendEmail });
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

const addPay = async (req, res) => {
  const { payBy, payFor, amt } = req.body;
  if (!payBy || !payFor || !amt)
    return res.status(400).json({ message: "Incomplete information" });
  const share = amt / (payFor.length + 1).toFixed(2);
  console.log(share, payBy, payFor);

  for (let i = 0; i < payFor.length; ++i) {
    const x = payFor[i];
    console.log(x);
    const query = `UPDATE user_matrix SET \`${x}\` = \`${x}\` + ${share} WHERE user_name = '${payBy}';`;
    db.query(query, (err, result) => {
      if (err) {
        console.error("Error inserting into table:", err);
        return res.status(500).json({ error: "Failed to add row in matrix" });
      }
    });
  }
  return res.status(200).json({ message: "Entries added successfully" });
};

const resolvePay = async (req, res) => {
  const { payBy, payFor, amt } = req.body;
  if (!payBy || !payFor || !amt)
    return res.status(400).json({ message: "Information is incomplete" });
  const x = payFor;
  const share = x;
  const query = `UPDATE user_matrix SET \`${x}\` = \`${x}\` + ${share} WHERE user_name = '${payBy}';`;
  db.query(query, (err, result) => {
    if (err) {
      console.error("Error inserting into table:", err);
      return res.status(500).json({ error: "Failed to add row in matrix" });
    }
  });
  return res.status(200).json({ message: "Payment added!!" });
};

const fetchUserMatrixData = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // First, fetch the entire row where the user_name is the entered email
    const rowQuery = `SELECT * FROM user_matrix WHERE user_name = ?`;

    db.query(rowQuery, [email], (err, rowResult) => {
      if (err) {
        console.error("Error fetching row:", err);
        return res.status(500).json({ error: "Failed to fetch row" });
      }

      if (rowResult.length === 0) {
        return res.status(404).json({ message: "User not found in matrix" });
      }

      // Now, fetch all values from the column corresponding to the email (dynamic column name)
      const columnQuery = `SELECT user_name, \`${email}\` FROM user_matrix`;

      db.query(columnQuery, (err, columnResult) => {
        if (err) {
          console.error("Error fetching column:", err);
          return res.status(500).json({ error: "Failed to fetch column" });
        }

        // Return both row and column data
        return res.status(200).json({
          row: rowResult[0], // The entire row corresponding to the entered email
          column: columnResult, // The entire column corresponding to the entered email
        });
      });
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

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
      user: "splitwise666@gmail.com",
      pass: "gtqn wjdh ztkf vfkf",
    },
  });

  const mailOptions = {
    from: '"Fair Fare" <splitwise666@gmail.com>',
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
  addEvent,
  addFriends,
  verifyForgotPassword,
  forgotPassword,
  addPay,
  updateUserProfile,
  verifyOtp,
  userDetails,
  fetchUserMatrixData,
  userData,
};
