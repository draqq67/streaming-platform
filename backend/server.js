require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const movieRoutes = require("./routes/movieRoutes");
const userRatingsUpload = require("./routes/userRatingsUpload");
const watchlistRoutes = require('./routes/watchlistRoutes');



const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/users", userRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api", require("./routes/ratingsRoutes"));

app.use('/api/users', watchlistRoutes);

// router.get("/recommend/:userId", async (req, res) => {
//   const userId = parseInt(req.params.userId);
//   // Run Python script here or call a recommender module that uses SVD
//   const recommendations = await getRecommendations(userId); // returns list of movie_ids
//   const movies = await pool.query("SELECT * FROM movies WHERE tmdb_id = ANY($1)", [recommendations]);
//   res.json(movies.rows);
// });

app.use("/api/users", userRatingsUpload);
app.get("/", (req, res) => {
  res.send("API is running...");
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
