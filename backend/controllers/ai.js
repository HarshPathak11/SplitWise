import { GoogleGenerativeAI } from "@google/generative-ai";

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

let currentModelIndex = 0;
let lastResetDate = new Date().toDateString();

const parseResponse = (textResult) => {
  const jsonString = textResult.replace(/```json|```/g, "").trim();
  return JSON.parse(jsonString);
};

export const parseExpense = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Reset to primary model at the start of a new day
    const today = new Date().toDateString();
    if (today !== lastResetDate) {
      currentModelIndex = 0;
      lastResetDate = today;
      console.log("🔄 Daily quota reset: Switching back to primary model.");
    }

    const prompt = `
      Extract expense details from the following text: "${text}".
      Return ONLY a JSON object with the following keys:
      - amount: number (e.g. 500)
      - title: string (short description)
      - paidBy: string (name of person who paid, if mentioned. If "me" or "I", return "current_user")
      - splitWith: array of strings (names of people to split with. If "everyone", "all", or "split equally", return ["ALL"])
      - splitMode: string ("equally" or "unequally"). Default "equally" unless "unequally" or specific amounts are mentioned.
      - splitDetails: array of objects { name: string, amount: number } if specific share amounts are mentioned (e.g. "Alex owes 50").
      - date: string (YYYY-MM-DD format if mentioned)
      
      If amount is not found, return null for amount.
      Do not include markdown formatting or backticks. Just the raw JSON.
    `;

    let textResult;
    let successful = false;

    // Loop through models until one works or all fail
    while (currentModelIndex < MODELS.length) {
      const modelName = MODELS[currentModelIndex];
      try {
        // console.log(`Attempting with model: ${modelName}`); // Debug log
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = result.response;
        textResult = response.text();
        successful = true;
        break; // Success! Exit loop
      } catch (apiError) {

        // Handle quota exhaustion (429) OR server overload (503) OR internal error (500)
        if (
          (apiError.message.includes("429") && apiError.message.includes("quota")) ||
          apiError.message.includes("503") ||
          apiError.message.includes("500")
        ) {
          console.warn(`⚠️ Issue with model ${modelName} (${apiError.message.split(']')[0]}). Switching to next model...`);
          currentModelIndex++; // Move to next model for this and future requests
        } else {
          throw apiError; // Throw other errors (e.g. invalid arg) immediately
        }
      }
    }

    if (!successful) {
      console.error("❌ All AI models exhausted for today.");
      return res.status(429).json({ error: "Daily AI quota exhausted on ALL models. Please try again tomorrow." });
    }

    let parsedData;
    try {
      parsedData = parseResponse(textResult);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Raw:", textResult);
      return res.status(500).json({ error: "Failed to parse AI response" });
    }

    res.status(200).json(parsedData);
  } catch (error) {
    console.error("AI Parse Error:", error);
    res.status(500).json({ error: "Failed to parse expense" });
  }
};
