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
    
