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
    getExpenseController,
    getTopCategoriesForGroupExpense,
    getSubCategoriesForGroup,
    getAllExpensesForASubcategoryInGroup,
    getGroupExpenses
} from '../controllers/groups.js';
import {auth} from '../middleware/auth.js';
const router = express.Router();

//GET requests
router.get('/get-group/:id', auth, getGroupDetails);
router.get("/:id/expenses",auth, getGroupExpenses);
router.get('/user-groups/:id',auth, getAllGroupsOfAUser);
router.get('/user/:userId/trips',auth, getUserTrips);
router.get('/user/:userId/recent-expenses',auth, getRecentExpenses);
router.get("/expense/:expenseId",auth, getExpenseController);
router.get("/:groupId/top-categories",auth, getTopCategoriesForGroupExpense);

//POST requests
router.post('/add-members/:id', auth,addMembers);
router.post('/remove-members/:id',auth, removeMembers);
router.post('/add-expense',auth, addExpenseController);
router.post('/create-group',auth, createGroup);
router.post("/del-add-expense",auth, addafterDeleteExpenseController);
router.post("/sub-categories",auth, getSubCategoriesForGroup);
router.post("/expenses-by-subcategory",auth, getAllExpensesForASubcategoryInGroup);

// DELETE requests
router.delete("/del-expense/:expenseId",auth, deleteExpenseController);


export default router;