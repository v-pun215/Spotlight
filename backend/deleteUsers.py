from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()
client = MongoClient(os.getenv("MONGO_URI"))

db = client["spotlight"]
users_collection = db["users"]

# WARNING: This deletes ALL users
result = users_collection.delete_many({})
print(f"Deleted {result.deleted_count} users.")