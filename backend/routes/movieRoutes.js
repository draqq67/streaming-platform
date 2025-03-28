const express = require("express");
const { listMovies, uploadMovie } = require("../controllers/movieController");
const { upload } = require("../middleware/uploadMiddleware");
const { authenticateUser } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", listMovies);
router.post("/upload", authenticateUser, upload.single("video"), uploadMovie);

module.exports = router;
