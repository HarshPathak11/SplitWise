import { GoogleGenerativeAI } from "@google/generative-ai";
import { Group } from "../models/schema.js";
import dotenv from "dotenv";
dotenv.config();

const MODELS = [
  "gemini-2.0-flash-lite", // Primary: Fastest & Cheapest
  "gemini-2.0-flash-lite-001", // Versioned Lite
  "gemini-2.5-flash-lite", // Newer Lite
  "gemini-flash-lite-latest", // Generic Lite alias
  "gemini-2.0-flash",      // Standard Flash (2.0)
  "gemini-2.5-flash",      // Standard Flash (2.5)
  "gemini-flash-latest",   // Generic Flash alias
  "gemini-1.5-flash",      // Fallback Flash (1.5)
  "gemini-1.5-flash-latest", // Fallback Flash (1.5 latest)
];

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const parseExpensePrompt = async (req, res) => {
    try {
        const { prompt, userId } = req.body;

        if (!prompt || !userId) {
            return res.status(400).json({ message: "Prompt and User ID are required" });
        }

        // 1. Fetch user's groups for context
        const userGroups = await Group.find({ members: userId }).select("name _id");
        const groupList = userGroups.map(g => ({ name: g.name, id: g._id }));

        // 2. Prepare Gemini Prompt
        const systemPrompt = `
      You are an AI expense parser for the "FairFare" app. 
      Your task is to extract expense details from a natural language string.
      
      Available Groups for this user:
      ${JSON.stringify(groupList)}

      Rules:
      - Extract the 'amount' (Number).
      - Extract a short, clear 'title' (String).
      - Identify the 'groupId' by matching the mentioned group in the prompt to the list provided. 
      - If no group is mentioned or if it doesn't match well, return groupId as null.
      - Return ONLY a valid JSON object.

      Expected Format:
      {
        "amount": 500,
        "title": "Dinner",
        "groupId": "matching_id_here_or_null"
      }
    `;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent([
            systemPrompt,
            `User Prompt: "${prompt}"`
        ]);

        const responseText = result.response.text().trim();
        const cleanJson = responseText.replace(/```json|```/g, "").replace(/JSON/g, "").trim();

        let parsedData;
        try {
            parsedData = JSON.parse(cleanJson);
        } catch (e) {
            // Fallback parsing if JSON is slightly malformed
            const amountMatch = cleanJson.match(/"amount":\s*(\d+)/);
            const titleMatch = cleanJson.match(/"title":\s*"([^"]+)"/);
            const groupMatch = cleanJson.match(/"groupId":\s*"([^"]+)"/);

            parsedData = {
                amount: amountMatch ? Number(amountMatch[1]) : null,
                title: titleMatch ? titleMatch[1] : "Expense",
                groupId: groupMatch ? groupMatch[1] : null
            };
        }

        res.status(200).json(parsedData);
    } catch (error) {
        console.error("AI Parsing Error:", error);

        // Fallback attempt with a different model if 404 occurs
        if ((error.message.includes("404") || error.message.includes("not found")) && !req._isRetry) {
            console.log("Retrying with gemini-pro...");
            req._isRetry = true;
            req.body.modelOverride = "gemini-2.5-pro";
            // Recursively call with a flag to prevent infinite loops
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
                const result = await model.generateContent([
                    "Extract amount (Number), title (String), and groupId from this prompt. Return ONLY JSON.",
                    `Prompt: ${req.body.prompt}`
                ]);
                const text = result.response.text();
                res.status(200).json(JSON.parse(text.replace(/```json|```/g, "")));
                return;
            } catch (retryError) {
                console.error("Retry failed:", retryError);
            }
        }

        res.status(500).json({ message: "Failed to parse expense with AI", error: error.message });
    }
};
