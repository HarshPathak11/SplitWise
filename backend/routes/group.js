import express from 'express';
import {
    createGroup,
    getGroupDetails,
    getAllGroupsOfAUser,
    addMembers,
    addExpenseController,
    getUserTrips,
    getRecentExpenses,
    removeMembers,
} from '../controllers/groups.js';

const router = express.Router();

//GET requests
router.get('/get-group/:id', getGroupDetails);
router.get('/user-groups/:id', getAllGroupsOfAUser);
router.get('/user/:userId/trips', getUserTrips);
router.get('/user/:userId/recent-expenses', getRecentExpenses);

//POST requests
router.post('/add-members/:id', addMembers);
router.post('/remove-members/:id', removeMembers);
router.post('/add-expense', addExpenseController);
router.post('/create-group', createGroup);

export default router;