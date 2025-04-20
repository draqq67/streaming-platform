import React, { useEffect, useState } from "react";
import { Container, Typography, Paper, Box, Button, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

const UserPage = () => {
  const [userData, setUserData] = useState(null);
  const [userComments, setUserComments] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate("/login");
      return;
    }

    // Fetch user data
    const fetchUserData = async () => {
      try {
        const userId = user.userId;
        const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setUserData(data);

        // Fetch user comments
        const commentsResponse = await fetch(
          `http://localhost:5000/api/users/${userId}/comments`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const commentsData = await commentsResponse.json();
        setUserComments(commentsData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Header />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">User Profile</Typography>
            <Button variant="contained" color="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </Box>

          <Box mb={4}>
            <Typography variant="h6" gutterBottom>
              Account Information
            </Typography>
            <Typography>
              <strong>Username:</strong> {userData.username}
            </Typography>
            <Typography>
              <strong>Email:</strong> {userData.email}
            </Typography>
            <Typography>
              <strong>Role:</strong> {userData.role}
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              Your Comments
            </Typography>
            {userComments.length === 0 ? (
              <Typography>You haven't made any comments yet.</Typography>
            ) : (
              <Grid container spacing={2}>
                {userComments.map((comment) => (
                  <Grid item xs={12} key={comment.id}>
                    <Paper elevation={1} sx={{ p: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Movie ID: {comment.movie_id}
                      </Typography>
                      <Typography>{comment.comment}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Posted on: {new Date(comment.created_at).toLocaleDateString()}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Paper>
      </Container>
      <Footer />
    </div>
  );
};

export default UserPage;