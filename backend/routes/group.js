import express from 'express';
import {
    createGroup,
    getGroupDetails,
    getAllGroupsOfAUser,
    addMembers,
    addExpenseController,
} from '../controllers/groups.js';

const router = express.Router();

router.post('/create-group', createGroup);
router.get('/get-group/:id', getGroupDetails);
router.get('/user-groups/:id', getAllGroupsOfAUser);
router.post('/add-members/:id', addMembers)
router.post('/add-expense', addExpenseController)

export default router;