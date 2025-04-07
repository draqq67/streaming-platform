import React from "react";
import UploadForm from "../components/UploadForm";
import MovieList from "../components/MovieList";

const AdminPanel = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      <UploadForm />
      <MovieList />
    </div>
  );
};

export default AdminPanel;
