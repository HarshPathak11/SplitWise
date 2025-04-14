import express from 'express';
import {
    createGroup,
    getGroupDetails,
    getAllGroupsOfAUser,
    addMembers,
    addExpenseController,
    getUserTrips,
    getRecentExpenses
} from '../controllers/groups.js';

const router = express.Router();

router.get('/get-group/:id', getGroupDetails);
router.get('/user-groups/:id', getAllGroupsOfAUser);
router.post('/add-members/:id', addMembers)
router.post('/add-expense', addExpenseController)
router.get('/user/:userId/trips', getUserTrips);
router.get('/user/:userId/recent-expenses', getRecentExpenses);

export default router;