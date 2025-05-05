import React, { useEffect, useState } from "react";
import { Grid, Paper, Typography, Box, Button, Card, CardMedia, CardContent } from "@mui/material";
import { useAuth } from "../context/authContext";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const UserPage = () => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (user) {
        try {
          const response = await fetch(`http://localhost:5000/api/users/${user.userId}/watchlist`);
          const movieIds = await response.json();

          if (Array.isArray(movieIds)) {
            // Fetch full movie details
            const movieDetails = await Promise.all(
              movieIds.map(async (entry) => {
                const movieId = entry.movie_id || entry; // handle array of objects or IDs
                const res = await fetch(`http://localhost:5000/api/movies/${movieId}`);
                return res.ok ? await res.json() : null;
              })
            );

            // Filter out nulls (failed fetches)
            setMovies(movieDetails.filter((movie) => movie));
          } else {
            console.error("Watchlist is not an array:", movieIds);
          }
        } catch (err) {
          console.error("Error fetching watchlist:", err);
        }
      }
    };

    fetchWatchlist();
  }, [user]);

  if (!user) {
    return (
      <div>
        <Header />
        <Box textAlign="center" mt={4}>
          <Typography variant="h5">Please log in to view your watchlist.</Typography>
          <Button component={Link} to="/login" variant="contained" color="primary" style={{ marginTop: "20px" }}>
            Log In
          </Button>
        </Box>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <Grid container spacing={3} style={{ padding: "30px" }}>
        <Grid item xs={12}>
          <Paper elevation={3} style={{ padding: "20px", textAlign: "center" }}>
            <Typography variant="h4" gutterBottom>My Watchlist</Typography>
            {movies.length === 0 ? (
              <Typography>No movies in your watchlist yet.</Typography>
            ) : (
              <Grid container spacing={2}>
                {movies.map((movie) => (
                  <Grid item xs={12} sm={6} md={4} key={movie.id}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="300"
                        image={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                      />
                      <CardContent>
                        <Typography variant="h6">{movie.title}</Typography>
                        <Button
                          component={Link}
                          to={`/movies/${movie.id}`}
                          variant="outlined"
                          color="primary"
                          style={{ marginTop: "10px" }}
                        >
                          View Movie
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
      <Footer />
    </div>
  );
};

export default UserPage;
