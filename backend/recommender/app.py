from flask import Flask, jsonify
from model import run_recommender, get_recommendations
import threading
from flask_cors import CORS
app = Flask(__name__)

# Flag to check if the model is ready
model_ready = False
CORS(app)  # Enable CORS for all routes

# Function to start the recommender training in a separate thread
def start_recommender():
    global model_ready
    try:
        print("[DEBUG] Starting the recommender model training...")
        run_recommender()  # Assuming this function trains the model
        model_ready = True  # Set model as ready after training
        print("[DEBUG] Recommender model is now ready.")
    except Exception as e:
        print(f"[ERROR] Error during model training: {e}")

# Route to get recommendations for a specific user
@app.route("/recommend/<int:user_id>", methods=["GET"])
def recommend(user_id):
    print(f"[DEBUG] Received recommendation request for user {user_id}")
    
    if not model_ready:
        print("[DEBUG] Model is not ready yet, returning 503 status.")
        return jsonify({"error": "Model is not available. Please try again later."}), 503
    
    try:
        # Fetch recommendations for the user
        print("[DEBUG] Fetching recommendations...")
        top_movies = get_recommendations(user_id)

        if not top_movies:
            print(f"[DEBUG] No recommendations found for user {user_id}.")
            return jsonify({"error": "No recommendations found for the user."}), 404

        print(f"[DEBUG] Recommendations for user {user_id}: {top_movies}")
        return jsonify(top_movies)
    except Exception as e:
        print(f"[ERROR] Error while fetching recommendations: {e}")
        return jsonify({"error": str(e)}), 500

# Start recommender model in a separate thread when the app is initialized
def start_recommender_thread():
    print("[DEBUG] Starting the recommender thread...")
    recommender_thread = threading.Thread(target=start_recommender)
    recommender_thread.daemon = True  # Ensure it runs in the background
    recommender_thread.start()

if __name__ == "__main__":
    print("[DEBUG] Starting Flask app...")
    start_recommender_thread()  # Start the recommender thread when the app starts
    app.run(port=5001, debug=True)
