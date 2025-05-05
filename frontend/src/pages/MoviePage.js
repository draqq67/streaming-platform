import React, { useEffect, useState } from "react";
import { Grid, Typography, TextField, Button, Paper, Box, Alert, Chip } from "@mui/material";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/authContext";
import VideoPlayer from "../components/VideoPlayer";

const MoviePage = () => {
  const [movie, setMovie] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [userRating, setUserRating] = useState(null);
  const [ratingInput, setRatingInput] = useState("");
  const [watchlistAdded, setWatchlistAdded] = useState(false);
  const { movieId } = useParams();
  const { user } = useAuth();

  useEffect(() => {
    if (userRating !== null) {
      setRatingInput(userRating.toString());
    }
  }, [userRating]);
  
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
          if (ratingForMovie) setUserRating(ratingForMovie);

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
  
    const payload = {
      userId: user?.userId,
      movieId: movieId,
      ratingValue: parseFloat(ratingInput),
    };
    console.log(movieId)
    const ratingValue = parseFloat(ratingInput);  // Ensure ratingValue is defined correctl
    if (userRating !== null) {
      fetch(`http://localhost:5000/api/users/${user.userId}/ratings/${movieId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: ratingValue, // ratingValue is the value we want to send
        }),
      })
      .then((res) => {
        console.log("Response Status:", res.status); // Log status for debugging
        if (!res.ok) {
          // If the response status is not OK, throw an error with the status
          throw new Error(`Failed to update rating, status: ${res.status}`);
        }
        return res.json();  // Attempt to parse response as JSON
      })
      .then((data) => {
        console.log("Updated Rating Data:", data);  // Log data for debugging
        setUserRating({ ...userRating, rating: data.rating });
        setRatingInput("");
      })
      .catch((err) => {
        console.error("Error updating rating:", err);
      });
    } else {
      // Create new
      fetch(`http://localhost:5000/api/ratings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((data) => {
          setUserRating(data); // store full new object
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
      method: watchlistAdded ? "DELETE" : "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        movieId: movieId,
      }),
    })
      .then(() => {
        setWatchlistAdded(!watchlistAdded);
      })
      .catch((err) => console.error("Error adding/removing movie from watchlist:", err));
  };

  const parsedCast = movie?.movie_cast?.map(actorStr => {
    const [name, role] = actorStr.split(" as ");
    return { name: name?.trim() || "", role: role?.trim() || "Unknown" };
  }) || [];

  if (!movie) return <div>Loading...</div>;

  const BoxStyle = {
    background: "linear-gradient(90deg, rgba(154, 176, 184, 0.86) 49%, rgba(72, 194, 98, 0) 100%)",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  };

  return (
    <div style={{ padding: "30px" }}>
      <Header />
      <Grid container spacing={6}>
        <Grid item xs={12} md={6} style={{ width: "50%", textAlign: "center", marginLeft: "20px" }}>
          <Paper elevation={5} style={{ ...BoxStyle }}>
            <Typography variant="h3" gutterBottom style={{ fontWeight: "700", color: "#2c3e50" }}>{movie.title}</Typography>
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              style={{ width: "100%", maxWidth: "400px", marginBottom: "20px", borderRadius: "10px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)" }}
            />
            <Typography variant="body1" style={{ marginTop: "20px", color: "black" }}>
              {movie.overview}
            </Typography>
            <Box mt={2}>
              <Typography variant="h6" color="textSecondary" style={{ fontWeight: "500" }}>
                <strong>Top Cast:</strong>
                {parsedCast.length > 0
                  ? parsedCast.map((actor, index) => (
                    <Chip key={index} label={`${actor.name} (${actor.role})`} style={{ margin: "5px", backgroundColor: "#2980b9", color: "#fff", fontWeight: "500" }} />
                  ))
                  : "N/A"}
              </Typography>
            </Box>
            <Box mt={2}>
              <Typography variant="h5" color="primary" style={{ fontWeight: "600" }}>
                ⭐ {movie.vote_average / 2}/5
              </Typography>
            </Box>

            <Box mt={3} display="flex" flexDirection="column" gap={3}>
              {movie.trailer_url?.includes("youtube.com") && (
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
                    style={{ borderRadius: "10px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)" }}
                  />
                </Box>
              )}

              <Box>
                <Typography variant="h6" gutterBottom>Watch the Movie:</Typography>
                <VideoPlayer videoUrl={movie.video_url} posterUrl ={movie.backdrop_path} />
              </Box>
            </Box>

            <Button
              variant="contained"
              color={watchlistAdded ? "secondary" : ""}
              onClick={handleAddToWatchlist}
              style={{ marginTop: "20px", fontWeight: "600", padding: "10px 20px", color : ""}}
            >
              {watchlistAdded ? "Remove from Watchlist" : "Add to Watchlist"}
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} style={{ width: "45%", marginLeft: "20px" }}>
          <Paper elevation={3} style={{ ...BoxStyle }}>
            <Typography variant="h6" gutterBottom style={{ fontWeight: "600", color: "#2c3e50" }}>Comments</Typography>
            {comments.length === 0 ? (
              <Typography>No comments yet. Be the first to comment!</Typography>
            ) : (
              comments.map((comment, index) => (
                <Box key={index} mb={2}>
                  <Typography variant="body2" color="textSecondary" style={{ fontWeight: "500" }}>
                    {comment.username}
                  </Typography>
                  <Typography style={{ fontStyle: "italic", color: "black" }}>{comment.comment}</Typography>
                </Box>
              ))
            )}
          </Paper>

          <Paper elevation={3} style={{ ...BoxStyle, marginTop: "20px" }}>
            <Typography variant="h6" gutterBottom style={{ fontWeight: "600", color: "#2c3e50" }}>Rate This Movie</Typography>
                  <form onSubmit={handleRatingSubmit}>
                <TextField
                  fullWidth
                  label="Your Rating (0.5-5)"
                  type="number"
                  inputProps={{ min: 0.5, max: 5, step: 0.5 }}
                  variant="outlined"
                  value={ratingInput}
                  onChange={(e) => setRatingInput(e.target.value)}
                  required
                  style={{ marginBottom: "15px" }}
                  placeholder="Enter a rating"
                />
                {userRating !== null && (
                  <Typography variant="body2" style={{ marginBottom: "10px", color: "#555" }}>
                    You rated this movie: {userRating.rating}/5 ⭐ — you can update it below
                  </Typography>
                )}
                <Box mt={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    color=""
                    style={{ padding: "10px 20px", fontWeight: "600" }}
                  >
                    {userRating !== null ? "Update Rating" : "Submit Rating"}
                  </Button>
                </Box>
            </form>

          </Paper>

          <Paper elevation={3} style={{ ...BoxStyle, marginTop: "20px" }}>
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
                  onKeyDown={(e) => e.stopPropagation()} // <- this stops parent listeners
                  placeholder="Write your comment here..."
                  required
                  style={{ marginBottom: "15px" }}
                />
                <Box mt={2}>
                  <Button type="submit" variant="contained" color="" style={{ padding: "10px 20px", fontWeight: "600" }}>
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
