import React, { useEffect, useState } from "react";
import { Grid, Typography, TextField, Button, Paper, Box, Alert, Chip } from "@mui/material";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/authContext";
import VideoPlayer from "../components/VideoPlayer";
import WatchList from "./Watchlist";

const MoviePage = () => {
  const [movie, setMovie] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [userRating, setUserRating] = useState(null);
  const [ratingInput, setRatingInput] = useState("");
  const [watchlistAdded, setWatchlistAdded] = useState(false); // State to track watchlist status
  const { movieId } = useParams();
  const { user } = useAuth();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [movieRes, commentsRes] = await Promise.all([
          fetch(`http://localhost:5000/api/movies/${movieId}`),
          fetch(`http://localhost:5000/api/movies/${movieId}/comments`)
        ]);

        const movieData = await movieRes.json();
        setMovie(movieData);

        const commentsData = await commentsRes.json();
        const enrichedComments = await Promise.all(
          commentsData.map(async (comment) => {
            if (!comment.user_id) return comment;
            try {
              const userRes = await fetch(`http://localhost:5000/api/users/${comment.user_id}`);
              const userData = await userRes.json();
              return { ...comment, username: userData.username };
            } catch {
              return { ...comment, username: "Unknown" };
            }
          })
        );
        setComments(enrichedComments);

        if (user && user.userId) {
          const ratingRes = await fetch(`http://localhost:5000/api/users/${user.userId}/ratings`);
          const ratingData = await ratingRes.json();
          const ratingForMovie = ratingData.find(r => r.movie_id === movieData.tmdb_id);
          if (ratingForMovie) setUserRating(ratingForMovie.rating);

          // Check if movie is in watchlist
          const watchlistRes = await fetch(`http://localhost:5000/api/users/${user.userId}/watchlist`);
          const watchlistData = await watchlistRes.json();
          const isMovieInWatchlist = watchlistData.some((item) => item.movie_id === movieData.id);
          setWatchlistAdded(isMovieInWatchlist);
        }
      } catch (err) {
        console.error("Error fetching movie or comments:", err);
      }
    };

    fetchAll();
  }, [movieId, user]);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    fetch(`http://localhost:5000/api/movies/${movieId}/comments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user?.userId,
        movieId: movieId,
        comment: newComment,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        const enriched = { ...data, username: user?.username || "You" };
        setComments([...comments, enriched]);
        setNewComment("");
      })
      .catch((err) => console.error("Error posting comment:", err));
  };

  const handleRatingSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (userRating !== null) {
      fetch(`http://localhost:5000/api/ratings/${userRating.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: parseFloat(ratingInput),
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setUserRating(data.rating);
          setRatingInput("");
        })
        .catch((err) => console.error("Error updating rating:", err));
    } else {
      fetch(`http://localhost:5000/api/ratings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.userId,
          movieId: movieId,
          rating: parseFloat(ratingInput),
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setUserRating(data.rating);
          setRatingInput("");
        })
        .catch((err) => console.error("Error submitting rating:", err));
    }
  };

  const handleAddToWatchlist = () => {
    if (!user) {
      alert("Please log in to add to your watchlist");
      return;
    }

    const token = localStorage.getItem("token");

    fetch(`http://localhost:5000/api/users/${user.userId}/watchlist`, {
      method: watchlistAdded ? "DELETE" : "POST", // If movie is in watchlist, remove it
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        movieId: movieId,
      }),
    })
      .then(() => {
        setWatchlistAdded(!watchlistAdded); // Toggle watchlist status
      })
      .catch((err) => console.error("Error adding/removing movie from watchlist:", err));
  };

  const parsedCast = movie?.movie_cast?.map(actorStr => {
    const [name, role] = actorStr.split(" as ");
    return { name: name?.trim() || "", role: role?.trim() || "Unknown" };
  }) || [];

  if (!movie) return <div>Loading...</div>;

  return (
    <div style={{ padding: "30px", backgroundColor: "#f4f4f4" }}>
      <Header />
      <Grid container spacing={6}>
        <Grid item xs={12} md={6} style={{width: "50%", textAlign: "center", justifyContent: "center", marginLeft: "20px"}}>
          <Paper elevation={5} style={{ padding: "25px", backgroundColor: "#ffffff", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}>
            <Typography variant="h3" gutterBottom style={{ fontWeight: "700", color: "#2c3e50" }}>{movie.title}</Typography>
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              style={{ width: "100%", maxWidth: "400px", marginBottom: "20px", borderRadius: "10px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)" }}
            />
            <Typography variant="body1" style={{ marginTop: "20px", color: "#7f8c8d" }}>
              {movie.overview}
            </Typography>
            <Box mt={2} textAlign="center">
              <Typography variant="h6" color="textSecondary" style={{ fontWeight: "500" }}>
                <strong>Top Cast:</strong>
                {parsedCast.length > 0
                  ? parsedCast.map((actor, index) => (
                      <Chip key={index} label={`${actor.name} (${actor.role})`} style={{ margin: "5px", backgroundColor: "#2980b9", color: "#fff", fontWeight: "500" }} />
                    ))
                  : "N/A"}
              </Typography>
            </Box>
            <Box mt={2} textAlign="center">
              <Typography variant="h5" color="primary" style={{ fontWeight: "600" }}>
                ⭐ {movie.vote_average/2}/5
              </Typography>
            </Box>
            <Box mt={3} display="flex" flexDirection="column" gap={3}>
      {/* Box for YouTube Trailer */}
      {movie.trailer_url && movie.trailer_url.includes("youtube.com") && (
        <Box>
          <Typography variant="h6" gutterBottom>Watch the Trailer:</Typography>
          <iframe
            width="100%"
            height="315"
            src={movie.trailer_url.replace("watch?v=", "embed/")}
            title={`${movie.title} Trailer`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              borderRadius: "10px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
            }}
          />
        </Box>
      )}

      {/* Box for Fallback Video Player */}
        <Box>
          <Typography variant="h6" gutterBottom>Watch the Movie:</Typography>
          <VideoPlayer
            videoUrl={movie.video_url}
            title={movie.title}
          />
        </Box>
    </Box>

                  <Button
              variant="contained"
              color={watchlistAdded ? "secondary" : "primary"}
              onClick={handleAddToWatchlist}
              style={{ marginTop: "20px", fontWeight: "600", padding: "10px 20px" }}
            >
              {watchlistAdded ? "Remove from Watchlist" : "Add to Watchlist"}
            </Button>
          </Paper>
        </Grid>

        {/* Comments, Rating, and Leave a Comment Section */}
        <Grid item xs={12} md={6} style={{width: "45%", marginLeft: "20px"}}>
          {/* Comments Section */}
          <Paper elevation={3} style={{ padding: "20px", backgroundColor: "#ffffff", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)", textAlign: "center" }}>
            <Typography variant="h6" gutterBottom style={{ fontWeight: "600", color: "#2c3e50" }}>Comments</Typography>
            {comments.length === 0 ? (
              <Typography>No comments yet. Be the first to comment!</Typography>
            ) : (
              comments.map((comment, index) => (
                <Box key={index} mb={2}>
                  <Typography variant="body2" color="textSecondary" style={{ fontWeight: "500" }}>
                    {comment.username}
                  </Typography>
                  <Typography style={{ fontStyle: "italic", color: "#7f8c8d" }}>{comment.comment}</Typography>
                </Box>
              ))
            )}
          </Paper>

          {/* Rating Section */}
          <Paper elevation={3} style={{ padding: "20px", marginTop: "20px", backgroundColor: "#ffffff", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",textAlign: "center"  }}>
            <Typography variant="h6" gutterBottom style={{ fontWeight: "600", color: "#2c3e50" }}>Rate This Movie</Typography>
            {userRating !== null ? (
              <Typography>Your rating: {userRating}/5 ⭐</Typography>
            ) : (
              <form onSubmit={handleRatingSubmit}>
                <TextField
                  fullWidth
                  label="Your Rating (1-10)"
                  type="number"
                  inputProps={{ min: 1, max: 10 }}
                  variant="outlined"
                  value={ratingInput}
                  onChange={(e) => setRatingInput(e.target.value)}
                  required
                  style={{ marginBottom: "15px" }}
                />
                <Box mt={2}>
                  <Button type="submit" variant="contained" color="primary" style={{ padding: "10px 20px", fontWeight: "600" }}>
                    Submit Rating
                  </Button>
                </Box>
              </form>
            )}
          </Paper>

          {/* Leave a Comment Section */}
          <Paper elevation={3} style={{ padding: "20px", marginTop: "20px", backgroundColor: "#ffffff", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)" , textAlign: "center" }}>
            <Typography variant="h6" gutterBottom style={{ fontWeight: "600", color: "#2c3e50" }}>Leave a Comment</Typography>
            {user ? (
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
                  style={{ marginBottom: "15px" }}
                />
                <Box mt={2}>
                  <Button type="submit" variant="contained" color="primary" style={{ padding: "10px 20px", fontWeight: "600" }}>
                    Submit Comment
                  </Button>
                </Box>
              </form>
            ) : (
              <Box>
                <Alert severity="info" style={{ marginBottom: "10px" }}>
                  You need to be logged in to add comments and ratings.
                </Alert>
                <Button 
                  component={Link} 
                  to="/login" 
                  variant="contained" 
                  color="primary"
                  style={{ fontWeight: "600", padding: "10px 20px" }}
                >
                  Log in to comment and rate
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
