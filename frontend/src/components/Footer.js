import React from "react";
import { Box, Typography, Container } from "@mui/material";

const Footer = () => {
  return (
    <Box
      sx={{
        backgroundColor: "primary.main",
        mb: 4,
        background: "linear-gradient(to right, #e0e0e0, #bdbdbd)", // Gray gradient        
        py: 2,
        mt: 4,
        textAlign: "center",
        position: "sticky",
        bottom: 0,
        color: "black"
      }}
    >
      <Container maxWidth="md">
        <Typography variant="body2">
          © {new Date().getFullYear()} MovieDB. Project realised by{" "}
          <a
            href="https://github.com/draqq67"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            draqq67
          </a>
        </Typography>
        <Typography variant="caption">Streaming Platform for movies</Typography>
      </Container>
    </Box>
  );
};

export default Footer;
