import React, { useEffect, useState } from "react";
import {
  Grid,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Button,
  Container,
  Box,
} from "@mui/material";
import { useAuth } from "../context/authContext";
import MovieCard from "../components/MovieCard";
import Footer from "../components/Footer";
import Header from "../components/Header";

const RatedList = () => {
  const { user } = useAuth();
  const [ratedMovies, setRatedMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [allGenres, setAllGenres] = useState([]);

  useEffect(() => {
    const fetchRatedMovies = async () => {
      if (!user) return;
      const token = user.token;

      try {
        const ratingsResponse = await fetch(
          `http://localhost:5000/api/users/${user.userId}/ratings`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const ratingsData = await ratingsResponse.json();

        const movies = await Promise.all(
          ratingsData.map(async (rating) => {
            const movieRes = await fetch(
              `http://localhost:5000/api/movies/tmdb/${rating.movie_id}`
            );
            return await movieRes.json();
          })
        );

        // Log movies for debugging
        console.log("Fetched movies:", movies);
        movies.sort((a, b) => a.title.localeCompare(b.title));
        setRatedMovies(movies);

        // Extract all unique genres
        const genresSet = new Set();
        movies.forEach((movie) => {
          if (Array.isArray(movie.genres)) {
            movie.genres.forEach((g) => genresSet.add(g));
          }
        });
        setAllGenres([...genresSet]);
        setFilteredMovies(movies);
      } catch (error) {
        console.error("Error fetching rated movies:", error);
      }
    };

    fetchRatedMovies();
  }, [user]);

  const handleSearch = () => {
    console.log("Filter button clicked");

    const filtered = ratedMovies.filter((movie) => {
      const matchesSearch =
        movie.title?.toLowerCase().includes(search.toLowerCase()) ||
        movie.director?.toLowerCase().includes(search.toLowerCase());

      const matchesGenre = genre ? movie.genres?.includes(genre) : true;
      const matchesVideo = onlyAvailable ? !!movie.video_url : true;

      return matchesSearch && matchesGenre && matchesVideo;
    });

    setFilteredMovies(filtered);
  };

  return (
    <>
      <Header />
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ color: "white" }}>
          Your Rated Movies
        </Typography>

        {/* Search & Filter Controls */}
        <Box display="flex" gap={2} mb={4} flexWrap="wrap" alignItems="center">
          <TextField
            label="Search by Title or Director"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputLabelProps={{ style: { color: "white" } }}
            InputProps={{ style: { color: "white" } }}
            style={{ color: "white" }}
          />

          <TextField
            label="Genre"
            variant="outlined"
            select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            InputLabelProps={{ style: { color: "white" } }}
            InputProps={{ style: { color: "white" } }}
            style={{ minWidth: 150, color: "white" }}
          >
            <MenuItem value="">All</MenuItem>
            {allGenres.map((g, i) => (
              <MenuItem key={i} value={g}>
                {g}
              </MenuItem>
            ))}
          </TextField>

          <FormControlLabel
            control={
              <Checkbox
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                style={{ color: "white" }}
              />
            }
            label="Has Video"
            style={{ color: "white" }}
          />

          <Button
            variant="contained"
            onClick={handleSearch}
            style={{ backgroundColor: "white", color: "black" }}
          >
            Filter
          </Button>
        </Box>

        {/* Display Filters' State
        <Box sx={{ color: "white" }}>
          <div>Search: {search}</div>
          <div>Genre: {genre}</div>
          <div>Only Available: {onlyAvailable.toString()}</div>
        </Box> */}

        {/* Display Movies */}
        <Grid container spacing={3}>
          {filteredMovies.length === 0 ? (
            <Typography variant="body1" sx={{ color: "white", ml: 2 }}>
              No movies found.
            </Typography>
          ) : (
            filteredMovies.map((movie, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <MovieCard movie={movie} />
              </Grid>
            ))
          )}
        </Grid>
      </Container>
      <Footer />
    </>
  );
};

export default RatedList;
