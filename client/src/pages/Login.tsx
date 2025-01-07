import {
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  TextField,
  Typography,
} from "@mui/material";
import { ErrorResponse, User, UserData } from "../types/shibespaceAPI";

import { ROUTEPATHS } from "../types/types";
import { StatusCodes } from "http-status-codes";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUser } from "../components/UserProvider";

const Login: React.FC = () => {
  const [errorText, setErrorText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { setUsername } = useUser();
  const navigate = useNavigate();

  const handleLogin = async (formData: FormData): Promise<void> => {
    const userData: UserData = {
      username: formData.get("username") as string,
      password: formData.get("password") as string,
    };

    // Prevent state setter function being batched
    flushSync(() => setLoading(true));

    try {
      const response = await fetch(
        import.meta.env.VITE_SHIBESPACEAPI_BASEURL + "/users/auth",
        {
          method: "POST",
          mode: "cors",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      // Handle the relevant errors based on shibespaceAPI,
      // otherwise, just generalize the error message in the catch block.
      if (!response.ok) {
        if (response.status === StatusCodes.UNAUTHORIZED) {
          setErrorText("The username or password is incorrect");
        } else {
          const errorResponse = (await response.json()) as ErrorResponse;
          throw new Error(errorResponse.error);
        }
      } else {
        // Store username in UserContext and redirect back to the home page
        const user = (await response.json()) as User;
        setUsername(user.username);
        navigate(ROUTEPATHS.HOME);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching data:", error.message);
      } else {
        console.error("An unknown error occured:", error);
      }
      setErrorText("Something went wrong, please try again later");
    }

    setLoading(false);
  };

  return (
    <Container
      sx={{
        mt: { xs: "56px", sm: "64px" },
        pt: 4,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <form action={handleLogin}>
          <FormControl sx={{ width: "400px" }}>
            <TextField
              name="username"
              label="Username"
              type="text"
              margin="normal"
              required
            ></TextField>
            <TextField
              name="password"
              label="Password"
              type="password"
              margin="normal"
              required
            ></TextField>
            <Button
              type="submit"
              variant="contained"
              sx={{ mt: 2, height: "36.5px" }}
              startIcon={
                loading ? <CircularProgress size={20} color="inherit" /> : null
              }
              disabled={loading}
            >
              {loading ? "" : "Login"}
            </Button>
            <Typography variant="body1" color="error" pt={2}>
              {errorText}
            </Typography>
          </FormControl>
        </form>
      </Box>
    </Container>
  );
};

export default Login;
