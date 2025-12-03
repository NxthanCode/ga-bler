from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__, static_folder='.')
CORS(app)

rewards = {}



@app.route("/")
def home():
    return "laüft"

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


@app.get("/checkreward")
def check_reward():
    userid = request.args.get("userid")

    if userid == "admin123":
        return "1000"    
    else:
        return "100"    

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
