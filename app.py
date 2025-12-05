import sys
import subprocess
import importlib

# List of required packages
required_packages = ['pymongo', 'flask_cors']

def install_package(package):
    """Install a package using pip"""
    try:
        print(f"Installing {package}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"✅ {package} installed successfully")
    except Exception as e:
        print(f"❌ Failed to install {package}: {e}")
        sys.exit(1)

# Check and install missing packages
for package in required_packages:
    try:
        importlib.import_module(package if package != 'flask_cors' else 'flask_cors')
        print(f"✅ {package} is already installed")
    except ImportError:
        install_package(package)

from flask import Flask, request, jsonify, render_template, send_from_directory
from pymongo import MongoClient
import os
from bson import json_util  # For JSON serialization
import json

app = Flask(__name__, static_folder='static')

# MongoDB connection - USE ENVIRONMENT VARIABLE FOR SECURITY!
MONGO_URI = os.environ.get("MONGO_URI", "mongodb+srv://nathanntew:nathanntew@cluster0.tcyvxom.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
client = MongoClient(MONGO_URI)
db = client["gamblesim"]  # Database name
players_collection = db["players"]  # Collection name

print(f"Connected to MongoDB: {client.server_info()}")

@app.route("/")
def dashboard():
    return render_template('index.html')

@app.route('/css/<path:filename>')
def serve_css(filename):
    return send_from_directory('static/css', filename)

@app.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory('static/js', filename)

@app.route("/api/checkreward", methods=["GET"])
def check_reward():
    userID = request.args.get("userID")
    
    if userID is None:
        return "ERROR: userID required", 400
    
    print(f"DEBUG: checkreward called - USERID: {userID}")
    
    # Check if setting reward
    reward_param = request.args.get("reward")
    
    if reward_param is not None:
        # SET mode: Save to MongoDB
        try:
            reward = int(reward_param)
            # Upsert: Update if exists, insert if new
            players_collection.update_one(
                {"userID": userID},
                {"$set": {"userID": userID, "reward": reward}},
                upsert=True
            )
            print(f"✅ SAVED to MongoDB: {userID} -> {reward}")
            return str(reward)
        except ValueError:
            return "ERROR: reward must be a number", 400
    
    # GET mode: Read from MongoDB
    if userID == "admin123":
        print(f"RETURNING: admin123 -> 1000")
        return "1000"
    else:
        # Check MongoDB
        player = players_collection.find_one({"userID": userID})
        if player:
            current_reward = player.get("reward", 100)
            print(f"RETURNING from MongoDB: {userID} -> {current_reward}")
            return str(current_reward)
        else:
            print(f"RETURNING: {userID} -> 100 (default)")
            return "100"

@app.route("/api/setReward", methods=["GET"])
def set_reward():
    userID = request.args.get("userID")
    reward = request.args.get("reward")

    if userID is None or reward is None:
        return jsonify({"error": "userID and reward required"}), 400
    
    try:
        reward = int(reward)
        players_collection.update_one(
            {"userID": userID},
            {"$set": {"userID": userID, "reward": reward}},
            upsert=True
        )
        
        return jsonify({
            "success": True,
            "userID": userID,
            "reward": reward,
            "message": f"Reward for {userID} set to {reward}"
        })
    except ValueError:
        return jsonify({"error": "reward must be a number"}), 400

@app.route("/api/getReward", methods=["GET"])
def get_reward():
    userID = request.args.get("userID")
    if userID is None:
        return jsonify({"error": "userID required"}), 400
    
    player = players_collection.find_one({"userID": userID})
    reward = player.get("reward", 0) if player else 0
    
    return jsonify({"userID": userID, "reward": reward})

@app.route("/api/players")
def get_players():
    all_players = list(players_collection.find({}, {"_id": 0}))
    return jsonify({
        "players": [
            {"id": p["userID"], "reward": p["reward"]}
            for p in all_players
        ]
    })

@app.route("/api/data")
def get_data():
    all_players = list(players_collection.find({}, {"_id": 0}))
    # Convert to dict format like old data.json
    data_dict = {p["userID"]: p["reward"] for p in all_players}
    return jsonify(data_dict)

@app.route("/api/status")
def api_status():
    all_players = list(players_collection.find({}))
    total_rewards = sum(p.get("reward", 0) for p in all_players)
    
    return jsonify({
        "status": "online",
        "endpoints": ["/api/setReward", "/api/getReward", "/api/checkreward", "/api/deletePlayer"],
        "players": len(all_players),
        "rewards": total_rewards,
    })

@app.route("/api/deletePlayer", methods=["GET"])
def delete_player():
    userID = request.args.get("userID")
    
    if userID is None:
        return jsonify({"error": "userID required"}), 400
    
    result = players_collection.delete_one({"userID": userID})
    
    if result.deleted_count > 0:
        return jsonify({
            "success": True,
            "message": f"player {userID} deleted successfully"
        })
    else:
        return jsonify({"error": f"player {userID} not found"}), 404

@app.route("/api/clearall", methods=["GET"])
def clear_all_data():
    result = players_collection.delete_many({})
    return jsonify({
        "success": True,
        "message": "all data cleared",
        "players_deleted": result.deleted_count
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

