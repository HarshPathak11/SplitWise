import os
import hashlib
from datetime import datetime
from bson import ObjectId
from flask import Flask, request, jsonify
from flask_cors import CORS  # Import Flask-CORS
from pymongo import MongoClient
from dotenv import load_dotenv
from groq import Groq
from astrapy import DataAPIClient

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
ASTRA_DB_API_ENDPOINT = os.getenv("ASTRA_DB_API_ENDPOINT")
ASTRA_DB_APPLICATION_TOKEN = os.getenv("ASTRA_DB_APPLICATION_TOKEN")
ASTRA_DB_KEYSPACE = os.getenv("ASTRA_DB_KEYSPACE")
VECTOR_COLLECTION = os.getenv("VECTOR_COLLECTION", "user_data_vector")

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# MongoDB connection
mongo_client = MongoClient(MONGO_URI)
db = mongo_client["Splitwise"]

# Groq client for Llama-30B
groq_client = Groq(api_key=GROQ_API_KEY)

# AstraPy connection
astra_client = DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
database = astra_client.get_database(ASTRA_DB_API_ENDPOINT)
collection = database.get_collection(VECTOR_COLLECTION)

# Helpers
def generate_doc_id(text):
    return hashlib.md5(text.encode("utf-8")).hexdigest()

def upsert_user_documents(user_id, documents):
    # For each aggregated document, check if the stored "content" is different.
    # If so, update it (which also triggers the re-vectorization via the "$vectorize" operator).
    for doc in documents:
        doc_id = generate_doc_id(doc)
        existing_doc = collection.find_one({"_id": doc_id})
        if not existing_doc or existing_doc.get("content") != doc:
            collection.update_one(
                {"_id": doc_id},
                {"$set": {"user_id": user_id, "content": doc, "$vectorize": doc}},
                upsert=True
            )

def search_vectors(query_text, limit=5):
    results = collection.find({}, sort={"$vectorize": query_text}, limit=limit)
    return [doc for doc in results]

def aggregate_user_data(user):
    """Aggregate data in a human-friendly way.
    
    This function:
      - Adds the user's own name.
      - For each trip in the user's groups, fetches the trip name and replaces member IDs with their usernames.
      - For each recent expense, replaces payer and owedBy IDs with corresponding usernames.
      - For each friend, fetches and shows the friend’s username and email.
    """
    docs = []
    
    # Add a header for the user.
    user_name = user.get("username", "Unnamed User")
    docs.append(f"User: {user_name}")
    
    # Groups / Trips
    if "groups" in user:
        for group_id in user["groups"]:
            if isinstance(group_id, ObjectId):
                group = db.groups.find_one({"_id": group_id})
                if group:
                    trip_name = group.get("name", "Unnamed Trip")
                    member_ids = group.get("members", [])
                    member_names = []
                    for m_id in member_ids:
                        member_doc = db.users.find_one({"_id": m_id})
                        if member_doc:
                            member_names.append(member_doc.get("username", "Unknown"))
                        else:
                            member_names.append(str(m_id))
                    docs.append(f"Trip '{trip_name}' with members: {', '.join(member_names)}")
    
    # Recent Expenses
    if "recentExpense" in user:
        for expense in user["recentExpense"]:
            title = expense.get("title", "No title")
            amount = expense.get("amount", 0)
            # Replace the paidBy ID with username.
            paid_by_id = expense.get("paidBy")
            if isinstance(paid_by_id, ObjectId):
                payer_doc = db.users.find_one({"_id": paid_by_id})
                paid_by = payer_doc.get("username", str(paid_by_id)) if payer_doc else str(paid_by_id)
            else:
                paid_by = str(paid_by_id)
            # For each entry in owedBy, replace the user ID with username.
            owed_entries = expense.get("owedBy", [])
            owed_details = []
            for entry in owed_entries:
                owed_user_id = entry.get("user")
                owed_amount = entry.get("amount", 0)
                if isinstance(owed_user_id, ObjectId):
                    owed_user_doc = db.users.find_one({"_id": owed_user_id})
                    owed_username = owed_user_doc.get("username", str(owed_user_id)) if owed_user_doc else str(owed_user_id)
                else:
                    owed_username = str(owed_user_id)
                owed_details.append(f"{owed_username}: ₹{owed_amount}")
            docs.append(f"Expense '{title}' of ₹{amount}, paid by {paid_by}. Split: {', '.join(owed_details)}")
    
    # Friends
    if "friends" in user:
        for entry in user["friends"]:
            friend_id = entry.get("friend")
            balance = entry.get("balance", 0)
            if isinstance(friend_id, ObjectId):
                friend_doc = db.users.find_one({"_id": friend_id})
                if friend_doc:
                    friend_name = friend_doc.get("username", "Unnamed")
                    email = friend_doc.get("email", "No email")
                else:
                    friend_name = str(friend_id)
                    email = "No email"
            else:
                friend_name = str(friend_id)
                email = "No email"
            docs.append(f"Friend: {friend_name} ({email}) | Balance: ₹{balance}")
    
    return docs

def construct_prompt(context, query):
    # Provide detailed instructions and definitions for CashMap AI.
    improved_context = (
        "You are FairFare AI, a personal finance assistant designed to help users manage their expenses and financial relationships. "
        "Your role is to analyze the user's financial history and provide personalized insights. Here are key definitions:\n\n"
        "User: The person using FairFare AI. Their name and details are provided so you know whom you are assisting.\n\n"
        "Friends: Individuals with whom the user shares expenses. Their names and contact details (like email) are provided along with current balances.\n\n"
        "Trips: Shared events or journeys where expenses are recorded and later split among the participants. Each trip lists its members by name.\n\n"
        "Expenses: Transactions recorded by the user. Each expense has a title, amount, the person who paid, and how the amount is split among participants (shown by usernames rather than database IDs).\n\n"
        "Your task is to use this context to answer queries in a detailed and personalized manner. Please ensure to never reveal Technical Databse details, never reveal mongodb ids , always refer to a user or friend by username, Answer precisely and concisely, in normal human manner.\n\n"
        "Context Details:\n"
    )
    return improved_context + context + f"\n\nQuery: {query}\n"

def generate_answer(prompt):
    chat = groq_client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.3-70b-versatile"
    )
    return chat.choices[0].message.content

# Flask endpoint

@app.route("/assist", methods=["POST"])
def assist():
    data = request.get_json()
    user_id = data.get("userId")
    query = data.get("query")
    if not user_id or not query:
        return jsonify({"message": "Missing fields"}), 400

    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"message": "User not found"}), 404

    # --- Daily chat limit check ---
    usage = user.get("aiChatUsage", {})
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

    last_used = usage.get("lastUsed")
    count = usage.get("count", 0)

    if last_used:
        last_used_dt = datetime.fromisoformat(last_used)
        if last_used_dt >= today:
            if count >= 10:
                return jsonify({"answer": "Daily AI chat limit reached (10 per day)"}), 200
            else:
                count += 1
        else:
            # New day, reset counter
            count = 1
    else:
        # First time using AI
        count = 1

    # Save updated usage
    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "aiChatUsage.count": count,
                "aiChatUsage.lastUsed": datetime.now().isoformat()
            }
        }
    )

    # --- Continue as normal ---
    docs = aggregate_user_data(user)
    upsert_user_documents(user_id, docs)
    vector_docs = search_vectors(query, limit=5)
    context = "\n".join(doc.get("content", "") for doc in vector_docs)
    prompt = construct_prompt(context, query)
    answer = generate_answer(prompt)
    print(answer)
    return jsonify({"answer": answer})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
