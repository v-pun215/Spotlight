from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import jwt
import datetime
from functools import wraps

load_dotenv()


app = Flask(__name__)
CORS(app, supports_credentials=True, origins=[
    "http://127.0.0.1:5500",
    "https://spotlight-delhi.vercel.app"
])


SECRET_KEY = os.getenv("SECRET_KEY")
client = MongoClient(os.getenv("MONGO_URI"))
db = client["spotlight"]
users_collection = db["users"]


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"error": "Token is missing!"}), 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            request.user_email = data['email']
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        return f(*args, **kwargs)
    return decorated


@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"error": "Email already exists"}), 409

    users_collection.insert_one({"email": email, "password": password})

    payload = {
        "email": email,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

    return jsonify({
        "message": "User created",
        "token": token,
        "user": { "email": email }
    }), 201

@app.route("/signin", methods=["POST"])
def signin():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = users_collection.find_one({"email": email})

    if not user or user.get("password") != password:
        return jsonify({"error": "Invalid email or password"}), 401

    payload = {
        "email": email,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
            "email": email,
            "name": user.get("name"),
            "username": user.get("username")
        }
    }), 200


@app.route("/profile", methods=["POST"])
@token_required
def profile():
    data = request.json
    name = data.get("name")
    username = data.get("username")

    if not name or not username:
        return jsonify({"error": "Name and username are required"}), 400

    # Ensure username is unique
    if users_collection.find_one({"username": username}):
        return jsonify({"error": "Username already taken"}), 409

    users_collection.update_one(
        {"email": request.user_email},
        {"$set": {"name": name, "username": username}}
    )

    return jsonify({"message": "Profile saved successfully"}), 200


if __name__ == "__main__":
    app.run(debug=True)