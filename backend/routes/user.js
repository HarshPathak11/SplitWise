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
  getUsernames,
  sendFriendRequest,
  listFriendRequests,
  respondToFriendRequest,
  getTopCategoriesForUser,
  getAllExpensesForUser,
  getSubCategoriesForUser,
  getAllExpensesForASubcategory,
  removeFcmToken,
  notifyFriend,
  uploadProfilePhoto,
  getUserLastUpdatedAt,
} from "../controllers/user.js";
import upload from "../middleware/multer.js";
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
router.post("/friend-requests/send", sendFriendRequest);
router.post("/friend-requests/respond", respondToFriendRequest);
router.post("/update-friend-balance", updateFriendBalance);
router.post("/change-password", changePassword);
router.post("/get-updated-friend-balances", getUpdatedFriendBalances);
router.post("/set-fcm-token", setFcmToken);
router.post('/remove-fcm-token', removeFcmToken);
router.post("/all-expenses", getAllExpensesForUser);
router.post("/top-categories", getTopCategoriesForUser);
router.post("/subcategories", getSubCategoriesForUser);
router.post("/expenses-by-subcategory", getAllExpensesForASubcategory);
router.post("/notify", notifyFriend);

//PUT routes
router.put("/:id", updateUserProfile);
router.put('/:id/photo',  upload.single('profilePhoto'),uploadProfilePhoto);

//GET routes
router.get('/search', getUsernames);
router.get("/friend-requests/:userId", listFriendRequests);
router.get("/last-updated-at/:id", getUserLastUpdatedAt);
router.get("/:id", userDetails);

//DELETE routes
router.delete("/remove-friend", removeFriend);

export default router;
