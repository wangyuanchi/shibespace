import { Container, Typography } from "@mui/material";

const Home: React.FC = () => {
  return (
    <Container
      sx={{
        mt: { xs: "56px", sm: "64px" },
        pt: 4,
      }}
    >
      <Typography variant="body1">Home</Typography>
    </Container>
  );
};

export default Home;
