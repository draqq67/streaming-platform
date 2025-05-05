import React, { useEffect, useState } from "react";
import {
  Grid,
  Typography,
  TextField,
  Box,
  MenuItem,
  Button,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import MovieCard from "../components/MovieCard";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { jwtDecode } from "jwt-decode";

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [user, setUser] = useState(null);

  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const [allGenres, setAllGenres] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/movies")
      .then((res) => res.json())
      .then((data) => {
        setMovies(data);

        // Extract unique genres
        const genres = new Set();
        data.forEach((movie) => {
          if (Array.isArray(movie.genres)) {
            movie.genres.forEach((g) => genres.add(g));
          } else if (typeof movie.genres === "string") {
            movie.genres.replace(/[{}"]/g, "").split(",").forEach((g) => genres.add(g.trim()));
          }
        });
        setAllGenres([...genres]);
      })
      .catch((err) => console.error("Error loading movies:", err));

    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId;

        fetch(`http://localhost:5000/api/users/${userId}`)
          .then((res) => res.json())
          .then((userData) => setUser(userData))
          .catch((err) => console.error("Error fetching user data:", err));
      } catch (error) {
        console.error("Error decoding token", error);
      }
    }
  }, []);

  // Apply genre & video filters on button click
  const [filteredMovies, setFilteredMovies] = useState([]);

  const handleSearch = () => {
    const result = movies.filter((movie) => {
      // Check if the genre matches or if no genre filter is applied
      const genreMatch =
        !genre ||
        (Array.isArray(movie.genres)
          ? movie.genres.includes(genre)
          : typeof movie.genres === "string" && movie.genres.includes(genre));
  
      // Check if the video is available based on the 'Has Video' checkbox
      const hasVideoMatch = !onlyAvailable || movie.video_url !== "not available";
  
      return genreMatch && hasVideoMatch;
    });
  
    setFilteredMovies(result);
  };
  
  
  const liveFiltered = (filteredMovies.length > 0 ? filteredMovies : movies).filter((movie) => {
    return (
      movie.title?.toLowerCase().includes(search.toLowerCase()) ||
      movie.director?.toLowerCase().includes(search.toLowerCase())
    );
  });
  

  return (
    <div style={{ padding: "20px" }}>
      <Header />
      <div>
        {user ? (
          <Typography variant="h5" gutterBottom>
            Hello, {user.username}
          </Typography>
        ) : (
          <Typography variant="h5" gutterBottom>
            Welcome, Guest!
          </Typography>
        )}
      </div>

      {/* Search & Filter Controls */}
      <Box display="flex" gap={2} mb={4} flexWrap="wrap" alignItems="center" >
        <TextField
          label="Search by Title or Director"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <TextField
          label="Genre"
          variant="outlined"
          select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          style={{ minWidth: 150 }}
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
            />
          }
          label="Has Video"
        />
        <Button variant="contained" onClick={handleSearch}>
          Filter
        </Button>
      </Box>

      <h2>Featured Movies</h2>
      <Grid container spacing={4}>
        {liveFiltered.slice(0, 50).length > 0 ? (
          liveFiltered.slice(0, 50).map((movie) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
              <MovieCard movie={movie} />
            </Grid>
          ))
        ) : (
          <Typography variant="body1" style={{ marginLeft: 10 }}>
            No matching movies found.
          </Typography>
        )}
      </Grid>

      <Footer />
    </div>
  );
};

export default HomePage;
