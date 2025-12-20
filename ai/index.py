# # import os
# # import hashlib
# # from datetime import datetime
# # from bson import ObjectId
# # from flask import Flask, request, jsonify
# # from flask_cors import CORS
# # from pymongo import MongoClient
# # from dotenv import load_dotenv
# # from groq import Groq
# # from astrapy import DataAPIClient

# # # ─── Setup ────────────────────────────────────────────────────────────────
# # load_dotenv()
# # MONGO_URI                  = os.getenv("MONGO_URI")
# # GROQ_API_KEY               = os.getenv("GROQ_API_KEY")
# # ASTRA_DB_API_ENDPOINT      = os.getenv("ASTRA_DB_API_ENDPOINT")
# # ASTRA_DB_APPLICATION_TOKEN = os.getenv("ASTRA_DB_APPLICATION_TOKEN")
# # VECTOR_COLLECTION          = os.getenv("VECTOR_COLLECTION", "user_data_vector")

# # app = Flask(__name__)
# # CORS(app)

# # mongo_client = MongoClient(MONGO_URI)
# # db           = mongo_client["Splitwise"]

# # groq_client  = Groq(api_key=GROQ_API_KEY)
# # astra_client = DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
# # database     = astra_client.get_database(ASTRA_DB_API_ENDPOINT)
# # collection   = database.get_collection(VECTOR_COLLECTION)

# # # ─── Helpers ───────────────────────────────────────────────────────────────

# # def get_populated_user(user_id: str) -> dict | None:
# #     """Fetch user + fully populate groups (with members & expenses), recentExpense, and friends."""
# #     raw = db.users.find_one({"_id": ObjectId(user_id)})
# #     if not raw:
# #         return None

# #     user = {
# #         "_id":      raw["_id"],
# #         "username": raw.get("username")
# #     }

# #     # 1) populate groups + members + embedded expenses
# #     populated_groups = []
# #     for gid in raw.get("groups", []):
# #         grp = db.groups.find_one({"_id": gid})
# #         if not grp:
# #             continue

# #         # members
# #         members = list(db.users.find(
# #             {"_id": {"$in": grp.get("members", [])}},
# #             {"username": 1, "_id": 0}
# #         ))
# #         grp["members_docs"] = members

# #         # group’s embedded expenses
# #         exp_docs = []
# #         for exp in grp.get("expenses", []):
# #             e = dict(exp)
# #             paid = db.users.find_one(
# #                 {"_id": exp.get("paidBy")},
# #                 {"username": 1, "_id": 0}
# #             )
# #             e["paidBy_doc"] = paid or {}

# #             owed_list = []
# #             for owed in exp.get("owedBy", []):
# #                 od  = dict(owed)
# #                 usr = db.users.find_one(
# #                     {"_id": owed.get("user")},
# #                     {"username": 1, "_id": 0}
# #                 )
# #                 od["user_doc"] = usr or {}
# #                 owed_list.append(od)
# #             e["owedBy"] = owed_list

# #             exp_docs.append(e)

# #         grp["expenses_docs"] = exp_docs
# #         populated_groups.append(grp)

# #     user["groups"] = populated_groups

# #     # 2) populate recentExpense → paidBy + owedBy.user
# #     populated_expenses = []
# #     for exp in raw.get("recentExpense", []):
# #         e = dict(exp)
# #         paid = db.users.find_one(
# #             {"_id": exp.get("paidBy")},
# #             {"username": 1, "_id": 0}
# #         )
# #         e["paidBy_doc"] = paid or {}

# #         owed_list = []
# #         for owed in exp.get("owedBy", []):
# #             od  = dict(owed)
# #             usr = db.users.find_one(
# #                 {"_id": owed.get("user")},
# #                 {"username": 1, "_id": 0}
# #             )
# #             od["user_doc"] = usr or {}
# #             owed_list.append(od)
# #         e["owedBy"] = owed_list

# #         populated_expenses.append(e)
# #     user["recentExpense"] = populated_expenses

# #     # 3) populate friends → friend
# #     populated_friends = []
# #     for fr in raw.get("friends", []):
# #         friend_id = fr.get("friend")
# #         f = dict(fr)
# #         if friend_id:
# #             friend_doc = db.users.find_one(
# #                 {"_id": friend_id},
# #                 {"username": 1, "email": 1, "_id": 0}
# #             )
# #         else:
# #             friend_doc = {}
# #         f["friend_doc"] = friend_doc or {}
# #         populated_friends.append(f)
# #     user["friends"] = populated_friends

# #     return user

# # def generate_doc_id(user_id: str, text: str) -> str:
# #     """MD5 of user_id + text to ensure per-user uniqueness."""
# #     return hashlib.md5(f"{user_id}:{text}".encode("utf-8")).hexdigest()

# # def upsert_user_documents(user_id: str, documents: list[str]):
# #     """Upsert all snippets and prune any old ones."""
# #     new_ids = []
# #     for doc in documents:
# #         did = generate_doc_id(user_id, doc)
# #         new_ids.append(did)
# #         collection.update_one(
# #             {"_id": did},
# #             {"$set": {"user_id": user_id, "content": doc, "$vectorize": doc}},
# #             upsert=True
# #         )
# #     # delete any vectors not in the current batch
# #     collection.delete_many({
# #         "user_id": user_id,
# #         "_id":     {"$nin": new_ids}
# #     })

# # def aggregate_user_data(user: dict) -> list[str]:
# #     """Build text snippets from the populated user dict."""
# #     docs = []

# #     # User header
# #     docs.append(f"User: {user.get('username','Unnamed User')}")

# #     # Groups + their expenses
# #     if user.get("groups"):
# #         for grp in user["groups"]:
# #             name    = grp.get("name", "Unnamed Trip")
# #             members = [m.get("username", "Unknown") for m in grp.get("members_docs", [])]
# #             docs.append(f"Trip '{name}' with members: {', '.join(members)}")

# #             for exp in grp.get("expenses_docs", []):
# #                 title        = exp.get("title", "No title")
# #                 amount       = exp.get("amount", 0)
# #                 paid_by      = exp.get("paidBy_doc", {}).get("username", "Unknown")
# #                 owed_details = [
# #                     f"{o.get('user_doc', {}).get('username','Unknown')}: ₹{o.get('amount', 0)}"
# #                     for o in exp.get("owedBy", [])
# #                 ]
# #                 docs.append(
# #                     f"In group '{name}', expense '{title}' of ₹{amount}, "
# #                     f"paid by {paid_by}. Split: {', '.join(owed_details)}"
# #                 )
# #     else:
# #         docs.append("No groups found for this user.")

# #     # Recent Expenses (outside any group)
# #     if user.get("recentExpense"):
# #         for exp in user["recentExpense"]:
# #             title        = exp.get("title", "No title")
# #             amount       = exp.get("amount", 0)
# #             paid_by      = exp.get("paidBy_doc", {}).get("username", "Unknown")
# #             owed_details = [
# #                 f"{o.get('user_doc', {}).get('username','Unknown')}: ₹{o.get('amount', 0)}"
# #                 for o in exp.get("owedBy", [])
# #             ]
# #             docs.append(
# #                 f"Expense '{title}' of ₹{amount}, paid by {paid_by}. "
# #                 f"Split: {', '.join(owed_details)}"
# #             )
# #     else:
# #         docs.append("No recent expenses found.")

# #     # Friends
# #     if user.get("friends"):
# #         for fr in user["friends"]:
# #             fd    = fr.get("friend_doc", {})
# #             name  = fd.get("username", "Unknown")
# #             email = fd.get("email", "No email")
# #             bal   = fr.get("balance", 0)
# #             docs.append(f"Friend: {name} ({email}) | Balance: ₹{bal}")
# #     else:
# #         docs.append("No friends found for this user.")

# #     return docs

# # def construct_prompt(context: str, query: str) -> str:
# #     base = (
# #         "You are FairFare AI, a personal finance assistant designed to help users manage their expenses and financial relationships.\n\n"
# #         "Context Details:\n"
# #     )
# #     return base + context + f"\n\nQuery: {query}\n"

# # def generate_answer(prompt: str) -> str:
# #     chat = groq_client.chat.completions.create(
# #         messages=[{"role": "user", "content": prompt}],
# #         model="llama-3.3-70b-versatile"
# #     )
# #     return chat.choices[0].message.content

# # # ─── Flask Endpoint ────────────────────────────────────────────────────

# # @app.route("/assist", methods=["POST"])
# # def assist():
# #     data    = request.get_json()
# #     user_id = data.get("userId")
# #     query   = data.get("query")

# #     if not user_id or not query:
# #         return jsonify({"message": "Missing fields"}), 400

# #     # Fetch the populated user document
# #     user = get_populated_user(user_id)
# #     if user is None:
# #         return jsonify({"message": "User not found"}), 404

# #     # Daily chat limit check
# #     usage   = db.users.find_one({"_id": ObjectId(user_id)}).get("aiChatUsage", {})
# #     today   = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
# #     last    = usage.get("lastUsed")
# #     count   = usage.get("count", 0)
# #     if last:
# #         last_dt = datetime.fromisoformat(last)
# #         if last_dt >= today:
# #             if count >= 10:
# #                 return jsonify({"answer": "Daily AI chat limit reached (10 per day)"}), 200
# #             count += 1
# #         else:
# #             count = 1
# #     else:
# #         count = 1
# #     db.users.update_one(
# #         {"_id": ObjectId(user_id)},
# #         {
# #             "$set": {
# #                 "aiChatUsage.count": count,
# #                 "aiChatUsage.lastUsed": datetime.now().isoformat()
# #             }
# #         }
# #     )

# #     # Build, upsert, and search vectors
# #     snippets    = aggregate_user_data(user)
# #     upsert_user_documents(user_id, snippets)
# #     vector_docs = collection.find(
# #         {"user_id": user_id},
# #         sort={"$vectorize": query},
# #         limit=5
# #     )
# #     context = "\n".join(d["content"] for d in vector_docs)

# #     if not context.strip():
# #         return jsonify({"answer": "I don’t have enough data to answer that yet."})

# #     # Call LLM
# #     prompt = construct_prompt(context, query)
# #     answer = generate_answer(prompt)
# #     return jsonify({"answer": answer})

# # if __name__ == "__main__":
# #     port = int(os.getenv("PORT", 5000))
# #     app.run(host="0.0.0.0", port=port, debug=False)


# import os
# import hashlib
# from datetime import datetime
# from bson import ObjectId
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# from pymongo import MongoClient
# from dotenv import load_dotenv
# from groq import Groq
# from astrapy import DataAPIClient

# # Load environment variables
# load_dotenv()
# MONGO_URI = os.getenv("MONGO_URI")
# GROQ_API_KEY = os.getenv("GROQ_API_KEY")
# ASTRA_DB_API_ENDPOINT = os.getenv("ASTRA_DB_API_ENDPOINT")
# ASTRA_DB_APPLICATION_TOKEN = os.getenv("ASTRA_DB_APPLICATION_TOKEN")
# ASTRA_DB_KEYSPACE = os.getenv("ASTRA_DB_KEYSPACE")
# VECTOR_COLLECTION = os.getenv("VECTOR_COLLECTION", "user_data_vector")

# app = Flask(__name__)
# CORS(app)

# # MongoDB connection
# mongo_client = MongoClient(MONGO_URI)
# db = mongo_client["Splitwise"]

# # Groq client for Llama-30B
# groq_client = Groq(api_key=GROQ_API_KEY)

# # AstraPy connection
# astra_client = DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
# database = astra_client.get_database(ASTRA_DB_API_ENDPOINT)
# collection = database.get_collection(VECTOR_COLLECTION)

# # Helpers
# def generate_doc_id(user_id, text):
#     """Include user_id to avoid collisions across users."""
#     raw = f"{user_id}:{text}"
#     return hashlib.md5(raw.encode("utf-8")).hexdigest()

# def upsert_user_documents(user_id, documents):
#     """Upsert each piece of user-specific context, vectorized on write."""
#     for doc in documents:
#         doc_id = generate_doc_id(user_id, doc)
#         collection.update_one(
#             {"_id": doc_id},
#             {
#                 "$set": {
#                     "user_id": user_id,
#                     "content": doc,
#                     "$vectorize": doc
#                 }
#             },
#             upsert=True
#         )

# def search_vectors(user_id, query_text, limit=5):
#     """Retrieve only this user's documents, sorted by vector similarity."""
#     cursor = collection.find(
#         {"user_id": user_id},
#         sort={"$vectorize": query_text},
#         limit=limit
#     )
#     return list(cursor)

# def aggregate_user_data(user):
#     """
#     Build user-context snippets, including explicit messages when sections are empty.
#     """
#     docs = []

#     # User header
#     user_name = user.get("username", "Unnamed User")
#     docs.append(f"User: {user_name}")

#    # …inside your aggregate_user_data(user) function…

# # Groups / Trips with embedded expenses
#     if user.get("groups"):
#         for group_id in user["groups"]:
#             if isinstance(group_id, ObjectId):
#                 group = db.groups.find_one({"_id": group_id})
#                 if group:
#                     # Trip header
#                     trip_name   = group.get("name", "Unnamed Trip")
#                     member_ids  = group.get("members", [])
#                     member_names = []
#                     for m_id in member_ids:
#                         member_doc = db.users.find_one({"_id": m_id})
#                         member_names.append(
#                             member_doc.get("username", str(m_id))
#                             if member_doc else str(m_id)
#                         )
#                     docs.append(f"Trip '{trip_name}' with members: {', '.join(member_names)}")

#                     # Now include each embedded expense in this group
#                     for exp in group.get("expenses", []):
#                         title       = exp.get("title", "No title")
#                         amount      = exp.get("amount", 0)

#                         # Resolve payer username
#                         paid_by_id = exp.get("paidBy")
#                         if isinstance(paid_by_id, ObjectId):
#                             payer_doc = db.users.find_one({"_id": paid_by_id})
#                             paid_by = payer_doc.get("username", str(paid_by_id)) if payer_doc else str(paid_by_id)
#                         else:
#                             paid_by = str(paid_by_id)

#                         # Build owed-by details
#                         owed_details = []
#                         for entry in exp.get("owedBy", []):
#                             owed_user_id = entry.get("user")
#                             owed_amount  = entry.get("amount", 0)
#                             if isinstance(owed_user_id, ObjectId):
#                                 owed_user_doc = db.users.find_one({"_id": owed_user_id})
#                                 owed_username = owed_user_doc.get("username", str(owed_user_id)) if owed_user_doc else str(owed_user_id)
#                             else:
#                                 owed_username = str(owed_user_id)
#                             owed_details.append(f"{owed_username}: ₹{owed_amount}")

#                         docs.append(
#                             f"In group '{trip_name}', expense '{title}' of ₹{amount}, "
#                             f"paid by {paid_by}. Split: {', '.join(owed_details)}"
#                         )
#     else:
#         docs.append("No groups found for this user.")

#     # Recent Expenses
#     if user.get("recentExpense"):
#         for expense in user["recentExpense"]:
#             title = expense.get("title", "No title")
#             amount = expense.get("amount", 0)
#             # Determine payer username
#             paid_by_id = expense.get("paidBy")
#             if isinstance(paid_by_id, ObjectId):
#                 payer_doc = db.users.find_one({"_id": paid_by_id})
#                 paid_by = payer_doc.get("username", str(paid_by_id)) if payer_doc else str(paid_by_id)
#             else:
#                 paid_by = str(paid_by_id)
#             # Build owed details
#             owed_details = []
#             for entry in expense.get("owedBy", []):
#                 owed_user_id = entry.get("user")
#                 owed_amount = entry.get("amount", 0)
#                 if isinstance(owed_user_id, ObjectId):
#                     owed_user_doc = db.users.find_one({"_id": owed_user_id})
#                     owed_username = owed_user_doc.get("username", str(owed_user_id)) if owed_user_doc else str(owed_user_id)
#                 else:
#                     owed_username = str(owed_user_id)
#                 owed_details.append(f"{owed_username}: ₹{owed_amount}")
#             docs.append(f"Expense '{title}' of ₹{amount}, paid by {paid_by}. Split: {', '.join(owed_details)}")
#     else:
#         docs.append("No recent expenses found.")

#     # Friends
#     if user.get("friends"):
#         for entry in user["friends"]:
#             friend_id = entry.get("friend")
#             balance = entry.get("balance", 0)
#             if isinstance(friend_id, ObjectId):
#                 friend_doc = db.users.find_one({"_id": friend_id})
#                 if friend_doc:
#                     friend_name = friend_doc.get("username", str(friend_id))
#                     email = friend_doc.get("email", "No email")
#                 else:
#                     friend_name = str(friend_id)
#                     email = "No email"
#             else:
#                 friend_name = str(friend_id)
#                 email = "No email"
#             docs.append(f"Friend: {friend_name} ({email}) | Balance: ₹{balance}")
#     else:
#         docs.append("No friends found for this user.")
#     # print(docs)
#     return docs


# def construct_prompt(context, query):
#     improved_context = (
#         "You are FairFare AI, a personal finance assistant designed to help users manage their expenses and financial relationships.Stick to the context and do not hallucinate or create your own data, rather just reply with I dont have information about that as of now. "
#         "Your role is to analyze the user's financial history and provide personalized insights. Here are key definitions:\n\n"
#         "User: The person using FairFare AI. Their name and details are provided so you know whom you are assisting.\n\n"
#         "Friends: Individuals with whom the user shares expenses. Their names and contact details (like email) are provided along with current balances.\n\n"
#         "Trips: Shared events or journeys where expenses are recorded and later split among the participants. Each trip lists its members by name.\n\n"
#         "Expenses: Transactions recorded by the user. Each expense has a title, amount, the person who paid, and how the amount is split among participants (shown by usernames rather than database IDs).\n\n"
#         "Your task is to use this context to answer queries in a detailed and personalized manner. Please ensure to never reveal Technical Database details, never reveal mongodb ids, always refer to a user or friend by username, and answer precisely and concisely, in normal human manner. Please dont generate data on your own, if u dont have any context or if any data is empty, just reply with no data found, dont hallucinate data.If the context has no mention of trips or groups and the user asks about them, "
#         "you must reply “You have not created any groups yet.""\n\n"
#         "Context Details:\n"
#     )
#     return improved_context + context + f"\n\nQuery: {query}\n"

# def generate_answer(prompt):
#     chat = groq_client.chat.completions.create(
#         messages=[{"role": "user", "content": prompt}],
#         model="llama-3.3-70b-versatile"
#     )
#     return chat.choices[0].message.content

# @app.route("/assist", methods=["POST"])
# def assist():
#     data = request.get_json()
#     user_id = data.get("userId")
#     query = data.get("query")
#     if not user_id or not query:
#         return jsonify({"message": "Missing fields"}), 400

#     user = db.users.find_one({"_id": ObjectId(user_id)})
#     if not user:
#         return jsonify({"message": "User not found"}), 404

#     # --- Daily chat limit check ---
#     usage = user.get("aiChatUsage", {})
#     today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

#     last_used = usage.get("lastUsed")
#     count = usage.get("count", 0)

#     if last_used:
#         last_used_dt = datetime.fromisoformat(last_used)
#         if last_used_dt >= today:
#             if count >= 11:
#                 return jsonify({"answer": "Daily AI chat limit reached (10 per day)"}), 200
#             count += 1
#         else:
#             count = 1
#     else:
#         count = 1

#     db.users.update_one(
#         {"_id": ObjectId(user_id)},
#         {
#             "$set": {
#                 "aiChatUsage.count": count,
#                 "aiChatUsage.lastUsed": datetime.now().isoformat()
#             }
#         }
#     )

#     # --- Aggregate, upsert, and query vectors ---
#     docs = aggregate_user_data(user)
#     upsert_user_documents(user_id, docs)
#     vector_docs = search_vectors(user_id, query, limit=5)
#     context = "\n".join(d.get("content", "") for d in vector_docs)

#     prompt = construct_prompt(context, query)
#     answer = generate_answer(prompt)
#     return jsonify({"answer": answer, "updatedCount" : count})

# if __name__ == "__main__":
#     port = int(os.environ.get("PORT", 5000))
#     app.run(host="0.0.0.0", port=port, debug=False)


import os
import hashlib
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from groq import Groq
from astrapy import DataAPIClient

# ─────────────────────────────────────────────────────────────
# ENV SETUP
# ─────────────────────────────────────────────────────────────
load_dotenv()

GROQ_API_KEY               = os.getenv("GROQ_API_KEY")
ASTRA_DB_API_ENDPOINT      = os.getenv("ASTRA_DB_API_ENDPOINT")
ASTRA_DB_APPLICATION_TOKEN = os.getenv("ASTRA_DB_APPLICATION_TOKEN")
VECTOR_COLLECTION          = os.getenv("VECTOR_COLLECTION", "fairfare_user_memory")

# ─────────────────────────────────────────────────────────────
# APP SETUP
# ─────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

groq_client = Groq(api_key=GROQ_API_KEY)

astra_client = DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
database     = astra_client.get_database(ASTRA_DB_API_ENDPOINT)
collection   = database.get_collection(VECTOR_COLLECTION)

# ─────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────

def generate_doc_id(user_id: str, content: str) -> str:
    """
    Ensure memory uniqueness per user.
    """
    raw = f"{user_id}:{content}"
    return hashlib.md5(raw.encode("utf-8")).hexdigest()

# ─────────────────────────────────────────────────────────────
# STEP 3 — MEMORY WRITE (EVENT-BASED)
# ─────────────────────────────────────────────────────────────

@app.route("/memory/create", methods=["POST"])
def create_memory():
    """
    Called from Node backend AFTER snapshot update.
    """
    data = request.get_json()

    user_id    = data.get("userId")
    mem_type   = data.get("type")
    content    = data.get("content")
    confidence = float(data.get("confidence", 0.7))

    if not user_id or not mem_type or not content:
        return jsonify({"error": "Missing fields"}), 400

    doc_id = generate_doc_id(user_id, content)

    # Deduplication via same hash
    collection.update_one(
        {"_id": doc_id},
        {
            "$set": {
                "user_id": user_id,
                "type": mem_type,
                "content": content,
                "confidence": confidence,
                "createdAt": datetime.utcnow().isoformat(),
                "$vectorize": content
            }
        },
        upsert=True
    )

    return jsonify({"success": True})

# ─────────────────────────────────────────────────────────────
# MEMORY SEARCH
# ─────────────────────────────────────────────────────────────

def get_relevant_memories(user_id: str, query: str, limit: int = 5):
    """
    Fetch only THIS user's memories.
    """
    cursor = collection.find(
        {"user_id": user_id},
        sort={"$vectorize": query},
        limit=limit
    )

    memories = []
    for doc in cursor:
        if doc.get("confidence", 0) >= 0.6:
            memories.append(doc["content"])

    return memories[:3]  # HARD LIMIT

# ─────────────────────────────────────────────────────────────
# STEP 4 — FINAL SYSTEM PROMPT (FINTECH SAFE)
# ─────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """
You are FairFare AI, a personal finance intelligence assistant.

You are given:
1. A VERIFIED financial snapshot of the user (SOURCE OF TRUTH).
2. Personal semantic memories (behavioral patterns).
3. A user question.

STRICT RULES (NON-NEGOTIABLE):
- Use ONLY the provided snapshot for numbers, balances, and calculations.
- Never assume missing data.
- Never invent numbers or entities.
- Never reference other users unless explicitly present in the snapshot.
- Memory is advisory only and must NEVER override snapshot facts.
- If the snapshot does not contain the required data, clearly say:
  "I don’t have enough information to answer that right now."
- Currency is INR.
- Do not expose internal data structures, IDs, or implementation details.
- Be clear, concise, neutral, and human.

Your task is to provide the most accurate financial explanation possible.
"""

# ─────────────────────────────────────────────────────────────
# CONTEXT TRIMMING
# ─────────────────────────────────────────────────────────────

def trim_snapshot(snapshot: dict, query: str) -> dict:
    """
    Reduce token usage and hallucination risk.
    """
    q = query.lower()
    trimmed = {
        "profile": snapshot.get("profile")
    }

    if any(x in q for x in ["group", "trip"]):
        trimmed["groups"] = snapshot.get("groups")

    if any(x in q for x in ["friend", "owe", "balance"]):
        trimmed["friends"] = snapshot.get("friends")

    if any(x in q for x in ["spend", "category", "money"]):
        trimmed["spending"] = snapshot.get("spending")

    if any(x in q for x in ["month", "trend"]):
        trimmed["trends"] = snapshot.get("trends")

    return trimmed

# ─────────────────────────────────────────────────────────────
# STEP 5 — AI QUERY ENDPOINT
# ─────────────────────────────────────────────────────────────

@app.route("/ai/assist", methods=["POST"])
def assist():
    """
    Node backend calls this endpoint.
    """
    data = request.get_json()

    user_id  = data.get("userId")
    query    = data.get("query")
    snapshot = data.get("snapshot")

    if not user_id or not query or not snapshot:
        return jsonify({"error": "Missing fields"}), 400

    # Fetch relevant semantic memory
    memories = get_relevant_memories(user_id, query)

    trimmed_snapshot = trim_snapshot(snapshot, query)

    user_prompt = f"""
USER FINANCIAL SNAPSHOT:
{trimmed_snapshot}

PERSONAL MEMORIES:
{memories if memories else "None"}

USER QUESTION:
{query}
"""

    completion = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        temperature=0.2,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ]
    )

    answer = completion.choices[0].message.content

    return jsonify({
        "answer": answer,
        "memoryUsed": len(memories)
    })

# ─────────────────────────────────────────────────────────────
# RUN
# ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
