const {
    getCommentsByMovie,
    addComment,
    deleteComment,
    getCommentsByUser,
} = require("../models/ratingsModel");

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
    const { movieId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId;

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
  
module.exports = {
    listCommentsbyMovie,
    listCommentsbyUser,
    createComment,
    removeComment,
};
