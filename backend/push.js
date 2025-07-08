// server/push.js
import express from 'express';
import webpush from 'web-push';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

webpush.setVapidDetails(
  'mailto:your@email.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Ideally store this in a database
let subscriptions = [];

// Route to receive subscription from frontend
router.post('/subscribe', (req, res) => {
    console.log('Received subscription:', req.body);
    
  const subscription = req.body;
  subscriptions.push(subscription); // Store per user ideally
  res.status(201).json({});
});

// Route to trigger push notifications to all subscribers
router.post('/notify', async (req, res) => {
  const payload = JSON.stringify({
    title: 'FairFare Reminder!',
    body: 'You have a pending payment to settle!',
    url: 'https://fair-fare-phi.vercel.app',
  });

  for (let sub of subscriptions) {
    try {
      await webpush.sendNotification(sub, payload);
    } catch (err) {
      console.error('Push error:', err);
    }
  }

  res.sendStatus(200);
});

export default router;
