import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/authContext"; // Importăm AuthProvider
import HomePage from "./pages/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Admin from "./pages/Admin.js"
import MoviePage from "./pages/MoviePage";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute"; // Importăm ruta protejată pentru admin
function App() {
  return (
    // Asigură-te că AuthProvider este în interiorul Router
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login onLoginSuccess={(token) => {/* store token or redirect */}} />} />
              <Route path="/register" element={<Register onRegisterSuccess={(data) => {/* redirect or login */}} />} />
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
