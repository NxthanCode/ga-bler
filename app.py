import sys
import subprocess
import importlib
def setup_environment():
    required = {
        'flask': 'Flask',
        'pymongo': 'pymongo'
    }
    for module, package in required.items():
        try:
            importlib.import_module(module)
            print(f"✅ {package} already installed")
        except ImportError:
            print(f"⚠️ Installing {package}...")
            try:
                subprocess.check_call([sys.executable, "-m", "pip", "install", package])
                print(f"✅ {package} installed successfully")
            except:
                print(f"❌ Failed to install {package}")
                print(f"Please run: pip install {package}")
                sys.exit(1)
setup_environment()
from flask import Flask, request, jsonify, render_template, send_from_directory
from pymongo import MongoClient
import os
import json
from datetime import datetime
app = Flask(__name__, static_folder='static')
MONGO_URI = os.environ.get("MONGO_URI", "mongodb+srv://nathanntew:nathanntew@cluster0.tcyvxom.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
try:
    client = MongoClient(MONGO_URI)
    client.admin.command('ping')
    print("✅ Connected to MongoDB successfully!")
    db = client["gamblesim"]
    players_collection = db["players"]
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")
    print("Please check your MONGO_URI environment variable")
    players_collection = None
    players_cache = {}
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response
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
    reward_param = request.args.get("reward")
    if reward_param is not None:
        try:
            reward = int(reward_param)
            if players_collection:
                players_collection.update_one(
                    {"userID": userID},
                    {"$set": {"userID": userID, "reward": reward, "last_updated": datetime.utcnow()}},
                    upsert=True
                )
                print(f"✅ SAVED to MongoDB: {userID} -> {reward}")
            else:
                if 'players_cache' not in globals():
                    globals()['players_cache'] = {}
                globals()['players_cache'][userID] = reward
                print(f"⚠️ Saved to cache (MongoDB not available): {userID} -> {reward}")
            return str(reward)
        except ValueError:
            return "ERROR: reward must be a number", 400
    if userID == "admin123":
        return "1000"
    else:
        if players_collection:
            player = players_collection.find_one({"userID": userID})
            if player:
                current_reward = player.get("reward", 100)
                print(f"📊 FROM MongoDB: {userID} -> {current_reward}")
                return str(current_reward)
        else:
            if 'players_cache' in globals() and userID in globals()['players_cache']:
                current_reward = globals()['players_cache'][userID]
                print(f"📊 FROM cache: {userID} -> {current_reward}")
                return str(current_reward)
        return "100"
@app.route("/api/setReward", methods=["GET"])
def set_reward():
    userID = request.args.get("userID")
    reward = request.args.get("reward")
    if userID is None or reward is None:
        return jsonify({"error": "userID and reward required"}), 400
    try:
        reward = int(reward)
        if players_collection:
            players_collection.update_one(
                {"userID": userID},
                {"$set": {"userID": userID, "reward": reward, "last_updated": datetime.utcnow()}},
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
    reward = 0
    if players_collection:
        player = players_collection.find_one({"userID": userID})
        reward = player.get("reward", 0) if player else 0
    elif 'players_cache' in globals() and userID in globals()['players_cache']:
        reward = globals()['players_cache'][userID]
    return jsonify({"userID": userID, "reward": reward})
@app.route("/api/players")
def get_players():
    if players_collection:
        all_players = list(players_collection.find({}, {"_id": 0, "last_updated": 0}))
        players_list = [
            {"id": p["userID"], "reward": p["reward"]}
            for p in all_players
        ]
    else:
        players_list = [
            {"id": uid, "reward": reward}
            for uid, reward in globals().get('players_cache', {}).items()
        ]
    return jsonify({"players": players_list})
@app.route("/api/data")
def get_data():
    if players_collection:
        all_players = list(players_collection.find({}, {"_id": 0, "last_updated": 0}))
        data_dict = {p["userID"]: p["reward"] for p in all_players}
    else:
        data_dict = globals().get('players_cache', {})
    return jsonify(data_dict)
@app.route("/api/status")
def api_status():
    if players_collection:
        all_players = list(players_collection.find({}))
        total_rewards = sum(p.get("reward", 0) for p in all_players)
        player_count = len(all_players)
    else:
        cache = globals().get('players_cache', {})
        total_rewards = sum(cache.values())
        player_count = len(cache)
    return jsonify({
        "status": "online",
        "endpoints": ["/api/setReward", "/api/getReward", "/api/checkreward", "/api/deletePlayer"],
        "players": player_count,
        "rewards": total_rewards,
    })
@app.route("/api/deletePlayer", methods=["GET"])
def delete_player():
    userID = request.args.get("userID")
    if userID is None:
        return jsonify({"error": "userID required"}), 400
    deleted = False
    if players_collection:
        result = players_collection.delete_one({"userID": userID})
        deleted = result.deleted_count > 0
    elif 'players_cache' in globals() and userID in globals()['players_cache']:
        del globals()['players_cache'][userID]
        deleted = True
    if deleted:
        return jsonify({
            "success": True,
            "message": f"player {userID} deleted successfully"
        })
    else:
        return jsonify({"error": f"player {userID} not found"}), 404
@app.route("/api/clearall", methods=["GET"])
def clear_all_data():
    deleted_count = 0
    if players_collection:
        result = players_collection.delete_many({})
        deleted_count = result.deleted_count
    elif 'players_cache' in globals():
        deleted_count = len(globals()['players_cache'])
        globals()['players_cache'] = {}
    return jsonify({
        "success": True,
        "message": "all data cleared",
        "players_deleted": deleted_count
    })
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)

