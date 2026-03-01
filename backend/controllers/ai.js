import { GoogleGenerativeAI } from "@google/generative-ai";
import { Group } from "../models/schema.js";
import dotenv from "dotenv";
dotenv.config();

// Models ordered by preference: cheapest/fastest first, heavier fallbacks last
const MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-2.0-flash",
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
];

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ---------------------------------------------------------------------------
// Helper: decide whether an error is retryable (next model should be tried)
// ---------------------------------------------------------------------------
function isRetryableError(err) {
  const msg = (err.message || "").toLowerCase();
  const status = err.status || err.httpStatusCode || 0;

  if (status === 429 || msg.includes("429") || msg.includes("too many requests")) return true;
  if (status === 503 || msg.includes("503") || msg.includes("unavailable")) return true;
  if (status === 404 || msg.includes("404") || msg.includes("not found")) return true;
  if (msg.includes("quota") || msg.includes("resource_exhausted") || msg.includes("exhausted")) return true;
  if (msg.includes("rate limit") || msg.includes("rate_limit")) return true;

  return false;
}

// Extract a short human-readable reason from a verbose Google API error
function shortErrorReason(err) {
  const msg = (err.message || "").toLowerCase();
  const status = err.status || err.httpStatusCode || 0;
  if (status === 429 || msg.includes("429") || msg.includes("quota")) return "429 quota";
  if (status === 503 || msg.includes("503")) return "503 unavailable";
  if (status === 404 || msg.includes("404") || msg.includes("not found")) return "404 not found";
  if (msg.includes("rate limit")) return "rate limited";
  return msg.slice(0, 60);
}

// ---------------------------------------------------------------------------
// Build the system prompt. Works for all three contexts.
// ---------------------------------------------------------------------------
function buildSystemPrompt({ context, groupList, memberNames }) {
  // Base instruction (always present)
  let prompt = `You are an AI expense parser for the "FairFare" app.
Your task is to extract expense details from a natural language voice transcript.
Return ONLY a valid JSON object — no markdown, no code fences, no explanation.

Fields to extract:
- "amount" (Number) — the monetary amount. REQUIRED. If you can't find one, set to null.
- "title" (String) — a short, clear description of the expense (e.g. "Dinner", "Uber ride"). REQUIRED.
`;

  // Group-related fields (only when relevant)
  if (context !== "personal") {
    if (groupList && groupList.length > 0) {
      prompt += `
- "groupId" (String|null) — match the mentioned group to this list and return the id. If no group is mentioned or no match, return null.
  Available Groups: ${JSON.stringify(groupList)}
`;
    } else {
      prompt += `- "groupId": null (no groups available)\n`;
    }
  }

  // Detailed group fields (addExpense page)
  if (context === "group_detailed") {
    prompt += `
- "paidBy" (String|null) — who paid. Return "current_user" if the speaker says "I", "me", or "I paid". Otherwise return the person's name as spoken. null if not mentioned.
- "splitMode" (String|null) — "equally" or "unequally". Default null if not mentioned.
- "splitWith" (Array|null) — list of names to split with, or ["ALL"] / ["everyone"] if they say "everyone" / "all". null if not mentioned.
- "splitDetails" (Array|null) — for unequal splits only: [{"name": "...", "amount": ...}]. null if not applicable.
`;
    if (memberNames && memberNames.length > 0) {
      prompt += `  Known group members: ${JSON.stringify(memberNames)}\n`;
    }
  }

  // Output format example based on context
  if (context === "personal") {
    prompt += `
Expected JSON format:
{
  "amount": 500,
  "title": "Groceries"
}`;
  } else if (context === "group_detailed") {
    prompt += `
Expected JSON format:
{
  "amount": 500,
  "title": "Dinner",
  "groupId": "id_or_null",
  "paidBy": "current_user",
  "splitMode": "equally",
  "splitWith": ["ALL"],
  "splitDetails": null
}`;
  } else {
    // group_quick or default
    prompt += `
Expected JSON format:
{
  "amount": 500,
  "title": "Dinner",
  "groupId": "matching_id_or_null"
}`;
  }

  return prompt;
}

// ---------------------------------------------------------------------------
// Main controller: POST /ai/parse-expense
// ---------------------------------------------------------------------------
export const parseExpensePrompt = async (req, res) => {
  try {
    // 1. Normalise input — accept both "prompt" and "text" from frontends
    const prompt = req.body.prompt || req.body.text;
    const userId = req.body.userId || req.user?._id || req.user?.id;
    const context = req.body.context || "group_quick"; // personal | group_quick | group_detailed
    const memberNames = req.body.memberNames || [];

    if (!prompt) {
      return res.status(400).json({ message: "Prompt/text is required" });
    }

    // 2. Fetch user's groups for context (only for group contexts)
    let groupList = [];
    if (context !== "personal" && userId) {
      try {
        const userGroups = await Group.find({ members: userId }).select("name _id");
        groupList = userGroups.map((g) => ({ name: g.name, id: g._id }));
      } catch (dbErr) {
        console.warn("Could not fetch user groups for AI context:", dbErr.message);
        // Non-fatal — continue without group list
      }
    }

    // 3. Build the system prompt
    const systemPrompt = buildSystemPrompt({ context, groupList, memberNames });

    // 4. Try models in order — skip to next on retryable errors
    let lastError = null;

    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([
          systemPrompt,
          `User voice transcript: "${prompt}"`,
        ]);

        const responseText = result.response.text().trim();
        const cleanJson = responseText
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .replace(/^JSON\s*/i, "")
          .trim();

        let parsedData;
        try {
          parsedData = JSON.parse(cleanJson);
        } catch (_jsonErr) {
          // Fallback: regex extraction for malformed JSON
          const amountMatch = cleanJson.match(/"amount"\s*:\s*(\d+(?:\.\d+)?)/);
          const titleMatch = cleanJson.match(/"title"\s*:\s*"([^"]+)"/);
          const groupMatch = cleanJson.match(/"groupId"\s*:\s*"([^"]+)"/);
          const paidByMatch = cleanJson.match(/"paidBy"\s*:\s*"([^"]+)"/);
          const splitModeMatch = cleanJson.match(/"splitMode"\s*:\s*"([^"]+)"/);

          parsedData = {
            amount: amountMatch ? Number(amountMatch[1]) : null,
            title: titleMatch ? titleMatch[1] : "Expense",
            groupId: groupMatch ? groupMatch[1] : null,
          };

          if (context === "group_detailed") {
            parsedData.paidBy = paidByMatch ? paidByMatch[1] : null;
            parsedData.splitMode = splitModeMatch ? splitModeMatch[1] : null;
            parsedData.splitWith = null;
            parsedData.splitDetails = null;
          }
        }

        // Success — send response and return
        console.log(`✅ NLP model used: "${modelName}" for prompt: "${prompt}"`);
        return res.status(200).json(parsedData);
      } catch (modelErr) {
        lastError = modelErr;

        if (isRetryableError(modelErr)) {
          console.warn(`⚡ Skipping "${modelName}" (${shortErrorReason(modelErr)})`);
          continue;
        }
        // Non-retryable error — log full detail and break
        console.error(`Model "${modelName}" failed (non-retryable):`, modelErr.message);
        break;
      }
    }

    // All models exhausted or non-retryable error
    console.error(`All ${MODELS.length} AI models failed. Reason: ${shortErrorReason(lastError)}`);
    return res.status(503).json({
      message: "AI service is temporarily unavailable. Please try again in a moment.",
      error: lastError?.message || "All models exhausted",
    });
  } catch (error) {
    console.error("AI Parsing Error:", error);
    return res.status(500).json({
      message: "Failed to parse expense with AI",
      error: error.message,
    });
  }
};
