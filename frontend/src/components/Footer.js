import React from "react";
import { Box, Typography, Container } from "@mui/material";

const Footer = () => {
  return (
    <Box
      sx={{
        backgroundColor: "primary.main",
        color: "white",
        py: 2,
        mt: 4,
        textAlign: "center",
      }}
    >
      <Container maxWidth="md">
        <Typography variant="body2">
          © {new Date().getFullYear()} MovieDB. All rights reserved.
        </Typography>
        <Typography variant="caption">Lorem ipsum dolor sit amet.</Typography>
      </Container>
    </Box>
  );
};

export default Footer;
