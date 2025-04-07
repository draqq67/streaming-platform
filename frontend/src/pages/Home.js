import React, { useEffect, useState } from "react";
import { Grid, Typography } from "@mui/material";
import MovieCard from "../components/MovieCard"; // Import the MovieCard component
import Header from "../components/Header"; // Import the Header component
import Footer from "../components/Footer"; // Import the Footer component
import { jwtDecode } from "jwt-decode"; // For decoding the JWT token

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch movies
    fetch("http://localhost:5000/api/movies") // Adjust if needed (use /api/movies if public)
      .then((res) => res.json())
      .then((data) => setMovies(data))
      .catch((err) => console.error("Error loading movies:", err));

    // Check if a token exists in localStorage and decode it
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token); // Decode the JWT token
        const userId = decodedToken.userId; // Get the userId from the decoded token

        // Send the userId to the backend to fetch the user details
        fetch(`http://localhost:5000/api/users/${userId}`) // Adjust the endpoint
          .then((res) => res.json())
          .then((userData) => setUser(userData))
          .catch((err) => console.error("Error fetching user data:", err));
      } catch (error) {
        console.error("Error decoding token", error);
      }
    }
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <Header />
      <div>
        {user ? (
          <Typography variant="h5" gutterBottom>
            Hello, {user.username} {/* Assuming 'user' contains 'username' */}
          </Typography>
        ) : (
          <Typography variant="h5" gutterBottom>
            Welcome, Guest!
          </Typography>
        )}
      </div>
      <h2>Featured Movies</h2>
      <Grid container spacing={4}>
        {movies.map((movie) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
            <MovieCard movie={movie} />
          </Grid>
        ))}
      </Grid>
      <Footer />
    </div>
  );
};

export default HomePage;
