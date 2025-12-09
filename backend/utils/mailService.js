// mailClient.js
import axios from "axios";

const MAIL_SERVICE_URL = process.env.MAIL_SERVICE_URL; // e.g. https://fairfare-mailer.vercel.app/api/send-mail
const MAIL_SERVICE_PASSWORD = process.env.MAIL_SERVICE_PASSWORD; // same as in Next

// Generic reusable mail function
export async function sendMail({ to, subject, html, text }) {
  if (!MAIL_SERVICE_URL || !MAIL_SERVICE_PASSWORD) {
    console.error(
      "Mail service env vars missing: MAIL_SERVICE_URL or MAIL_SERVICE_PASSWORD"
    );
    return;
  }

  if (!to || !subject || (!html && !text)) {
    console.error("sendMail called with missing fields");
    return;
  }

  try {
    await axios.post(
      MAIL_SERVICE_URL,
      { to, subject, html, text },
      {
        headers: {
          "x-mail-password": MAIL_SERVICE_PASSWORD,
        },
        timeout: 10_000,
      }
    );
  } catch (err) {
    console.error(
      "Error calling mail service:",
      err.response?.data || err.message
    );
    // intentionally swallow error so main flow doesn't break
  }
}
