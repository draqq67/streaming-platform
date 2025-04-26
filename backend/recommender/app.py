# app.py
from flask import Flask, request, jsonify
from recommender import recommend_for_user

app = Flask(__name__)

@app.route("/recommend/<int:user_id>", methods=["GET"])
def recommend(user_id):
    try:
        top_movies = recommend_for_user(user_id)
        return jsonify(top_movies)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5001, debug=True)
