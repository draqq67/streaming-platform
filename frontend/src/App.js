import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import HomePage from "./pages/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import UserPage from "./pages/UserPage";
import Admin from "./pages/Admin.js"
import MoviePage from "./pages/MoviePage";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import Watchlist from "./pages/Watchlist";
import { useAuth } from "./context/authContext";

// Protected route component for authenticated users
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
};
const backgroundStyle = {
  background: 'linear-gradient(90deg, rgba(154, 176, 184, 0.9) 0%, rgba(161, 161, 77, 0.59) 54%, rgba(72, 194, 98, 0.55) 100%)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  margin: 0,
 display: "flex", flexDirection: "column", minHeight: "100vh"
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App" style={backgroundStyle}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route 
              path="/user" 
              element={
                <ProtectedRoute>
                  <UserPage />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <Admin />
                </ProtectedAdminRoute>
              }
            />
            <Route path="/movies/:movieId" element={<MoviePage />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;