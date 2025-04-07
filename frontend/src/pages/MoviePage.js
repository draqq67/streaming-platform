import React, { useEffect, useState } from "react";
import { Grid, Typography, TextField, Button, Paper, Box } from "@mui/material";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const MoviePage = () => {
  const [movie, setMovie] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const { movieId } = useParams(); // Get movie ID from URL params

  useEffect(() => {
    // Fetch movie details by movieId
    console.log(movieId)
    fetch(`http://localhost:5000/api/movies/${movieId}`)
      .then((res) => res.json())
      .then((data) => setMovie(data))
      .catch((err) => console.error("Error loading movie:", err));

    // Fetch comments for the movie
    fetch(`http://localhost:5000/api/movies/${movieId}/comments`)
      .then((res) => res.json())
      .then((data) => setComments(data))
      .catch((err) => console.error("Error loading comments:", err));
  }, [movieId]);

  const handleCommentSubmit = (e) => {
    e.preventDefault();

    // Post new comment
    const token = localStorage.getItem("token");
    fetch(`http://localhost:5000/api/movies/${movieId}/comments`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: newComment }),
    })
      .then((res) => res.json())
      .then((data) => {
        setComments([...comments, data]); // Add new comment to the list
        setNewComment(""); // Clear the comment input field
      })
      .catch((err) => console.error("Error posting comment:", err));
  };

  if (!movie) return <div>Loading...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <Header />
      <Grid container spacing={4}>
        <Grid item xs={10} md={8}>
          {/* Movie Details */}
          <Paper elevation={7} style={{  width:"100vh", minHeight: "100vh", padding: "20px" }}>
            <Typography variant="h4" gutterBottom>{movie.title}</Typography>
            <img src={movie.thumbnail} alt={movie.title} style={{ width: "100%" }} />
            <Typography variant="body1" style={{ marginTop: "20px" }}>
              {movie.description}
            </Typography>

            <Box mt={3}>
              {/* Video Player */}
              <iframe
                width="100%"
                height="400"
                src={movie.video_url}
                title={movie.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          {/* Comments Section */}
          <Paper elevation={3} style={{ padding: "20px" }}>
            <Typography variant="h6" gutterBottom>Comments</Typography>
            {comments.length === 0 ? (
              <Typography>No comments yet. Be the first to comment!</Typography>
            ) : (
              comments.map((comment, index) => (
                <Box key={index} mb={2}>
                  <Typography variant="body2" color="textSecondary">{comment.username}</Typography>
                  <Typography>{comment.text}</Typography>
                </Box>
              ))
            )}
          </Paper>

          {/* Comment Form */}
          <Paper elevation={3} style={{  width:"80vh", minHeight: "100vh", padding: "20px" }}>
            <Typography variant="h6" gutterBottom>Leave a Comment</Typography>
            <form onSubmit={handleCommentSubmit}>
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
          </Paper>
        </Grid>
        
      </Grid>

      <Footer />
    </div>
  );
};

export default MoviePage;
