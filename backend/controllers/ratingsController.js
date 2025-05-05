const {
    getCommentsByMovie,
    addComment,
    deleteComment,
    getCommentsByUser,
    getRatings,
} = require("../models/ratingsModel");
const  pool =  require("../config/db");

const listCommentsbyMovie = async (req, res) => {
    const { movieId } = req.params;

    try {
        const result = await getCommentsByMovie(movieId);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch comments" });
    }
};
const listCommentsbyUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await getCommentsByUser(userId);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch comments" });
    }
}

const createComment = async (req, res) => {
    const { comment, rating, userId, movieId } = req.body;
    try {
        const result = await addComment(userId, movieId, rating, comment);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to post comment" });
    }
};
// Inside removeComment controller function
const removeComment = (req, res) => {
    console.log(req.user); // Log the user object to verify the role
    if (req.user && req.user.role === "admin") {
      // Proceed with the comment deletion
    } else {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }
  };
  const listRatingsByUser = async (req, res) => {
    const { userId } = req.params;
    console.log(userId)
    try {
        const result = await getRatings(userId);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch comments" });
    }
}
const changeRating = async (req, res) => {
    const { userId, movieId } = req.params;
    const { rating } = req.body;
    console.log("Received rating:", rating);
    console.log("Received userId:", userId);
    console.log("Received movieId:", movieId);
  
    try {
      const result = await pool.query(
        'UPDATE ratings SET rating = $1 WHERE user_id = $2 AND movie_id = ( Select tmdb_id from movies where id=$3 ) RETURNING *',
        [rating, userId, movieId]
      );

  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Rating not found' });
      }
  
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error updating rating:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
};
module.exports = {
    listCommentsbyMovie,
    listCommentsbyUser,
    createComment,
    removeComment,
    listRatingsByUser,
    changeRating
};
