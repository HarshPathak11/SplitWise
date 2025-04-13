import os
import hashlib
from bson import ObjectId
from flask import Flask, request, jsonify
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

print(MONGO_URI, GROQ_API_KEY, ASTRA_DB_API_ENDPOINT, ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_KEYSPACE, VECTOR_COLLECTION)

print(ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_API_ENDPOINT, ASTRA_DB_KEYSPACE, VECTOR_COLLECTION)
app = Flask(__name__)

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
    for doc in documents:
        doc_id = generate_doc_id(doc)
        collection.update_one(
            {"_id": doc_id},
            {"$set": {"user_id": user_id, "content": doc, "$vectorize": doc}},
            upsert=True
        )

def search_vectors(query_text, limit=5):
    results = collection.find({}, sort={"$vectorize": query_text}, limit=limit)
    return [doc for doc in results]

def aggregate_user_data(user):
    docs = []

    # Groups (need to fetch group docs by ID)
    if "groups" in user:
        for group_id in user["groups"]:
            if isinstance(group_id, ObjectId):
                group = db.groups.find_one({"_id": group_id})
                if group:
                    name = group.get("name", "Unnamed trip")
                    members = group.get("members", [])
                    docs.append(f"Trip '{name}' with members {members}")

    # Recent Expenses (embedded)
    if "recentExpense" in user:
        for expense in user["recentExpense"]:
            title = expense.get("title", "No title")
            amount = expense.get("amount", 0)
            paid_by = expense.get("paidBy", "Unknown")
            docs.append(f"Expense '{title}' of ₹{amount}, paid by {paid_by}")

    # Friends (need to fetch actual friend user docs)
    if "friends" in user:
        for entry in user["friends"]:
            friend_id = entry.get("friend")
            balance = entry.get("balance", 0)

            if isinstance(friend_id, ObjectId):
                friend = db.users.find_one({"_id": friend_id})
                if friend:
                    name = friend.get("username", "Unnamed")
                    email = friend.get("email", "No email")
                    docs.append(f"Friend: {name} ({email}) | Balance: ₹{balance}")

    return docs

def construct_prompt(context, query):
    return f"You are a personal assistant for finance.\nContext:\n{context}\n\nQuery: {query}\n"

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

    docs = aggregate_user_data(user)
    upsert_user_documents(user_id, docs)
    vector_docs = search_vectors(query, limit=5)
    context = "\n".join(doc.get("content", "") for doc in vector_docs)
    prompt = construct_prompt(context, query)
    answer = generate_answer(prompt)
    print(answer)
    return jsonify({"answer": answer})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
