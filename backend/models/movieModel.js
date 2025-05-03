const pool = require("../config/db");

const getMovies = async () => {
    return pool.query("SELECT * FROM movies");
};

const addMovie = async (title, description, videoUrl, thumbnail) => {
    return pool.query(
        "INSERT INTO movies (title, description, video_url, thumbnail) VALUES ($1, $2, $3, $4) RETURNING *",
        [title, description, videoUrl, thumbnail]
    );
};

const deleteComment = async (commentId) => {
    return pool.query("DELETE FROM ratings WHERE movie_id = $1", [commentId]);
};
const getMovie = async (movieId) => {
    return pool.query("SELECT * FROM movies WHERE id = $1", [movieId]);
};

const getCommentsByMovie = async (movieId) => {
    return pool.query(
        "SELECT * FROM ratings WHERE movie_id = $1 ORDER BY created_at DESC",
        [movieId]
    );
};
const getMoviesbyTMDB = async (tmdbId) => {
    return pool.query("SELECT * FROM movies WHERE tmdb_id = $1", [tmdbId]);
};
module.exports = { getMovies, addMovie,deleteComment, getMovie, getCommentsByMovie,getMoviesbyTMDB};
