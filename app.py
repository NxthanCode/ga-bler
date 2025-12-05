from flask import Flask, request, jsonify
import json, os

app = Flask(__name__)


rewards = {}
balances = {}

def save_data():
    try:
        with open('data.json', 'w') as f:
            json.dump(rewards, f, indent=2)
        print(f"SAVED: data.json updated with {len(rewards)} players")
        return True
    except Exception as e:
        print(f"ERROR saving data.json: {e}")
        return False


def load_data():
    global rewards
    try:
        if os.path.exists('data.json'):
            with open('data.json', 'r') as f:
                rewards = json.load(f)
                print(f"LOADED: data.json with {len(rewards)} players")
        else:
            rewards = {}
            print("No data.json found, starting fresh")
    except Exception as e:
        print(f"ERROR loading data.json: {e}")
        rewards = {}


@app.route("/")
def home():
    return "Reward API läuft!"

@app.route("/setReward", methods=["GET"])
def set_reward():
    userID = request.args.get("userID")
    reward = request.args.get("reward")

    if userID is None or reward is None:
        return "ERROR: userID and reward required", 400

    try:
        reward = int(reward)
    except:
        return "ERROR: reward must be an integer", 400

    rewards[userID] = reward
    return "OK"

@app.route("/getReward", methods=["GET"])
def get_reward():
    userID = request.args.get("userID")
    if userID is None:
        return "ERROR: userID required", 400

    reward = rewards.get(userID, 0)
    return str(reward)

@app.route("/checkreward", methods=["GET"])
def check_reward():
    userID = request.args.get("userID")
    
    if userID is None:
        return jsonify({"error": "userID required"}), 400
    
    print(f"DEBUG: checkreward called - USERID: {userID}")
    
    reward_param = request.args.get("reward")
    
    if reward_param is not None:
        try:
            reward = int(reward_param)
            rewards[userID] = reward
            save_data()
            print(f"SAVED: {userID} -> {reward} to data.json")
            
            return jsonify({
                "userID": userID,
                "reward": reward
            })
        except ValueError:
            return jsonify({"error": "reward must be a number"}), 400
    else:
        if userID == "admin123":
            # Special case for admin123
            print(f"CHECKING: admin123 gets 1000 (special)")
            return jsonify({"userID": userID, "reward": 1000})
        else:
            current_reward = rewards.get(userID, 0)
            print(f"CHECKING: {userID} has {current_reward}")
            
            return jsonify({
                "userID": userID,
                "reward": current_reward
            })
    
@app.route("/money", methods=["GET"])
def money():
    userID = request.args.get("userID")
    if not userID:
        return "ERROR: userID required", 400
    
    return str(balances.get(userID, 0))
    



if __name__ == "__main__":
    app.run(host="0.0.0.0")




