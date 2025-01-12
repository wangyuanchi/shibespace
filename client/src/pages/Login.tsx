import {
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { ErrorResponse, User, UserData } from "../types/shibespaceAPI";

import { ROUTEPATHS } from "../types/types";
import { StatusCodes } from "http-status-codes";
import { flushSync } from "react-dom";
import setSession from "../utils/setSession";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUser } from "../components/UserProvider";

const Login: React.FC = () => {
  const [errorText, setErrorText] = useState<string>("");
  const [defaultUsername, setDefaultUsername] = useState<string>("");
  const [defaultPassword, setDefaultPassword] = useState<string>("");
  const [isValidUsername, setIsValidUsername] = useState<boolean>(true);
  const [isValidPassword, setIsValidPassword] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const { startSessionCheck } = useUser();
  const navigate = useNavigate();

  const handleLogin = async (formData: FormData): Promise<void> => {
    const userData: UserData = {
      username: formData.get("username") as string,
      password: formData.get("password") as string,
    };

    // Prevent fields from being cleared
    setDefaultUsername(userData.username);
    setDefaultPassword(userData.password);

    // Prevent state setter functions from being batched.
    flushSync(() => {
      setErrorText("");
      setIsValidUsername(true);
      setIsValidPassword(true);
      setLoading(true);
    });

    try {
      const response = await fetch(
        import.meta.env.VITE_SHIBESPACEAPI_BASEURL + "/users/auth",
        {
          method: "POST",
          credentials: "include", // To get the jwt cookie
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      // Handle the relevant errors based on the shibespaceAPI,
      // otherwise, just generalize the error message in the catch block.
      if (!response.ok) {
        if (response.status === StatusCodes.UNAUTHORIZED) {
          setIsValidUsername(false);
          setIsValidPassword(false);
          setErrorText("The username or password is incorrect");
          console.error("The username or password is incorrect");
        } else {
          const errorResponse = (await response.json()) as ErrorResponse;
          throw new Error(errorResponse.error);
        }
      } else {
        const user = (await response.json()) as User;

        // Set the session and the corresponding check for it,
        // then redirect back to the home page.
        setSession(user.username);
        startSessionCheck();
        navigate(ROUTEPATHS.HOME);
      }
    } catch (error: unknown) {
      setErrorText("Something went wrong, please try again later");
      if (error instanceof Error) {
        console.error("Error fetching data:", error.message);
      } else {
        console.error("An unknown error occured:", error);
      }
    }

    setLoading(false);
  };

  return (
    <Container
      sx={{
        mt: "64px",
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
          <FormControl sx={{ width: { xs: "300px", sm: "435px" } }}>
            <TextField
              name="username"
              label="Username"
              type="text"
              margin="normal"
              defaultValue={defaultUsername}
              error={!isValidUsername}
              disabled={loading}
              required
            ></TextField>
            <TextField
              name="password"
              label="Password"
              type="password"
              margin="normal"
              defaultValue={defaultPassword}
              error={!isValidPassword}
              disabled={loading}
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
            <Typography variant="body1" textAlign="center" mt={2}>
              Don't have an account?{" "}
              <Link href={ROUTEPATHS.SIGNUP} underline="none">
                Sign up
              </Link>
            </Typography>
            <Typography variant="body1" color="error" textAlign="center" mt={1}>
              {errorText}
            </Typography>
          </FormControl>
        </form>
      </Box>
    </Container>
  );
};

export default Login;
