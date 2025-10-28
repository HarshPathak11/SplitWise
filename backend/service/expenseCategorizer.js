import {Expense} from "../models/schema.js";
import { enqueue } from "./categorizerWorker.js";

// Process old expenses in batches (stream cursor)
async function processExistingExpenses() {
  console.log("Scanning for uncategorized expenses...");

  const cursor = Expense.find({
    $or: [{ category: null }, { subcategory: null }],
  }).cursor();

  for (let expense = await cursor.next(); expense != null; expense = await cursor.next()) {
    enqueue(expense._id, expense.title);
  }

  console.log("✅ Existing expenses enqueued");
}

// Watch for new inserts
function startExpenseStream() {
  console.log("Change Stream started...");

  const changeStream = Expense.watch();

  changeStream.on("change", (change) => {
    console.log("change", change);
    if (change.operationType === "insert") {
      const doc = change.fullDocument;

      if (!doc.category || !doc.subcategory) {
        enqueue(doc._id, doc.title);
      }
    }
  });

  changeStream.on("error", (err) => {
    console.error("Change stream error:", err);
  });
}

// Init categorizer
async function initExpenseCategorizer() {
  console.log("inside initExpenseCategorizer");
  const exists = await Expense.exists({
    $or: [{ category: null }, { subcategory: null }],
  });
  console.log("exists", exists);

  if (exists) {
    console.log("Processing existing expenses...");
    await processExistingExpenses();
  }
  console.log("Starting expense stream...");
  startExpenseStream();
}

export { initExpenseCategorizer };
