const pool = require("../config/db");

const getCommentsByMovie = async (movieId) => {
    return pool.query(
        "SELECT * FROM ratings WHERE movie_id = $1 ORDER BY created_at DESC",
        [movieId]
    );
};
const getCommentsByUser = async (userId) => {
    return pool.query(
        "SELECT * FROM ratings WHERE user_id = $1 ORDER BY created_at DESC",
        [userId]
    );
}
const addComment = async (userId, movieId, rating, comment) => {
    return pool.query(
        "INSERT INTO ratings (user_id, movie_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *",
        [userId, movieId, rating, comment]
    );
};

const deleteComment = async (commentId) => {
    return pool.query("DELETE FROM ratings WHERE id = $1", [commentId]);
};

module.exports = {
    getCommentsByMovie,
    addComment,
    deleteComment,
    getCommentsByUser   
};
