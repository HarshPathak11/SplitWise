import { Expense, LabelCategory } from "../models/schema.js";

const EXPIRY_MONTHS = 6; // expire cache after 6 months

// ---- In-memory queue ----
const queue = [];
let isProcessing = false;

// Add job to queue
function enqueue(expenseId, label) {
  queue.push({ expenseId, label });
  processQueue();
}

// Process queue sequentially
async function processQueue() {
  if (isProcessing) return;
  isProcessing = true;

  while (queue.length > 0) {
    const { expenseId, label } = queue.shift();

    try {
      console.log(`\n-----------------------------------------`);
      console.log(`[Queue: ${queue.length + 1} remaining] Categorizing: "${label}"`);

      const normalized = label.trim().toLowerCase();

      // 1. Check if already cached in DB
      console.log(`[Step 1] Checking cache for "${normalized}"...`);
      const cached = await LabelCategory.findOne({ label: normalized });
      
      if (cached) {
        const ageMonths = cached.updatedAt
          ? (Date.now() - cached.updatedAt.getTime()) /
            (1000 * 60 * 60 * 24 * 30)
          : Infinity;

        if (ageMonths < EXPIRY_MONTHS) {
          // still valid
          await Expense.findByIdAndUpdate(expenseId, {
            category: cached.category,
            subcategory: cached.subcategory,
          });

          console.log(`[Cache Hit] ✔ Found cached category: ${cached.category} -> ${cached.subcategory}`);
          continue; // Skip the ML call
        } else {
            console.log(`[Cache Miss] Cache expired (Age: ${ageMonths.toFixed(1)} months). Calling Local ML Model...`);
        }
      } else {
         console.log(`[Cache Miss] No cache found. Calling Local ML Model...`);
      }

      // 2. Call Local ML API
      const result = await categorizeExpenseWithLocalML(expenseId, label);

      if (!result) {
        console.log(`[Error] 🛑 Local ML API failed. Pausing queue for 5 seconds.`);
        queue.unshift({ expenseId, label }); // Put back in front
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }

      console.log(`[Step 3] Updating Expense Document ID: ${expenseId}`);
      await Expense.findByIdAndUpdate(expenseId, {
        category: result.category,
        subcategory: result.subcategory,
      });

      // 3. Update or insert cache (upsert)
      console.log(`[Step 4] Updating Cache (LabelCategory)...`);
      await LabelCategory.findOneAndUpdate(
        { label: normalized },
        { category: result.category, subcategory: result.subcategory }, // will auto-update updatedAt
        { upsert: true, new: true }
      );

      console.log(
        `[Success] ✔ Categorized: "${label}" → ${result.category} / ${result.subcategory}`
      );
    } catch (err) {
      console.error("[Error] Worker error:", err.message);
    }

    // Small delay to avoid hammering the local API too fast (e.g. 50ms)
    await new Promise((r) => setTimeout(r, 50));
  }

  console.log(`\n[Queue Empty] All expenses categorized.`);
  isProcessing = false;
}

// ---- Local ML API call ----
async function categorizeExpenseWithLocalML(expenseId, label) {
  try {
    console.log(`[Step 2] 📡 Sending request to http://localhost:5000/categorize...`);
    const response = await fetch("http://localhost:5000/categorize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: label })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API responded with status: ${response.status} - ${errText}`);
    }

    const result = await response.json();
    console.log(`[API Response] Received:`, result);

    return {
      category: result.category || "Uncategorized",
      subcategory: result.subcategory || "Other",
    };
  } catch (err) {
    console.error(`[API Error] Failed to reach local ML model:`, err.message);
    return null;
  }
}

export { enqueue, queue, isProcessing };
