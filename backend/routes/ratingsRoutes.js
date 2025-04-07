const express = require("express");
const router = express.Router();
const {
    createComment,
    listCommentsbyMovie,
    listCommentsbyUser
} = require("../controllers/ratingsController");

const {
    authenticateToken,
} = require("../middleware/authMiddleware");

// Public: get comments for a movie
router.get("/movies/:movieId/comments", listCommentsbyMovie);
router.get("/users/:userId/comments", listCommentsbyUser);
// Authenticated user: post comment
router.post("/movies/:movieId/comments", authenticateToken, createComment);

module.exports = router;
