import {
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  TextField,
  Typography,
} from "@mui/material";

import { ErrorResponse } from "../types/shibespaceAPI";
import { StatusCodes } from "http-status-codes";
import { UserData } from "../types/shibespaceAPI";
import { flushSync } from "react-dom";
import { useState } from "react";

const SignUp: React.FC = () => {
  const [errorText, setErrorText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [defaultUsername, setDefaultUsername] = useState<string>("");
  const [defaultPassword, setDefaultPassword] = useState<string>("");
  const [isValidUsername, setIsValidUsername] = useState<boolean>(true);
  const [isValidPassword, setIsValidPassword] = useState<boolean>(true);
  const [signUpSuccess, setSignUpSuccess] = useState<boolean>(false);
  const [usernameTaken, setUsernameTaken] = useState<boolean>(false);

  const handleSignUp = async (formData: FormData): Promise<void> => {
    const userData: UserData = {
      username: formData.get("username") as string,
      password: formData.get("password") as string,
    };

    // Prevent fields from being cleared
    setDefaultUsername(userData.username);
    setDefaultPassword(userData.password);

    // Prevent state setter function being batched.
    flushSync(() => {
      setErrorText("");
      setIsValidUsername(true);
      setIsValidPassword(true);
    });

    if (
      userData.username.length < 3 ||
      userData.username.length > 20 ||
      userData.password.length < 8
    ) {
      if (userData.username.length < 3 || userData.username.length > 20) {
        setIsValidUsername(false);
        setUsernameTaken(false);
      }
      if (userData.password.length < 8) {
        setIsValidPassword(false);
      }
      return; // If user data is invalid, do not send to backend
    }

    flushSync(() => {
      setLoading(true);
    });

    try {
      const response = await fetch(
        import.meta.env.VITE_SHIBESPACEAPI_BASEURL + "/users",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      // Handle the relevant errors based on shibespaceAPI,
      // otherwise, just generalize the error message in the catch block.
      if (!response.ok) {
        if (response.status === StatusCodes.CONFLICT) {
          setIsValidUsername(false);
          setUsernameTaken(true);
          console.error("Username is already taken");
        } else {
          const errorResponse = (await response.json()) as ErrorResponse;
          throw new Error(errorResponse.error);
        }
      } else {
        // Indicate the user to navigate to login page
        setSignUpSuccess(true);
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
        {signUpSuccess ? (
          <Typography variant="h6" color="success">
            Success! Please log into your account.
          </Typography>
        ) : (
          <form action={handleSignUp}>
            <FormControl sx={{ width: "400px" }}>
              <TextField
                name="username"
                label="Username"
                type="text"
                margin="normal"
                defaultValue={defaultUsername}
                error={!isValidUsername}
                helperText={
                  isValidUsername
                    ? null
                    : usernameTaken
                    ? "Username is already taken"
                    : "Username must be between 3 and 20 characters long"
                }
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
                helperText={
                  isValidPassword
                    ? null
                    : "Password must be at least 8 characters long"
                }
                disabled={loading}
                required
              ></TextField>

              <Button
                type="submit"
                variant="contained"
                sx={{ mt: 2, height: "36.5px" }}
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : null
                }
                disabled={loading}
              >
                {loading ? "" : "Sign Up"}
              </Button>
              <Typography
                variant="body1"
                color="error"
                textAlign="center"
                mt={2}
              >
                {errorText}
              </Typography>
            </FormControl>
          </form>
        )}
      </Box>
    </Container>
  );
};

export default SignUp;
