const express = require("express");
const router = express.Router();
const {
  listMovies,
  uploadMovie,
} = require("../controllers/movieController");

const {
  removeComment,
} = require("../controllers/ratingsController");

const { authenticateToken, checkAdmin } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");

// 🔐 Apply middleware to all routes in this file
router.use(authenticateToken); // Only authenticate the token

// 🎬 GET all movies (No need to check admin here if it's not required)
router.get("/movies", listMovies);

// 📤 Upload a new movie (with video file) - Admin only
router.post("/movies", upload.single("file"), checkAdmin, uploadMovie);

// ❌ Delete a comment (admin only)
router.delete("/comments/:commentId", checkAdmin, removeComment);

module.exports = router;
