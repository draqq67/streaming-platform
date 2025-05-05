const express = require("express");
const router = express.Router();
const {
    createComment,
    listCommentsbyMovie,
    listCommentsbyUser,
    listRatingsByUser,
    changeRating
  } = require("../controllers/ratingsController");

const {
    authenticateToken,
} = require("../middleware/authMiddleware");


// Public: get comments for a movie
router.get("/movies/:movieId/comments", listCommentsbyMovie);
router.get("/users/:userId/comments", listCommentsbyUser);
router.get("/users/:userId/ratings", listRatingsByUser);
// Authenticated user: post comment
router.post("/movies/:movieId/comments", authenticateToken, createComment);
router.put('/users/:userId/ratings/:movieId',changeRating);

module.exports = router;
