const express = require("express");
const { listMovies, uploadMovie,addRating, getMovieById } = require("../controllers/movieController");
const { upload } = require("../middleware/uploadMiddleware");
const { authenticateUser } = require("../middleware/authMiddleware");
const { authenticateToken } = require("../middleware/authMiddleware"); // Middleware pentru autentificare
const router = express.Router();

router.get("/", listMovies);
router.get("/:movieId",getMovieById);

router.post("/upload", authenticateUser, upload.single("video"), uploadMovie);
router.post("/:movieId/ratings", authenticateToken, addRating);
module.exports = router;
