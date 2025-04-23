import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardMedia, Typography, Chip } from "@mui/material";

const MovieCard = ({ movie }) => {
  return (
    <Link to={`/movies/${movie.id}`} style={{ textDecoration: "none" }}>
      <Card
        sx={{
          maxWidth: 345,
          boxShadow: 3,
          transition: "transform 0.3s",
          "&:hover": {
            transform: "scale(1.05)",
          },
        }}
      >
            <CardMedia
            component="img"
            height="140"
            image={`https://image.tmdb.org/t/p/w500${movie.poster_path}` || "https://via.placeholder.com/300x200"}
            alt={movie.title}
          />

        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {movie.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {movie.overview || "No description available"}
          </Typography>
          <div style={{ marginTop: 8 }}>
            {Array.isArray(movie.genres) && movie.genres.map((genre, index) => (
              <Chip key={index} label={genre} sx={{ marginRight: 0.5 }} />
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default MovieCard;
