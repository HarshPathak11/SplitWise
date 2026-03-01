import express from "express";
import {
    getDashboardStats,
    getUserGrowthStats,
    getActivityStats,
    getFinancialStats,
    getAiUsageStats
} from "../controllers/admin.js";

// Note: Ensure you add authentication/authorization middleware here (e.g., verifyAdmin)
// if you have an admin specific middleware. For now, assuming standard auth or open for dev as per user text.
// Ideally: router.get('/dashboard', auth, verifyAdmin, getDashboardStats);

const router = express.Router();

// Define routes for Admin Portal
router.get("/dashboard-stats", getDashboardStats);
router.get("/user-growth", getUserGrowthStats);
router.get("/activity-stats", getActivityStats);
router.get("/financial-stats", getFinancialStats);
router.get("/ai-stats", getAiUsageStats);

export default router;
