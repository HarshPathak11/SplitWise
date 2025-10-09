import express from 'express';
import {getUserFriendExpenses} from '../controllers/expenses.js';

const router = express.Router();

//GET Routes
router.get('/:currentUserId/:friendId', getUserFriendExpenses);

export default router;