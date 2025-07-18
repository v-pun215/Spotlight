from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


client = MongoClient(os.getenv("MONGO_URI"))
db = client["spotlight"]
users_collection = db["users"]

# -------------------------------
# SIGN UP
# -------------------------------
@app.route("/signup", methods=["POST", "OPTIONS"])
def signup():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()

    data = request.json
    email = data.get("email")

    if not email:
        return _corsify_actual_response(jsonify({"error": "Email is required"}), 400)

    if users_collection.find_one({"email": email}):
        return _corsify_actual_response(jsonify({"error": "Email already exists"}), 409)

    users_collection.insert_one({"email": email})
    return _corsify_actual_response(jsonify({"message": "User created"}), 201)

# -------------------------------
# SIGN IN
# -------------------------------
@app.route("/signin", methods=["POST", "OPTIONS"])
def signin():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()

    data = request.json
    email = data.get("email")

    if not email:
        return _corsify_actual_response(jsonify({"error": "Email is required"}), 400)

    user = users_collection.find_one({"email": email})
    if not user:
        return _corsify_actual_response(jsonify({"error": "User not found"}), 404)

    return _corsify_actual_response(jsonify({"message": "Login successful"}), 200)

# -------------------------------
# CORS Helpers
# -------------------------------
def _build_cors_preflight_response():
    response = jsonify()
    response.status_code = 200
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type")
    response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
    return response

def _corsify_actual_response(response, status_code=200):
    response.status_code = status_code
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

# -------------------------------
if __name__ == "__main__":
    app.run(debug=True)