import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Creăm contextul pentru autentificare
const AuthContext = createContext();

// Creăm un provider pentru AuthContext
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Verificăm dacă există un token salvat în localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ token });  // Aici, poți salva mai multe date ale utilizatorului
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    setUser({ token });
    navigate('/');  // Redirecționăm utilizatorul pe HomePage
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');  // Redirecționăm utilizatorul la login
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook personalizat pentru a accesa AuthContext
export const useAuth = () => useContext(AuthContext);
