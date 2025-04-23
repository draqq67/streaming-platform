import React, { useEffect, useState } from "react";
import axios from "axios";
import CommentList from "./CommentList";

function MovieList() {
  const [movies, setMovies] = useState([]);

  const fetchMovies = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/movies", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setMovies(res.data);
    } catch (err) {
      console.error("Failed to fetch movies", err);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);
  console.log(movies)
  return (
    <div>
      <h2>Movies</h2>
      {movies.map((movie) => (
        <div key={movie.id} style={{ borderBottom: "1px solid #ccc", marginBottom: "10px" }}>
          <h3>{movie.title}</h3>
          <p>{movie.description}</p>
          <CommentList movieId={movie.id} />
        </div>
      ))}
    </div>
  );
}

export default MovieList;
