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
    addafterDeleteExpenseController,
    deleteExpenseController,
    getExpenseController
} from '../controllers/groups.js';

const router = express.Router();

//GET requests
router.get('/get-group/:id', getGroupDetails);
router.get('/user-groups/:id', getAllGroupsOfAUser);
router.get('/user/:userId/trips', getUserTrips);
router.get('/user/:userId/recent-expenses', getRecentExpenses);
router.get("/expense/:expenseId", getExpenseController);

//POST requests
router.post('/add-members/:id', addMembers);
router.post('/remove-members/:id', removeMembers);
router.post('/add-expense', addExpenseController);
router.post('/create-group', createGroup);
router.post("/del-add-expense", addafterDeleteExpenseController);

// DELETE requests
router.delete("/del-expense/:expenseId", deleteExpenseController);


export default router;