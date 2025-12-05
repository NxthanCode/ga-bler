from flask import Flask, request

app = Flask(__name__)


rewards = {}
balances = {}

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
    print(f"debug: recieved request - userid: "+ userID)
    print(f"debug: request url" + request.url)
    print(f"debug: address: {request.remote_addr}")

    if userID is None:
        return "ERROR: userID required", 400

    if userID == "admin123":
        return "1000"
    else:
        return "500"
    
@app.route("/money", methods=["GET"])
def money():
    userID = request.args.get("userID")
    if not userID:
        return "ERROR: userID required", 400
    
    return str(balances.get(userID, 0))
    



if __name__ == "__main__":
    app.run(host="0.0.0.0")




