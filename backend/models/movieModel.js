const pool = require("../config/db");

const getMovies = async () => {
    return pool.query("SELECT * FROM movies");
};

const addMovie = async (title, description, videoUrl, thumbnail) => {
    return pool.query(
        "INSERT INTO movies (title, description, video_url, thumbnail) VALUES ($1, $2, $3, $4) RETURNING *",
        [title, description, videoUrl, thumbnail]
    );
};

module.exports = { getMovies, addMovie };
