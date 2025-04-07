import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardMedia, Typography } from "@mui/material";

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
          image={movie.thumbnail || "https://via.placeholder.com/300x200"}
          alt={movie.title}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {movie.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {movie.description}
          </Typography>
        </CardContent>
      </Card>
    </Link>
  );
};

export default MovieCard;
