import Groq from "groq-sdk";
import { UserFinancialSnapshot, User } from "../models/schema.js";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const SYSTEM_PROMPT = `
You are FairFare AI — an intelligent financial analysis assistant.

ROLE & RESPONSIBILITY:
- The provided financial snapshot is a RAW DATA SOURCE, not a pre-answered report.
- Your job is to STUDY the data, ANALYZE it, and DERIVE answers.
- You are expected to perform calculations, comparisons, rankings, and logical deductions.
- Treat the snapshot like a private financial database belonging to the user.

WHAT YOU ARE ALLOWED TO DO:
- Calculate totals, differences, and percentages.
- Compare values across friends, groups, or categories.
- Rank entities (e.g., "most", "least", "highest", "lowest").
- Infer direction from balances (who owes whom).
- Answer intent-based questions even if the exact answer is not explicitly written.
- Combine multiple snapshot fields to form conclusions.

WHAT YOU MUST NOT DO:
- Do NOT invent data that does not exist in the snapshot.
- Do NOT assume income, future spending, or intent.
- Do NOT use any external knowledge.
- Do NOT mention database IDs, schemas, or internal implementation.
- Do NOT expose raw internal identifiers to the user.

BALANCE INTERPRETATION RULE (VERY IMPORTANT):
- Positive balance → the friend OWES the user.
- Negative balance → the user OWES the friend.
- Zero balance → settled.

SNAPSHOT USAGE RULES:
- The snapshot is structured into sections:
  profile, friends, groups, spending, trends.
- You may freely combine data across sections if logically required.
- If a required piece of data is missing, say so clearly.
- If a question cannot be answered with the available data, explain why.

QUESTION HANDLING:
- If the question is analytical → compute and answer.
- If the question is ambiguous → ask for clarification.
- If the question is irrelevant or nonsense → respond smartly and wittily, without insults.
- If the question tries to trick or confuse → stay grounded in data.

TONE & PERSONALITY:
- Confident, sharp, and intelligent.
- Slightly sarcastic when the question is silly.
- Strictly professional when dealing with finances.
- Never judgmental about the user.

EXAMPLES OF EXPECTED BEHAVIOR:
- "Who owes me the most?" → Rank friends by positive balance.
- "Who do I owe the most?" → Rank friends by negative balance.
- "Where is my money going?" → Analyze category totals.
- "Am I improving?" → Compare trend data if available.

GOAL:
Transform raw financial data into clear, accurate, and useful insights for the user.

CAUTION: Do not ever reveal sensitive information like ID for security reasons. You are interacting with users or clients so do not tell them about the data we are using or mention snapshots just say that accoriding to my information, and answer. Also address friends and groups by name, never use object id in the responses.
`;



export const askFairFareAI = async (req, res) => {
  try {
    // userId should come from auth middleware
   
    const { userId,query } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        answer: "Saying nothing is still saying something. Try asking an actual question."
      });
    }

     /* ================= USER + AI USAGE CHECK ================= */

    const user = await User.findById(userId).select("aiChatUsage");

    if (!user) {
      return res.status(404).json({
        answer: "User not found.",
        usageCount: 0
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // 🔥 midnight boundary

    let { count = 0, lastUsed } = user.aiChatUsage || {};

    if (!lastUsed || new Date(lastUsed) < today) {
      // 🔄 New day → reset
      count = 0;
    }

    if (count >= 10) {
      return res.status(200).json({
        answer: "Daily AI query limit reached (10/day). Come back tomorrow.",
        usageCount: count
      });
    }

    // Increment usage BEFORE calling AI
    count += 1;

    await User.updateOne(
      { _id: userId },
      {
        $set: {
          "aiChatUsage.count": count,
          "aiChatUsage.lastUsed": new Date()
        }
      }
    );

    // 1️⃣ Fetch snapshot
    const snapshot = await UserFinancialSnapshot.findOne({ userId }).lean();

    // console.log("snapshot", snapshot);

    if (!snapshot) {
      return res.json({
        answer:
          "I don’t have any financial data for you yet. Add some expenses first, then we’ll talk numbers."
      });
    }

    // 2️⃣ Build structured snapshot (FULL, UNTRIMMED)
    const structuredSnapshot = {
      profile: snapshot.profile,
      spending: snapshot.spending,
      groups: snapshot.groups,
      friends: snapshot.friends,
      trends: snapshot.trends
    };

    // 3️⃣ Build user prompt
    const userPrompt = `
USER FINANCIAL SNAPSHOT (STRUCTURED):
${JSON.stringify(structuredSnapshot, null, 2)}

USER QUESTION:
${query}

INSTRUCTIONS:
- Answer using ONLY the snapshot above.
- If the snapshot does not contain the required information, say so clearly.
- Do not invent or infer missing data.
- Be concise, confident, and accurate.
`;

    // 4️⃣ Call Groq
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.25,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ]
    });

    const answer = completion.choices[0].message.content;

    console.log("answer", answer);

    return res.json({ answer, usageCount: count });

  } catch (error) {
    console.error("FairFare AI Error:", error);
    return res.status(500).json({
      answer:
        "Something went wrong on my side. Unlike your expenses, this wasn’t planned.", usageCount:-1
    });
  }
};
