const { getMovies, addMovie,getMovie,getMoviesbyTMDB} = require("../models/movieModel");
const { uploadToGCS } = require("../config/gcloud");

const listMovies = async (req, res) => {
    try {
        const movies = await getMovies();
        res.json(movies.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const uploadMovie = async (req, res) => {
    const { title, description } = req.body;

    try {
        const videoUrl = await uploadToGCS(req.file);
        const newMovie = await addMovie(title, description, videoUrl, "thumbnail.jpg");
        res.json(newMovie.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const addRating = async (req, res) => {
    const { movieId } = req.params; // ID-ul filmului
    const { comment } = req.body; // Comentariul
    const userId = req.user.userId; // ID-ul utilizatorului din JWT
  
    try {
      // Inserăm comentariul în baza de date
      const result = await pool.query(
        "INSERT INTO ratings (user_id, movie_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING id, comment, created_at",
        [movieId, userId, comment]
      );
  
      // Returnăm comentariul adăugat
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to post comment" });
    }

};
const deleteCommentById = async (req, res) => {
    const { commentId } = req.params;

    try {
        await deleteComment(commentId);
        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getMovieById = async (req, res) => {
    const { movieId } = req.params;

    try {
        const movie = await getMovie(movieId);
        console.log(movieId)
        if (movie.rows.length === 0) {
            return res.status(404).json({ error: "Movie not found" });
        }
        res.json(movie.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
const getMoviebyTMDBId = async (req, res) => {
    const { tmdbId } = req.params;

    try {
        const movie = await getMoviesbyTMDB(tmdbId);
        if (movie.rows.length === 0) {
            return res.status(404).json({ error: "Movie not found" });
        }
        res.json(movie.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
const getCommentsByMovie = async (req, res) => {
    const { movieId } = req.params;

    try {
        const comments = await getCommentsByMovie(movieId);
        res.json(comments.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


module.exports = { listMovies, uploadMovie, addRating,deleteCommentById, getMovieById, getCommentsByMovie,getMoviebyTMDBId };
