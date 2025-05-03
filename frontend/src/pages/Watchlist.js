import React, { useEffect, useState } from "react";
import { Grid, Paper, Typography, Box, Button } from "@mui/material";
import { useAuth } from "../context/authContext";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const UserPage = () => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (user) {
        try {
          const response = await fetch(`http://localhost:5000/api/users/${user.userId}/watchlist`);
          const data = await response.json();
          setWatchlist(data);
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
            {watchlist.length === 0 ? (
              <Typography>No movies in your watchlist yet.</Typography>
            ) : (
              <div>
                {watchlist.map((movie) => (
                  <Box key={movie.tmdb_id} mt={2}>
                    <Typography variant="h6">{movie.title}</Typography>
                    <Button component={Link} to={`/movie/${movie.tmdb_id}`} variant="outlined" color="primary">
                      View Movie
                    </Button>
                  </Box>
                ))}
              </div>
            )}
          </Paper>
        </Grid>
      </Grid>
      <Footer />
    </div>
  );
};

export default UserPage;
