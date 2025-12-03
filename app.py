from flask import Flask, request, jsonify
import json
import os

app = Flask(__name__)

DATA_FILE = "rewards.json"


def load_rewards():
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, "w") as f:
            json.dump({}, f)
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_rewards(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f)


@app.route("/setReward", methods=["GET"])
def set_reward():
    user = request.args.get("userID")
    reward = int(request.args.get("reward"))

    data = load_rewards()
    data[user] = reward
    save_rewards(data)

    return "OK"


@app.route("/getReward", methods=["GET"])
def get_reward():
    user = request.args.get("userID")
    data = load_rewards()

    reward = data.get(user, 0)
    return jsonify(reward)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
