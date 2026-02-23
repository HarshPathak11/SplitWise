import express from "express";
import { parseExpensePrompt } from "../controllers/ai.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/parse-expense", auth, parseExpensePrompt);

export default router;
