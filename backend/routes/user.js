import express from 'express';
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
  userData,
  updateFriendBalance
} from '../controllers/user.js';

const router = express.Router();

// Define routes

//POST routes
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/login', userLogin);
router.post('/forgot-password', forgotPassword);
router.post('/verify-forgot-password', verifyForgotPassword);
router.post('/add-friends', addFriends);
router.post('/remove-friend', removeFriend);
router.post('/update-friend-balance', updateFriendBalance);

//PUT routes
router.put('/user/:id', updateUserProfile);

//GET routes
router.get('/user/:id',userDetails);
router.get('/user', userData);

export default router;