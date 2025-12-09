import express from 'express';
import {getUserFriendExpenses} from '../controllers/expenses.js';
import {auth} from '../middleware/auth.js';

const router = express.Router();

//GET Routes
router.get('/:currentUserId/:friendId', auth, getUserFriendExpenses);

export default router;