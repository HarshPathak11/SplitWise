import os
import time
import logging
import joblib
from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
from flask_cors import CORS
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("ExpenseCategorizationAPI")

app = Flask(__name__)
CORS(app)


# Load the trained model and vectorizer on startup
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(CURRENT_DIR, "classifier.joblib")

vectorizer = None
classifier = None

def load_models():
    global vectorizer, classifier
    logger.info("Starting API Server...")
    if os.path.exists(MODEL_PATH):
        logger.info("Loading pre-trained classifier from disk and downloading/loading Sentence Transformer...")
        vectorizer = SentenceTransformer('all-MiniLM-L6-v2')
        classifier = joblib.load(MODEL_PATH)
        logger.info("Models loaded successfully and ready to classify!")
    else:
        logger.warning(
            "Model file not found! Please run 'python train.py' first to generate "
            "'classifier.joblib'."
        )

# Call on boot
load_models()

@app.route("/categorize", methods=["POST"])
def categorize():
    req_start = time.time()
    
    # 1. Parse Request
    data = request.get_json()
    if not data:
        logger.error("Received empty request payload.")
        return jsonify({"error": "No JSON payload provided"}), 400
        
    title = data.get("title", "").strip().lower()
    
    logger.info(f"--- New Categorization Request ---")
    logger.info(f"Received Expense Title: '{title}'")
    
    if not title:
        logger.error("Title field is missing or empty.")
        return jsonify({"error": "Missing 'title' field"}), 400

    if vectorizer is None or classifier is None:
        logger.error("Models are not loaded into memory. Cannot process request.")
        return jsonify({"error": "Model not trained or not loaded. Run train.py first."}), 500

    try:
        # 2. Vectorize the text
        logger.info(f"Step 1: Vectorizing the text '{title}'...")
        title_vec = vectorizer.encode([title])
        
        # 3. Predict Category
        logger.info(f"Step 2: Passing vectorized text to Logistic Regression classifier...")
        prediction = classifier.predict(title_vec)[0] # returns "Category|||Subcategory"
        
        # Calculate confidence score
        probabilities = classifier.predict_proba(title_vec)[0]
        confidence = max(probabilities) * 100
        
        category, subcategory = prediction.split("|||")
        logger.info(f"Step 3: Prediction successful -> Category: '{category}', Subcategory: '{subcategory}' (Confidence: {confidence:.2f}%)")
        
        elapsed = time.time() - req_start
        logger.info(f"Request completed in {elapsed:.4f} seconds.")
        logger.info(f"----------------------------------")
        
        # 4. Return Response
        return jsonify({
            "title": title,
            "category": category,
            "subcategory": subcategory,
            "confidence": f"{confidence:.2f}%"
        })
        
    except Exception as e:
        logger.error(f"Error during categorization: {str(e)}")
        return jsonify({"error": "Internal server error during classification."}), 500

if __name__ == "__main__":
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend", ".env")
    load_dotenv(env_path)
    
    port = int(os.getenv("PORT", 5000))
    logger.info(f"Starting Flask App on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=False)
