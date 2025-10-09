
import express from 'express';
import { sendPromotionalNotification } from '../controllers/promo.js';
const router = express.Router();

// Route to send promotional notifications to a user
router.post('/send-promo-notification', sendPromotionalNotification);

export default router;
