import express from "express";
import {
  createTermDraft,
  publishTerm,
  getActiveTerm,
  getAllTerms,
  checkTermsStatus,
  acceptTerms,
} from "../controllers/terms.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Public route to get active terms
router.get("/active", getActiveTerm);

// User routes (Protected)
router.get("/check-status", auth, checkTermsStatus);
router.post("/accept", auth, acceptTerms);

// Admin routes
// In a real app, you might want an 'admin' middleware check here too.
router.post("/draft", auth, createTermDraft);
router.post("/publish", auth, publishTerm);
router.get("/all", auth, getAllTerms);

export default router;
