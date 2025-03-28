const { getMovies, addMovie } = require("../models/movieModel");
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

module.exports = { listMovies, uploadMovie };
