// routes/userRatingsUpload.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const pool = require("../config/db");
const { authenticateToken } = require("../middleware/authMiddleware"); // Importing authenticateToken

const upload = multer({ dest: "uploads/" });

router.post("/upload_ratings", authenticateToken, upload.single("file"), async (req, res) => {
  const filePath = req.file.path;
  const userId = req.user.id; // userId extracted from the JWT token
  console.log("Decoded userId from token:", userId);
  console.log("File path:", filePath);
  console.log(req.user)


  const results = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => {
      // Only push valid rows (must have both Name and Rating)
      if (data.Name && data.Rating) {
        results.push({
          name: data.Name.trim(),
          rating: parseFloat(data.Rating),
        });
      }
    })
    .on("end", async () => {
      try {
        const client = await pool.connect();

        for (const { name, rating } of results) {
          if (isNaN(rating) || !name) continue;

          // Resolve movie_id using tmdb_id from movie name
          const movieRes = await client.query(
            "SELECT tmdb_id FROM movies WHERE LOWER(title) = LOWER($1) LIMIT 1",
            [name]
          );

          if (movieRes.rows.length === 0) continue; // No matching movie
          
          const movieId = movieRes.rows[0].tmdb_id; // Use tmdb_id from the query result

          // Check if the user has already rated this movie
          const existing = await client.query(
            "SELECT * FROM ratings WHERE user_id = $1 AND movie_id = $2",
            [userId, movieId]
          );

          if (existing.rows.length === 0) {
            // Insert new rating if not already rated
            await client.query(
              "INSERT INTO ratings (user_id, movie_id, rating) VALUES ($1, $2, $3)",
              [userId, movieId, rating]
            );
          } else {
            // Update existing rating if already rated
            await client.query(
              "UPDATE ratings SET rating = $3 WHERE user_id = $1 AND movie_id = $2",
              [userId, movieId, rating]
            );
          }
        }

        client.release();
        fs.unlinkSync(filePath); // Clean up uploaded file
        res.status(200).json({ message: "Ratings uploaded successfully." });
      } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ error: "Server error while processing ratings." });
      }
    });
});

module.exports = router;
