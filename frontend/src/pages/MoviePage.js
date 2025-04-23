import React, { useEffect, useState } from "react";
import { Grid, Typography, TextField, Button, Paper, Box, Alert,Chip } from "@mui/material";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/authContext"; 
import VideoPlayer from "../components/VideoPlayer";

const MoviePage = () => {
  const [movie, setMovie] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(0); // New state for rating
  const { movieId } = useParams();
  const { user } = useAuth();

  useEffect(() => {
    const fetchMovieAndComments = async () => {
      try {
        const movieRes = await fetch(`http://localhost:5000/api/movies/${movieId}`);
        const movieData = await movieRes.json();
        setMovie(movieData);

        const commentsRes = await fetch(`http://localhost:5000/api/movies/${movieId}/comments`);
        const commentsData = await commentsRes.json();

        const enrichedComments = await Promise.all(
          commentsData.map(async (comment) => {
            if (!comment.user_id) {
              return comment;
            }
        
            try {
              const userRes = await fetch(`http://localhost:5000/api/users/${comment.user_id}`);
              const userData = await userRes.json();
              return { ...comment, username: userData.username };
            } catch (err) {
              console.error("Error fetching username:", err);
              return { ...comment, username: "Unknown" };
            }
          })
        );
        

        setComments(enrichedComments);
      } catch (err) {
        console.error("Error loading movie or comments:", err);
      }
    };

    fetchMovieAndComments();
  }, [movieId]);

  const handleCommentSubmit = (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    fetch(`http://localhost:5000/api/movies/${movieId}/comments`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user?.userId,
        movieId: movieId,
        comment: newComment,
        rating: rating,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (user && user.userId) {
          fetch(`http://localhost:5000/api/users/${user.userId}`, {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          })
            .then((res) => res.json())
            .then((userData) => {
              const enrichedComment = { ...data, username: userData.username, rating: rating };
              setComments([...comments, enrichedComment]);
            })
            .catch((err) => {
              console.error("Error fetching user data for comment:", err);
              setComments([...comments, { ...data, username: "You", rating: rating }]);
            });
        } else {
          setComments([...comments, { ...data, username: "You", rating: rating }]);
        }

        setNewComment("");
        setRating(0);
      })
      .catch((err) => console.error("Error posting comment:", err));
  };
  const parsedCast = movie?.movie_cast?.map(actorStr => {
    const [name, role] = actorStr.split(" as ");
    return {
      name: name?.trim() || "",
      role: role?.trim() || "Unknown",
    };
  }) || [];
  if (!movie) return <div>Loading...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <Header />
      <Grid container spacing={4}>
        <Grid item xs={10} md={8}>
        <Paper elevation={7} style={{ padding: "20px", textAlign: "center" }}>
            <Typography variant="h4" gutterBottom>
              {movie.title}
            </Typography>

            {/* Poster Image */}
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              style={{ width: "100%", maxWidth: "400px", marginBottom: "20px", margin: "0 auto" }}
            />

            {/* Movie Overview */}
            <Typography variant="body1" style={{ marginTop: "20px" }}>
              {movie.overview}
            </Typography>
            {/* Movie Top cast */}
            <Box mt={2} textAlign="center">
              <Typography variant="body2" color="textSecondary">
                <strong>Top Cast:</strong>
                {parsedCast.length > 0
              ? parsedCast.map((actor, index) => (
                  <Chip key={index} label={`${actor.name} (${actor.role})`} style={{ margin: "5px" }} />
                ))
              : "N/A"}
              </Typography>
            </Box>
            {/* Movie Director */}
            <Box mt={2} textAlign="center">
              <Typography variant="body2" color="textSecondary">
                <strong>Director:</strong> {movie.director || "N/A"}
              </Typography>
            </Box>
            
            {/* Movie Release Date and Runtime */}
            <Box mt={2} textAlign="center">
              <Typography variant="body2" color="textSecondary">
                <strong>Release Date:</strong> {new Date(movie.release_date).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Runtime:</strong> {movie.runtime} minutes
              </Typography>
            </Box>

            {/* Movie Rating */}
            <Box mt={2} textAlign="center">
              <Typography variant="body2" color="textSecondary">
                <strong>Rating:</strong> ⭐ {movie.vote_average}/10
              </Typography>
            </Box>

            {/* Movie Genres */}
            <Box mt={2} textAlign="center">
              <Typography variant="body2" color="textSecondary">
                <strong>Genres:</strong>
                {movie.genres && movie.genres.length > 0
                  ? movie.genres.map((genre, index) => (
                      <Chip key={index} label={genre} style={{ margin: "5px" }} />
                    ))
                  : " N/A"}
              </Typography>
            </Box>

            {/* Movie Backdrop Image */}
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.backdrop_path}`}
              alt={movie.title}
              style={{ width: "100%", maxWidth: "800px", marginTop: "20px" }}
            />
            {/* Video Player */}
            <Box mt={3}>
              <VideoPlayer
                videoUrl={movie.trailer_url || movie.video_url}
                title={movie.title}
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} style={{ padding: "20px" }}>
            <Typography variant="h6" gutterBottom>Comments</Typography>
            {comments.length === 0 ? (
              <Typography>No comments yet. Be the first to comment!</Typography>
            ) : (
              comments.map((comment, index) => (
                <Box key={index} mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    {comment.username} {comment.rating ? `• ⭐ ${comment.rating}/5` : ""}
                  </Typography>
                  <Typography>{comment.comment}</Typography>
                </Box>
              ))
            )}
          </Paper>

          {/* Comment Form - Only for logged in users */}
          <Paper elevation={3} style={{ width: "80vh", minHeight: user ? "20vh" : "auto", padding: "20px", marginTop: "20px" }}>
            <Typography variant="h6" gutterBottom>Leave a Comment</Typography>
            
            {user ? (
              <form onSubmit={handleCommentSubmit}>
                <TextField
                  fullWidth
                  label="Rating (1-10)"
                  type="number"
                  inputProps={{ min: 1, max: 10 }}
                  variant="outlined"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  required
                />
                <Box mt={2} />
                <TextField
                  fullWidth
                  label="Your Comment"
                  variant="outlined"
                  multiline
                  rows={4}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                />
                <Box mt={2}>
                  <Button type="submit" variant="contained" color="primary">
                    Submit Comment
                  </Button>
                </Box>
              </form>
            ) : (
              <Box>
                <Alert severity="info">
                  You need to be logged in to add comments.
                </Alert>
                <Button 
                  component={Link} 
                  to="/login" 
                  variant="contained" 
                  color="primary"
                  sx={{ mt: 2 }}
                >
                  Log in to comment
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      <Footer />
    </div>
  );
};

export default MoviePage;
