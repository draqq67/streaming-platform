const { Pool } = require("pg");
require("dotenv").config();
const axios = require("axios");
const { Worker, isMainThread, parentPort, workerData } = require("worker_threads");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  max: 20, // Increase max pool size for better concurrency
  idleTimeoutMillis: 3000, // Idle timeout to close unused connections
  connectionTimeoutMillis: 2000, // Timeout for getting a connection
});

const API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_URL = "https://api.themoviedb.org/3/movie";

// Fetch movie details from TMDB API
async function fetchMovieData(tmdb_id) {
  try {
    const { data } = await axios.get(`${TMDB_API_URL}/${tmdb_id}`, {
      params: { api_key: API_KEY, language: "en-US" },
    });
    return data;
  } catch (error) {
    console.error(`❌ Error fetching movie data for ID ${tmdb_id}:`, error.message);
    return null;
  }
}

// Fetch movie credits (cast + director)
async function fetchMovieCredits(tmdb_id) {
  try {
    const { data } = await axios.get(`${TMDB_API_URL}/${tmdb_id}/credits`, {
      params: { api_key: API_KEY },
    });
    return data;
  } catch (error) {
    console.error(`❌ Error fetching credits for ID ${tmdb_id}:`, error.message);
    return null;
  }
}

// Fetch movie trailer URL
async function fetchMovieTrailer(tmdb_id) {
  try {
    const { data } = await axios.get(`${TMDB_API_URL}/${tmdb_id}/videos`, {
      params: { api_key: API_KEY },
    });

    // Get the first trailer (if available)
    const trailer = data.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
  } catch (error) {
    console.error(`❌ Error fetching trailer for ID ${tmdb_id}:`, error.message);
    return null;
  }
}

// Insert movie into DB
async function insertMovieIntoDB(movie) {
  const insertQuery = `
    INSERT INTO movies (
      tmdb_id, title, overview, release_date, runtime,
      poster_path, backdrop_path, vote_average, genres,
      trailer_url, movie_cast, director, video_url
    ) VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9,
      $10, $11, $12, $13
    )
  `;

  const values = [
    movie.tmdb_id,
    movie.title,
    movie.overview,
    movie.release_date,
    movie.runtime,
    movie.poster_path,
    movie.backdrop_path,
    movie.vote_average,
    movie.genres,
    movie.trailer_url,
    movie.cast,
    movie.director,
    movie.video_url,
  ];
  // Check if the movie already exists in the database  
  const checkQuery = 'SELECT COUNT(*) FROM movies WHERE tmdb_id = $1';
  const checkValues = [movie.tmdb_id];
  const checkResult = await pool.query(checkQuery, checkValues);
  if (checkResult.rows[0].count > 0) {
    console.log(`Movie with ID ${movie.tmdb_id} already exists in the database.`);
    return; // Skip insertion if movie already exists
  }
  // If movie doesn't exist, proceed with insertion
  const client = await pool.connect(); // Get client from pool
  try {
    await client.query('BEGIN'); // Start transaction
    await client.query(insertQuery, values); // Execute insert query
    await client.query('COMMIT'); // Commit transaction
    console.log(`✅ Inserted: ${movie.title}`);
  } catch (error) {
    await client.query('ROLLBACK'); // Rollback transaction on error
    console.error(`❌ Insert failed [${movie.tmdb_id}]:`, error.message);
  } finally {
    client.release(); // Release the client back to the pool
  }
}

// Wrapper function to insert movie details into the database
async function insertMovieDatabase(tmdb_id) {
  const movieData = await fetchMovieData(tmdb_id);
  if (!movieData || movieData.vote_count < 500) return; // Skip movies with less than 1000 votes
  

  const creditsData = await fetchMovieCredits(tmdb_id);
  const trailerUrl = await fetchMovieTrailer(tmdb_id); // Fetch the trailer URL

  const movie = {
    tmdb_id: movieData.id,
    title: movieData.title,
    overview: movieData.overview,
    release_date: movieData.release_date,
    runtime: movieData.runtime,
    poster_path: movieData.poster_path,
    backdrop_path: movieData.backdrop_path,
    vote_average: movieData.vote_average,
    genres: movieData?.genres
  ? `{${movieData.genres.map(g =>
      `"${g.name.replace(/"/g, '\\"')}"`).join(',')}}`
  : null,
    trailer_url: trailerUrl, // Include the trailer URL here
    cast: creditsData?.cast
    ? `{${creditsData.cast.slice(0, 5).map(c =>
        `"${c.name.replace(/"/g, '\\"')} as ${c.character.replace(/"/g, '\\"')}"`).join(',')}}`
    : null,
    director: creditsData?.crew?.find(p => p.job === "Director")?.name || null,
    video_url: "not available", // Placeholder for video URL
  };

  await insertMovieIntoDB(movie);
}

// // Run insertion in batches
// const BATCH_SIZE = 250;
// const START_ID = 180000; // Starting TMDB ID
// const END_ID = 1000000; // Adjust as needed

// async function runInBatches() {
//   for (let i = START_ID; i <= END_ID; i += BATCH_SIZE) {
//     const batch = [];
//     for (let j = i; j < i + BATCH_SIZE && j <= END_ID; j++) {
//       batch.push(insertMovieDatabase(j)); // Push insertion tasks into the batch
//     }
//     await Promise.allSettled(batch); // Run all insertions in parallel
//     await new Promise(resolve => setTimeout(resolve, 500)); // Wait a bit before the next batch
//   }
// }


// runInBatches();
if (!isMainThread) {
  insertMovieDatabase(workerData.tmdb_id).then(() => {
    parentPort.postMessage({ done: true });
  });
}

// --- MAIN THREAD ---
if (isMainThread) {
  const dataset_file = "TMDB_movie_dataset_v11.csv";
  const dataset_path = path.join(__dirname, dataset_file);
  const ids = [];

  const MAX_CONCURRENCY = 4;
  let activeThreads = 0;
  let currentIndex = 0;

  function runNextBatch() {
    while (activeThreads < MAX_CONCURRENCY && currentIndex < ids.length) {
      const id = ids[currentIndex++];
      activeThreads++;

      const worker = new Worker(__filename, {
        workerData: { tmdb_id: id },
      });

      worker.on("message", () => {
        activeThreads--;
        runNextBatch(); // Launch next
      });

      worker.on("error", (err) => {
        console.error(`❌ Worker error:`, err);
        activeThreads--;
        runNextBatch();
      });
    }

    if (activeThreads === 0 && currentIndex >= ids.length) {
      console.log("✅ All movies processed.");
    }
  }

  fs.createReadStream(dataset_path)
    .pipe(csv())
    .on("data", (row) => {
      if (row.id) ids.push(row.id);
    })
    .on("end", () => {
      console.log("📥 CSV parsed, processing started...");
      runNextBatch();
    });
}