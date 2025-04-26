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

router.post("/upload", upload.single("file"), async (req, res) => {
    const userId = req.user.id;
    const filePath = path.join(__dirname, "../uploads", req.file.filename);
  
    const ratings = [];
  
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        ratings.push({
          user_id: userId,
          movie_id: parseInt(row.movie_id),
          rating: parseFloat(row.rating),
        });
      })
      .on("end", async () => {
        try {
          // Insert ratings into the DB
          for (const r of ratings) {
            await pool.query(
              "INSERT INTO ratings (user_id, movie_id, rating) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
              [r.user_id, r.movie_id, r.rating]
            );
          }
          res.json({ message: "Ratings uploaded successfully" });
        } catch (err) {
          res.status(500).json({ error: err.message });
        } finally {
          fs.unlinkSync(filePath);
        }
      });
  });
// Public: get comments for a movie
router.get("/movies/:movieId/comments", listCommentsbyMovie);
router.get("/users/:userId/comments", listCommentsbyUser);
// Authenticated user: post comment
router.post("/movies/:movieId/comments", authenticateToken, createComment);

module.exports = router;
