from flask import Flask, request, jsonify, render_template, send_from_directory
import json, os

app = Flask(__name__, static_folder='static')

rewards = {}

def load_data():
    global rewards
    try:
        if os.path.exists('data.json'):
            with open('data.json', 'r') as f:
                rewards = json.load(f)
    except:
        rewards = {}

def save_data():
    with open('data.json', 'w') as f:
        json.dump(rewards, f)
    
load_data()

@app.route("/")
def dashboard():
    return render_template('index.html')

@app.route('/css/<path:filename>')
def serve_css(filename):
    return send_from_directory('static/css', filename)

@app.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory('static/js', filename)

@app.route("/api/setReward", methods=["GET"])
def set_reward():
    userID = request.args.get("userID")
    reward = request.args.get("reward")

    if userID is None or reward is None:
        return jsonify({"error": "userID and reward required"}), 400
    
    try:
        reward = int(reward)
    except:
        return jsonify({"error": "reward must be a number"}), 400
    
    rewards[userID] = reward
    save_data()
    
    return jsonify({
        "success": True,
        "userID": userID,
        "reward": reward,
        "message": f"Reward for {userID} set to {reward}"
    })

@app.route("/api/getReward", methods=["GET"])
def get_reward():
    userID = request.args.get("userID")
    if userID is None:
        return jsonify({"error": "userID required"}), 400
    
    reward = rewards.get(userID, 0)
    return jsonify({"userID": userID, "reward": reward})

@app.route("/api/checkreward", methods=["GET"])
def check_reward():
    userID = request.args.get("userID")

    if userID is None:
        return "ERROR: userID required", 400

    print(f"DEBUG: checkreward called - USERID: {userID}")
    
    # Check if there's a reward parameter to save
    reward_param = request.args.get("reward")
    
    if reward_param is not None:
        # SET mode: Save the reward
        try:
            reward = int(reward_param)
            rewards[userID] = reward
            save_data()
            print(f"SAVED: {userID} -> {reward} to data.json")
            return str(reward)  # Return the saved amount
        except ValueError:
            return "ERROR: reward must be a number", 400
    
    # GET mode: Return existing value
    if userID == "admin123":
        print(f"RETURNING: admin123 -> 1000")
        return "1000"
    else:
        # Check if user exists in data
        if userID in rewards:
            current_reward = rewards[userID]
            print(f"RETURNING: {userID} -> {current_reward} (from data.json)")
            return str(current_reward)
        else:
            print(f"RETURNING: {userID} -> 100 (default)")
            return "100"

@app.route("/api/status")
def api_status():
    all_rewards = sum(rewards.values()) if rewards else 0
    return jsonify({
        "status": "online",
        "endpoints": ["/api/setReward", "/api/getReward", "/api/checkreward", "/api/deletePlayer"],
        "players": len(rewards),
        "rewards": all_rewards,
    })

@app.route("/api/players")
def get_players():
    return jsonify({
        "players": [
            {"id": k, "reward": v}
            for k, v in rewards.items()
        ]
    })


@app.route("/api/data")
def get_data():
    return jsonify(rewards)

@app.route("/api/deletePlayer", methods=["GET"])
def delete_player():
    userID = request.args.get("userID")
    
    if userID is None:
        return jsonify({"error": "userID required"}), 400
    
    if userID in rewards:
        del rewards[userID]
        save_data()
        return jsonify({
            "success": True,
            "message": f"player {userID} deleted successfully"
        })
    else:
        return jsonify({"error": f"player {userID} not found"}), 404


@app.route("/api/clearall", methods=["GET"])
def clear_all_data():
    global rewards 
    rewards = {}
    save_data()
    return jsonify({
        "success": True,
        "message": "all data cleared",
        "players_deleted": len(rewards)
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0")



