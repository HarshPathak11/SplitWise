import express from "express";
import { parseExpense } from "../controllers/ai.js";

const router = express.Router();

router.post("/parse-expense", parseExpense);

export default router;
