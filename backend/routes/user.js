import express from "express";
import {
  sendOtp,
  verifyOtp,
  userDetails,
  userLogin,
  addFriends,
  updateUserProfile,
  removeFriend,
  forgotPassword,
  verifyForgotPassword,
  updateFriendBalance,
  getUpdatedFriendBalances,
  changePassword,
  setFcmToken,
  // friend requests
  sendFriendRequest,
  listFriendRequests,
  respondToFriendRequest,
  getFriendRequestsCount,
} from "../controllers/user.js";

const router = express.Router();

// Define routes

//POST routes
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/login", userLogin);
router.post("/forgot-password", forgotPassword);
router.post("/verify-forgot-password", verifyForgotPassword);
router.post("/add-friends", addFriends);
router.post("/remove-friend", removeFriend);

// Friend request routes (added below after importing)
router.post("/friend-requests/send", sendFriendRequest);
router.get("/friend-requests/:userId", listFriendRequests);
router.post("/friend-requests/respond", respondToFriendRequest);
router.get("/friend-requests-count/:userId", getFriendRequestsCount);
router.post("/update-friend-balance", updateFriendBalance);
router.post("/change-password", changePassword);
router.post("/get-updated-friend-balances", getUpdatedFriendBalances);
router.post("/set-fcm-token", setFcmToken);

//PUT routes
router.put("/:id", updateUserProfile);

//GET routes
router.get("/:id", userDetails);

//DELETE routes
router.delete("/remove-friend", removeFriend);

export default router;
