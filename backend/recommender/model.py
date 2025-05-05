import psycopg2
import pandas as pd
from surprise import Dataset, Reader, SVD
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database credentials from environment variables
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASS")

# Global variable to store the trained model
model = None

# Function to connect to the database and fetch ratings data
def fetch_ratings_from_db():
    try:
        print("[DEBUG] Connecting to the database to fetch ratings data...")
        conn = psycopg2.connect(
            host=DB_HOST,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        cursor = conn.cursor()

        # Fetch ratings data
        cursor.execute("SELECT user_id, movie_id, rating FROM ratings")
        ratings_data = cursor.fetchall()
        
        # Convert to pandas DataFrame
        df = pd.DataFrame(ratings_data, columns=['user_id', 'movie_id', 'rating'])
        print(f"[DEBUG] Loaded {len(df)} ratings from the database.")
        
        cursor.close()
        conn.close()

        return df
    except Exception as e:
        print(f"[ERROR] Error fetching data from the database: {e}")
        return pd.DataFrame()

# Function to train the recommender model using the loaded data
def train_recommender(df):
    try:
        print("[DEBUG] Training the recommender model...")
        reader = Reader(rating_scale=(0.5, 5.0))
        data = Dataset.load_from_df(df[['user_id', 'movie_id', 'rating']], reader)

        # Surprise handles training/test split internally
        trainset = data.build_full_trainset()  # Use the full dataset for training

        global model
        model = SVD()
        model.fit(trainset)
        print("[DEBUG] Model trained successfully.")
        return model
    except Exception as e:
        print(f"[ERROR] Error training the model: {e}")
        return None

# Function to generate movie recommendations for a given user
def get_recommendations(user_id):
    try:
        global model
        if model is None:
            print("[ERROR] Model is not available.")
            return None

        print(f"[DEBUG] Fetching movie data from the database for recommendations...")
        conn = psycopg2.connect(
            host=DB_HOST,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        cursor = conn.cursor()

        # Fetch all movies
        cursor.execute("SELECT tmdb_id FROM movies")
        movies_data = cursor.fetchall()
        
     
        # Get predictions for the user
        # Fetch movies already rated by the user
        cursor.execute("SELECT movie_id FROM ratings WHERE user_id = %s", (user_id,))
        rated_movies = {row[0] for row in cursor.fetchall()}

        predictions = []
        for movie in movies_data:
            if movie[0] not in rated_movies:  # Exclude already rated movies
                pred = model.predict(user_id, movie[0])
                predictions.append((movie[0], pred.est))

        predictions.sort(key=lambda x: x[1], reverse=True)
        top_movies = [{"movie_id": movie[0], "rating": movie[1]} for movie in predictions[:5]]
        
        cursor.close()
        conn.close()

        return top_movies
    except Exception as e:
        print(f"[ERROR] Error generating recommendations: {e}")
        return None

# Function to run the recommender in the background
def run_recommender():
    print("[DEBUG] Starting recommender system...")

    # Load data from the database
    df = fetch_ratings_from_db()

    # Check if data is loaded successfully
    if not df.empty:
        # Train the recommender system
        global model
        model = train_recommender(df)
        if model:
            print("[DEBUG] Recommender system is ready.")
        else:
            print("[ERROR] Model training failed.")
    else:
        print("[ERROR] No data found to train the model.")
