import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Grid,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

const UserPage = () => {
  const [userData, setUserData] = useState(null);
  const [userComments, setUserComments] = useState([]);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);  // New state for top rated movies
  const [uploadStatus, setUploadStatus] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const userId = user.userId;
        const token = localStorage.getItem("token");

        // Fetch user data
        const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setUserData(data);

        // Fetch user comments
        const commentsResponse = await fetch(
          `http://localhost:5000/api/users/${userId}/comments`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const commentsData = await commentsResponse.json();

        // Enrich comments with movie titles
        const enrichedComments = await Promise.all(
          commentsData.map(async (comment) => {
            try {
              const movieRes = await fetch(
                `http://localhost:5000/api/movies/${comment.movie_id}`
              );
              const movieData = await movieRes.json();
              return { ...comment, movieTitle: movieData.title };
            } catch (err) {
              console.error("Error fetching movie title:", err);
              return { ...comment, movieTitle: "Unknown Movie" };
            }
          })
        );
        setUserComments(enrichedComments);

        // Fetch top rated movies
        const ratingsResponse = await fetch(
          `http://localhost:5000/api/users/${userId}/ratings`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const ratingsData = await ratingsResponse.json();
        console.log("User Ratings:", ratingsData);

        // Sort ratings and fetch top 5 rated movies
        const top5Movies = ratingsData
          .sort((a, b) => b.rating - a.rating) // Sort by rating in descending order
          .slice(0, 5); // Get top 5 movies

        // Fetch movie details for the top rated movies
        const topMovies = await Promise.all(
          top5Movies.map(async (rating) => {
            const movieRes = await fetch(
              `http://localhost:5000/api/movies/tmdb/${rating.movie_id}`
            );
            const movieData = await movieRes.json();
            return movieData;
          })
        );

        setTopRatedMovies(topMovies);
        console.log("Top Rated Movies:", topRatedMovies);

        // Fetch movie recommendations (existing code)
        const recRes = await fetch(
          `http://localhost:5001/recommend/${userId}`
        );
        const recommendedMovieIds = await recRes.json();
        console.log("Recommended Movie IDs:", recommendedMovieIds);
        const recommended = await Promise.all(
          recommendedMovieIds.map(async (movie) => {
            const res = await fetch(
              `http://localhost:5000/api/movies/tmdb/${movie.movie_id}`
            );
            const movieData = await res.json();
            return { ...movieData, expected_rating: movie.rating }; // Include the expected rating in the movie data
          })
        );

        setRecommendedMovies(recommended);

      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/users/upload_ratings", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();
      if (res.ok) {
        setUploadStatus({ success: true, message: result.message });
      } else {
        setUploadStatus({ success: false, message: result.error || "Upload failed" });
      }
    } catch (err) {
      console.error("Upload error:", err);
      setUploadStatus({ success: false, message: "An error occurred during upload." });
    }
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

          <Box mb={4}>
            <Typography variant="h6" gutterBottom>
              Upload Your Ratings CSV
            </Typography>
            <input type="file" accept=".csv" onChange={handleFileChange} />
            {uploadStatus && (
              <Alert severity={uploadStatus.success ? "success" : "error"} sx={{ mt: 2 }}>
                {uploadStatus.message}
              </Alert>
            )}
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

        {/* Use Grid to create two columns for Top Rated Movies and Recommended Movies */}

        <Grid container spacing={6} sx={{ display: "flex", justifyContent: "space-between" }}>
  {/* Top Rated Movies Section */}
 

  {/* Recommended Movies Section */}
  <Grid item xs={12} sm={5}>
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
              <Typography variant="body2">Expected Rating: {movie.expected_rating}</Typography>
              <Typography variant="body2">
                {movie.overview?.substring(0, 100)}...
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate(`/movies/${movie.id}`)}
                sx={{ mt: 1 }}
              >
                See Details
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    )}
  </Grid>
</Grid>
    

      </Container>
      <Footer />
    </div>
  );
};

export default UserPage;
