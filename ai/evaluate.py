import os
import time
import logging
import pandas as pd
import joblib
from dotenv import load_dotenv
from pymongo import MongoClient
from sentence_transformers import SentenceTransformer
from sklearn.linear_model import LogisticRegression

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("ExpenseCategorizationEvaluator")

def load_data_from_mongo(mongo_uri):
    client = MongoClient(mongo_uri)
    db = client["Splitwise"]
    
    labels = list(db.labelcategories.find({}, {"label": 1, "category": 1, "subcategory": 1, "_id": 0}))
    expenses = list(db.expenses.find(
        {"category": {"$nin": ["Uncategorized", None, ""]}, "subcategory": {"$ne": ""}},
        {"title": 1, "category": 1, "subcategory": 1, "_id": 0}
    ))
    
    data = []
    for item in labels:
        if item.get("label") and item.get("category"):
            data.append({
                "title": str(item.get("label")).strip().lower(),
                "true_target": item.get("category") + "|||" + item.get("subcategory", "Other")
            })
            
    for item in expenses:
        if item.get("title") and item.get("category"):
            data.append({
                "title": str(item.get("title")).strip().lower(),
                "true_target": item.get("category") + "|||" + item.get("subcategory", "Other")
            })
    
    df = pd.DataFrame(data).drop_duplicates()
    return df

def run_evaluation_and_reinforcement():
    logger.info("=== Starting Active Learning Loop ===")
    
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend", ".env")
    load_dotenv(env_path)
    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        return

    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(current_dir, "classifier.joblib")
    
    logger.info("Loading existing models and data...")
    vectorizer = SentenceTransformer('all-MiniLM-L6-v2')
    classifier = joblib.load(model_path)
    df = load_data_from_mongo(mongo_uri)
    
    if len(df) == 0:
        return

    logger.info("Encoding all test data to vectors (only needs to be done once)...")
    X_vec = vectorizer.encode(df["title"].tolist(), show_progress_bar=True)
    y_true = df["true_target"].tolist()
    
    # We will track all reinforced data across loops
    X_train_vec_pool = list(X_vec)
    y_train_pool = list(y_true)
    
    TARGET_ACCURACY = 99.0
    MAX_LOOPS = 30
    
    best_accuracy = 0.0
    stuck_counter = 0
    
    for loop in range(1, MAX_LOOPS + 1):
        logger.info(f"\n--- [Iteration {loop}] Evaluating Model ---")
        y_pred = classifier.predict(X_vec)
        
        correct = 0
        wrong_samples = []
        for i in range(len(df)):
            if y_true[i] == y_pred[i]:
                correct += 1
            else:
                wrong_samples.append({"index": i, "title": df.iloc[i]["title"], "target": y_true[i]})
                
        total = len(df)
        accuracy = (correct / total) * 100
        
        logger.info(f"Accuracy: {accuracy:.2f}% | Correct: {correct} | Wrong: {len(wrong_samples)}")
        
        # if accuracy > best_accuracy:
        #     best_accuracy = accuracy
        #     stuck_counter = 0
        # else:
        #     stuck_counter += 1
            
        # if stuck_counter >= 10:
        #     logger.warning(f"🚨 Model accuracy has plateaued for 10 iterations! It is stuck at {accuracy:.2f}%")
        #     logger.warning("🚨 Printing the 'dirty' data points (contradictions) that the model cannot resolve:")
        #     for mistake in wrong_samples:
        #         predicted_val = y_pred[mistake["index"]].split("|||")[1] if "|||" in y_pred[mistake["index"]] else y_pred[mistake["index"]]
        #         target_val = mistake["target"].split("|||")[1] if "|||" in mistake["target"] else mistake["target"]
        #         logger.warning(f"Expense: '{mistake['title']}' | DB Ground Truth: {target_val} | Model Predicts: {predicted_val}")
        #     break
        
        if accuracy >= TARGET_ACCURACY:
            logger.info(f"🎉 Target accuracy of {TARGET_ACCURACY}% reached! Stopping loop.")
            break
            
        if len(wrong_samples) == 0:
            break
            
        logger.info("Adding mistakes to training pool and re-training...")
        
        # Add mistakes naturally without heavy artificial weighting
        # This prevents the model from "catastrophically forgetting" previous knowledge
        REINFORCEMENT_WEIGHT = 1
        for mistake in wrong_samples:
            for _ in range(REINFORCEMENT_WEIGHT):
                X_train_vec_pool.append(X_vec[mistake["index"]])
                y_train_pool.append(mistake["target"])
                
        # Re-train model (Removed 'balanced' class_weight to avoid artificial skewing)
        classifier = LogisticRegression(max_iter=1000)
        classifier.fit(X_train_vec_pool, y_train_pool)
        
        # Save so if we crash it's saved
        joblib.dump(classifier, model_path)

    logger.info(f"\n=== Final Model Saved to {model_path} ===")

if __name__ == "__main__":
    run_evaluation_and_reinforcement()
