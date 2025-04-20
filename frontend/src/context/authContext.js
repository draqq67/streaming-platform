import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// Create authentication context
const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for token in localStorage on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode token to get user ID
        const decoded = jwtDecode(token);
        
        // Set user state with token and userId
        setUser({
          token,
          userId: decoded.userId,
        });
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = (token, userId) => {
    localStorage.setItem('token', token);
    setUser({ token, userId });
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Check if user has admin role
  const isAdmin = async () => {
    if (!user) return false;
    
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.userId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const userData = await response.json();
      return userData.role === 'admin';
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => useContext(AuthContext);