const express = require("express");
const { listMovies, uploadMovie,addRating, getMovieById, getMoviebyTMDBId } = require("../controllers/movieController");
const { upload } = require("../middleware/uploadMiddleware");
const { authenticateUser } = require("../middleware/authMiddleware");
const { authenticateToken } = require("../middleware/authMiddleware"); // Middleware pentru autentificare
const router = express.Router();

router.get("/", listMovies);
router.get("/:movieId",getMovieById);
router.get("/tmdb/:tmdbId", getMoviebyTMDBId); // Endpoint pentru a obține detalii despre un film după tmdb_id

router.post("/upload", authenticateUser, upload.single("video"), uploadMovie);
// router.post("/:movieId/ratings", authenticateToken, addRating);
module.exports = router;
