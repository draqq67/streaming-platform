import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

const Header = () => {
  const { user, logout } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin when user changes
    const checkAdminStatus = async () => {
      

      try {
        const response = await fetch(`http://localhost:5000/api/users/${user.userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const userData = await response.json();
        setIsAdmin(userData.role === "admin");
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <AppBar
        position="static"
        sx={{
          mb: 4,
          background: "linear-gradient(to right, #e0e0e0, #bdbdbd)", // Gray gradient
          color: "black",
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ color: "black", textDecoration: "none" }}>
              MovieDB
            </Link>
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button color="inherit" component={Link} to="/">
              Home
            </Button>
            {user && (
              <Button color="inherit" component={Link} to="/watchlist">
                Watchlist
              </Button>
            )}
            {user && (
              <Button color="inherit" component={Link} to="/rated">
                Rated Movies
              </Button>
            )}
            {user ? (
              <>
                <Button color="inherit" component={Link} to="/user">
                  My Profile
                </Button>
                {isAdmin && (
                  <Button color="inherit" component={Link} to="/admin">
                    Admin
                  </Button>
                )}
                <Button color="inherit" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button color="inherit" component={Link} to="/login">
                  Login
                </Button>
                <Button color="inherit" component={Link} to="/register">
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
  );
};

export default Header;