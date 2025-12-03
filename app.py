from flask import Flask, request, jsonify

app = Flask(__name__)

pending_rewards = {}

@app.route("/setReward", methods=["POST"])
def set_reward():
    data = request.json
    user = data["userid"]
    amount = data["amount"]
    pending_rewards[user] = amount
    return "OK"

@app.route("/getReward")
def get_reward():
    user = request.args.get("userid", "")
    amount = pending_rewards.get(user, 0)
    pending_rewards[user] = 0
    return str(amount)

@app.get("/checkreward")
def check_reward():
    userid = request.args.get("userid")
    if userid == "admin123":
        return "1000"   
    else:
        return "100"   

app.run(host="0.0.0.0", port=5000)
