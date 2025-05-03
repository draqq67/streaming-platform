import psycopg2
import csv
from psycopg2.extras import execute_values
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASS")

BATCH_SIZE = 1000

def get_valid_tmdb_ids():
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        cursor = conn.cursor()
        cursor.execute("SELECT tmdb_id FROM movies")
        ids = {int(row[0]) for row in cursor.fetchall()}
        print(f"Loaded {len(ids)} valid tmdb_ids from movies table.")
        cursor.close()
        conn.close()
        return ids
    except Exception as e:
        print(f"Error loading tmdb_ids: {e}")
        return set()

def load_csv_to_db(csv_path):
    valid_ids = get_valid_tmdb_ids()
    inserted_count = 0

    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        cursor = conn.cursor()
        with open(csv_path, newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            batch = []
            for row in reader:
                try:
                    user_id = int(row['userId'])
                    movie_id = int(row['movieId'])
                    rating = float(row['rating'])

                    if movie_id in valid_ids:
                        batch.append((user_id, movie_id, rating))

                    if len(batch) >= BATCH_SIZE:
                        execute_values(
                            cursor,
                            "INSERT INTO ratings (user_id, movie_id, rating) VALUES %s",
                            batch
                        )
                        conn.commit()
                        inserted_count += len(batch)
                        print(f"Inserted {inserted_count} rows so far...")
                        batch = []

                except Exception as e:
                    print(f"Skipping row due to error: {e}")

            # Insert remaining
            if batch:
                execute_values(
                    cursor,
                    "INSERT INTO ratings (user_id, movie_id, rating) VALUES %s",
                    batch
                )
                conn.commit()
                inserted_count += len(batch)
                print(f"Inserted {inserted_count} total rows.")

        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Database error: {e}")

if __name__ == "__main__":
    csv_file = os.path.join(os.getcwd(), "recommender", "ratings.csv")
    load_csv_to_db(csv_file)
