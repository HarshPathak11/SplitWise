import os
from dotenv import load_dotenv
from pymongo import MongoClient

env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend", ".env")
load_dotenv(env_path)

mongo_uri = os.getenv("MONGO_URI")
if mongo_uri:
    client = MongoClient(mongo_uri)
    db = client["Splitwise"]
    
    # Let's insert the rules
    rules = [
        {"label": "pan masala", "category": "Health & Lifestyle", "subcategory": "Cigarettes/Tobacco"},
        {"label": "shikhar", "category": "Health & Lifestyle", "subcategory": "Cigarettes/Tobacco"},
        {"label": "cigrate", "category": "Health & Lifestyle", "subcategory": "Cigarettes/Tobacco"},
        {"label": "gutka", "category": "Health & Lifestyle", "subcategory": "Cigarettes/Tobacco"}
    ]
    
    # We will just insert them into the labelcategories collection
    for rule in rules:
        db.labelcategories.update_one(
            {"label": rule["label"]},
            {"$set": rule},
            upsert=True
        )
    print("Successfully added new vocabulary to the database!")
else:
    print("Could not find MONGO_URI in backend/.env")
