import { Container, Typography } from "@mui/material";

const Home: React.FC = () => {
  return (
    <Container
      sx={{
        marginTop: { xs: "56px", sm: "64px" },
        paddingTop: "2rem",
      }}
    >
      <Typography variant="body1">Home</Typography>
    </Container>
  );
};

export default Home;
