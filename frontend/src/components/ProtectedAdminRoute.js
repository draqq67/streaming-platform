import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedAdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token); // Decode the token to get the userId
        const userId = decoded.userId; // Assuming the decoded token has 'userId'

        // Fetch user data from the backend to check the role
        fetch(`http://localhost:5000/api/users/${userId}`)
          .then((res) => res.json())
          .then((userData) => {
            if (userData.role === "admin") {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
            }
          })
          .catch((err) => {
            console.error("Error fetching user data:", err);
            setIsAdmin(false);
          });
      } catch (error) {
        console.error("Error decoding token:", error);
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, [token]);

  if (isAdmin === null) {
    // If still loading, show a loading state or nothing
    return null;
  }

  // If the user is not an admin or there was an error, redirect
  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  // If the user is an admin, show the children
  return children;
};

export default ProtectedAdminRoute;
