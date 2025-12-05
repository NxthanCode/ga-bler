from flask import Flask, request, jsonify
import json

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
    
    print("debug: checkreward called - USERID: "+userID)
    rewardd = request.args.get("reward")

    if rewardd is not None:
        try:
            reward = int(rewardd)
            rewards[userID] = reward
            save_data()
            print(f" SAVED: {userID} -> {reward} to data.json")

            return jsonify({
                "userID": userID,
                "reward": reward,
                "message": f"reward set to {reward}"
            })
        except ValueError:
            return jsonify({"error": "reward must be a number"}), 500
    else:
        currentr = rewards.get(userID, 0)
        if userID not in rewards:
            rewards[userID] = 0
            save_data()
            print(f"CREATED: New user {userID} with 0 reward")

        return jsonify({
            "userID": userID,
            "reward": currentr
        }) 
    
@app.route("/money", methods=["GET"])
def money():
    userID = request.args.get("userID")
    if not userID:
        return "ERROR: userID required", 400
    
    return str(balances.get(userID, 0))
    



if __name__ == "__main__":
    app.run(host="0.0.0.0")




