# recommender.py
import pandas as pd
from surprise import Dataset, Reader, SVD
from surprise.model_selection import train_test_split

def recommend_for_user(user_id, ratings_csv_path="ratings.csv"):
    df = pd.read_csv(ratings_csv_path)
    
    reader = Reader(rating_scale=(0.5, 5.0))
    data = Dataset.load_from_df(df[['user_id', 'movie_id', 'rating']], reader)
    trainset = data.build_full_trainset()

    model = SVD()
    model.fit(trainset)

    rated_movies = df[df.user_id == user_id].movie_id.tolist()
    all_movies = df.movie_id.unique()

    # Predict for unseen movies
    predictions = []
    for movie_id in all_movies:
        if movie_id not in rated_movies:
            est = model.predict(user_id, movie_id).est
            predictions.append((movie_id, est))

    predictions.sort(key=lambda x: x[1], reverse=True)
    top_movies = [movie_id for movie_id, _ in predictions[:5]]
    return top_movies
