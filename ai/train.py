import os
import time
import logging
import pandas as pd
import joblib
from dotenv import load_dotenv
from pymongo import MongoClient
from sentence_transformers import SentenceTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

# Configure extensive logging as requested
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("ExpenseCategorizationTrainer")

def load_data_from_mongo(mongo_uri):
    logger.info("Connecting to MongoDB to extract training data...")
    client = MongoClient(mongo_uri)
    db = client["Splitwise"]
    
    # Fetch from LabelCategory (cached high-quality labels)
    logger.info("Fetching data from 'labelcategories' collection...")
    labels = list(db.labelcategories.find({}, {"label": 1, "category": 1, "subcategory": 1, "_id": 0}))
    
    # Fetch from Expenses (user specific data)
    logger.info("Fetching categorized data from 'expenses' collection...")
    expenses = list(db.expenses.find(
        {"category": {"$nin": ["Uncategorized", None, ""]}, "subcategory": {"$ne": ""}},
        {"title": 1, "category": 1, "subcategory": 1, "_id": 0}
    ))
    
    logger.info(f"Retrieved {len(labels)} label templates and {len(expenses)} raw expenses.")
    
    # Combine datasets
    data = []
    for item in labels:
        if item.get("label") and item.get("category"):
            data.append({
                "title": str(item.get("label")).strip().lower(),
                "category": item.get("category"),
                "subcategory": item.get("subcategory", "Other")
            })
            
    for item in expenses:
        if item.get("title") and item.get("category"):
            data.append({
                "title": str(item.get("title")).strip().lower(),
                "category": item.get("category"),
                "subcategory": item.get("subcategory", "Other")
            })
    
    # Remove exact duplicates to prevent overfitting
    df = pd.DataFrame(data).drop_duplicates()
    logger.info(f"Total unique training samples collected: {len(df)}")
    
    if len(df) < 10:
        logger.warning("Not enough data to train a reliable model! Adding some default fallback examples...")
        fallback_data = [
            {"title": "uber", "category": "Transport & Travel", "subcategory": "Taxi/Ride-hailing"},
            {"title": "ola cab", "category": "Transport & Travel", "subcategory": "Taxi/Ride-hailing"},
            {"title": "dominos pizza", "category": "Food & Dining", "subcategory": "Fast Food"},
            {"title": "rent", "category": "Housing & Utilities", "subcategory": "Rent/Mortgage"},
            {"title": "movie tickets", "category": "Entertainment & Leisure", "subcategory": "Movies & Shows"},
            {"title": "doctor fee", "category": "Health & Fitness", "subcategory": "Doctor Consultation"},
            {"title": "flight to goa", "category": "Transport & Travel", "subcategory": "Flights"},
            {"title": "goa trip", "category": "Transport & Travel", "subcategory": "Trips"},
            {"title": "coffee", "category": "Food & Dining", "subcategory": "Coffee/Tea"},
            {"title": "gym membership", "category": "Health & Fitness", "subcategory": "Gym & Fitness Classes"},
            {"title": "amazon shopping", "category": "Shopping", "subcategory": "Electronics & Gadgets"},
            {"title": "petrol", "category": "Transport & Travel", "subcategory": "Fuel/Petrol/Diesel"}
        ]
        df = pd.concat([df, pd.DataFrame(fallback_data)]).drop_duplicates()
        logger.info(f"Dataset size after adding fallbacks: {len(df)}")

    return df

def train_model():
    logger.info("=== Starting Expense Categorization Model Training ===")
    start_time = time.time()
    
    # Load .env from backend folder
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend", ".env")
    load_dotenv(env_path)
    
    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        logger.error("MONGO_URI environment variable not found. Please set it in .env")
        return

    # 1. Load Data
    df = load_data_from_mongo(mongo_uri)
    
    # Create target label by combining Category and Subcategory
    df["target"] = df["category"] + "|||" + df["subcategory"]
    
    X = df["title"]
    y = df["target"]
    
    # 2. Split Data for Testing (only if we have enough classes/samples)
    try:
        logger.info("Splitting dataset into 80% training and 20% testing...")
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    except ValueError as e:
        logger.warning(f"Could not split dataset evenly due to lack of samples ({e}). Using all data for training.")
        X_train, X_test, y_train, y_test = X, X, y, y

    # 3. Vectorization (Text to Numbers using Sentence Transformers)
    logger.info("Initializing Sentence Transformer Model (all-MiniLM-L6-v2)...")
    vectorizer = SentenceTransformer('all-MiniLM-L6-v2')
    
    logger.info("Encoding text data... this might take a moment...")
    X_train_vec = vectorizer.encode(X_train.tolist(), show_progress_bar=True)
    
    # 4. Model Training
    logger.info("Initializing Logistic Regression Classifier...")
    model = LogisticRegression(max_iter=1000, class_weight='balanced')
    
    logger.info("Training the model... this might take a few seconds.")
    model.fit(X_train_vec, y_train)
    logger.info("Model training completed successfully!")
    
    # 5. Testing and Evaluation
    if len(X_test) > 0 and not X_train.equals(X_test):
        logger.info("Evaluating model on test data...")
        X_test_vec = vectorizer.encode(X_test.tolist(), show_progress_bar=False)
        predictions = model.predict(X_test_vec)
        acc = accuracy_score(y_test, predictions)
        logger.info(f"Model Accuracy on Test Data: {acc * 100:.2f}%")
        
        # Log a few sample predictions
        logger.info("--- Sample Predictions on Test Data ---")
        for i in range(min(5, len(X_test))):
            true_val = y_test.iloc[i].replace("|||", " -> ")
            pred_val = predictions[i].replace("|||", " -> ")
            logger.info(f"Title: '{X_test.iloc[i]}' | True: {true_val} | Predicted: {pred_val}")
    
    # 6. Saving the Model
    logger.info("Saving the trained model to disk...")
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(current_dir, "classifier.joblib")
    
    joblib.dump(model, model_path)
    
    logger.info(f"Saved Model to: {model_path}")
    
    elapsed = time.time() - start_time
    logger.info(f"=== Training Pipeline Finished in {elapsed:.2f} seconds ===")

if __name__ == "__main__":
    train_model()
