import {
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  TextField,
  Typography,
} from "@mui/material";
import { Thread, ThreadData } from "../types/shibespaceAPI";
import { useRef, useState } from "react";

import { ErrorResponse } from "../types/shibespaceAPI";
import { StatusCodes } from "http-status-codes";
import TagField from "../components/TagField";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";

const NewThread: React.FC = () => {
  const [errorText, setErrorText] = useState<string>("");
  const [defaultTitle, setDefaultTitle] = useState<string>("");
  const [defaultContent, setDefaultContent] = useState<string>("");
  const [isValidTitle, setIsValidTitle] = useState<boolean>(true);
  const [tags, setTags] = useState<string[]>([]); // The input verification is done in TagField
  const [loading, setLoading] = useState<boolean>(false);
  const submitButton = useRef<HTMLButtonElement | null>(null);
  const navigate = useNavigate();

  const handleNewThread = async (formData: FormData): Promise<void> => {
    const threadData: ThreadData = {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      tags: tags, // Is always valid at the point of submission
    };

    // Prevent fields from being cleared
    setDefaultTitle(threadData.title);
    setDefaultContent(threadData.content);

    // Prevent state setter functions from being batched.
    flushSync(() => {
      setErrorText("");
      setIsValidTitle(true);
    });

    // Input validation
    if (threadData.title.length > 255) {
      setIsValidTitle(false);
      return;
    }

    flushSync(() => {
      setLoading(true);
    });

    try {
      const response = await fetch(
        import.meta.env.VITE_SHIBESPACEAPI_BASEURL + "/threads",
        {
          method: "POST",
          credentials: "include", // To send the jwt cookie
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(threadData),
        }
      );

      if (!response.ok) {
        const errorResponse = (await response.json()) as ErrorResponse;
        if (response.status === StatusCodes.UNAUTHORIZED) {
          setErrorText("You must be logged in to create a new thread");
          console.error("You must be logged in to create a new thread");
        } else {
          throw new Error(errorResponse.error);
        }
      } else {
        // Redirect to created thread
        const thread = (await response.json()) as Thread;
        navigate("/threads/" + thread.id);
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
        p: 4,
      }}
    >
      <Typography variant="h4" textAlign="center" mb={2}>
        New Thread
      </Typography>
      <form action={handleNewThread}>
        <FormControl sx={{ width: "100%", mb: 2 }}>
          <TextField
            name="title"
            label="Title"
            type="text"
            margin="normal"
            defaultValue={defaultTitle}
            error={!isValidTitle}
            helperText={
              isValidTitle ? null : "Title must be at most 255 characters long"
            }
            disabled={loading}
            required
          ></TextField>
          <TextField
            name="content"
            label="Content"
            type="text"
            margin="normal"
            defaultValue={defaultContent}
            disabled={loading}
            required
            rows={10}
            multiline
          ></TextField>
          {/* Don't show this button as we are using the one outside the form */}
          <Button
            type="submit"
            ref={submitButton}
            sx={{ display: "none" }}
          ></Button>
        </FormControl>
      </form>
      <TagField tags={tags} setTags={setTags} loading={loading} />
      <Box width="100%" display="flex" justifyContent="center">
        <Button
          type="button"
          // We need to do this as the button is outside the form
          onClick={() => {
            submitButton.current?.click();
          }}
          variant="contained"
          sx={{
            width: { xs: "100%", md: "17.5%", lg: "15%" },
            height: "36.5px",
          }}
          startIcon={
            loading ? <CircularProgress size={20} color="inherit" /> : null
          }
          disabled={loading}
        >
          {loading ? "" : "Create Thread"}
        </Button>
      </Box>
      <Typography variant="body1" color="error" textAlign="center" mt={2}>
        {errorText}
      </Typography>
    </Container>
  );
};

export default NewThread;
