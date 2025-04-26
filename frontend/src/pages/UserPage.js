import React, { useEffect, useState } from "react";
import { Container, Typography, Paper, Box, Button, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

const UserPage = () => {
  const [userData, setUserData] = useState(null);
  const [userComments, setUserComments] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [recommendedMovies, setRecommendedMovies] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
  
    const fetchUserData = async () => {
      try {
        const userId = user.userId;
        const token = localStorage.getItem("token");
  
        // Fetch user info
        const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setUserData(data);
  
        // Fetch comments
        const commentsResponse = await fetch(`http://localhost:5000/api/users/${userId}/comments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const commentsData = await commentsResponse.json();
  
        const enrichedComments = await Promise.all(
          commentsData.map(async (comment) => {
            try {
              const movieRes = await fetch(`http://localhost:5000/api/movies/${comment.movie_id}`);
              const movieData = await movieRes.json();
              return { ...comment, movieTitle: movieData.title };
            } catch (err) {
              console.error("Error fetching movie title:", err);
              return { ...comment, movieTitle: "Unknown Movie" };
            }
          })
        );
        setUserComments(enrichedComments);
  
        // Fetch recommendations from Python service
        const recRes = await fetch(`http://localhost:5001/recommend/${userId}`);
        const recommendedMovieIds = await recRes.json();
  
        // Enrich with movie details
        const recommended = await Promise.all(
          recommendedMovieIds.map(async (movieId) => {
            const res = await fetch(`http://localhost:5000/api/movies/${movieId}`);
            const movieData = await res.json();
            return movieData;
          })
        );
  
        setRecommendedMovies(recommended);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
  
    fetchUserData();
  }, [user, navigate]);
  console.log(userComments)
  const handleLogout = () => {
    logout();
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Header />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">User Profile</Typography>
            <Button variant="contained" color="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </Box>

          <Box mb={4}>
            <Typography variant="h6" gutterBottom>
              Account Information
            </Typography>
            <Typography>
              <strong>Username:</strong> {userData.username}
            </Typography>
            <Typography>
              <strong>Email:</strong> {userData.email}
            </Typography>
            <Typography>
              <strong>Role:</strong> {userData.role}
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              Your Comments
            </Typography>
            {userComments.length === 0 ? (
              <Typography>You haven't made any comments yet.</Typography>
            ) : (
              <Grid container spacing={2}>
                {userComments.map((comment) => (
                  <Grid item xs={12} key={comment.id}>
                    <Paper elevation={1} sx={{ p: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Movie Title: {comment.movieTitle}
                      </Typography>
                      <Typography>{comment.comment}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Posted on: {new Date(comment.created_at).toLocaleDateString()}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Paper>
        <Box mt={4}>
  <Typography variant="h6" gutterBottom>
    Recommended For You
  </Typography>
  {recommendedMovies.length === 0 ? (
    <Typography>No recommendations yet.</Typography>
  ) : (
    <Grid container spacing={2}>
      {recommendedMovies.map((movie) => (
        <Grid item xs={12} sm={6} md={4} key={movie.tmdb_id}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle1">{movie.title}</Typography>
            <Typography variant="body2">{movie.overview?.substring(0, 100)}...</Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  )}
    </Box>
      </Container>
      <Footer />
    </div>
  );
};

export default UserPage;