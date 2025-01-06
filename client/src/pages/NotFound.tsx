import { Box, Container, Typography } from "@mui/material";

const NotFound: React.FC = () => {
  return (
    <Container>
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h1">404</Typography>
        <Typography variant="body1">
          Woops. Looks like this page doesn't exist.
        </Typography>
      </Box>
    </Container>
  );
};

export default NotFound;
