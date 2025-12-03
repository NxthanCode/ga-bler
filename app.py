from flask import Flask, request, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder='.')
CORS(serve_static= ".")

rewards = {}

@app.route("/<path:filename>")
def serve_static(filename):
    if filename.endswith('.css') or filename.endswith('.js') or filename.endswith('.html'):
        return send_from_directory('.', filename)
    return "n", 404


@app.route("/")
def home():
    return send_from_directory('.', 'dashboard.html')

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

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)