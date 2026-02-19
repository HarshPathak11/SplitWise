import express from 'express';
import {
    getUserFriendExpenses,
    createPersonalExpense,
    getPersonalExpenses,
    deletePersonalExpense
} from '../controllers/expenses.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Personal Expense Routes
router.post('/personal', auth, createPersonalExpense);
router.get('/personal', auth, getPersonalExpenses);
router.delete('/personal/:id', auth, deletePersonalExpense);

// Friend Expense Routes
router.get('/:currentUserId/:friendId', auth, getUserFriendExpenses);

export default router;