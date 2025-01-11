import { Box, Chip, CircularProgress } from "@mui/material";
import { Container, Typography } from "@mui/material";
import { useEffect, useReducer, useState } from "react";

import { ErrorResponse } from "../types/shibespaceAPI";
import { StatusCodes } from "http-status-codes";
import { Thread } from "../types/shibespaceAPI";
import ThreadMain from "../components/ThreadMain";
import { useParams } from "react-router-dom";

type Action =
  | { type: "loading" }
  | { type: "success"; payload: Thread }
  | { type: "fail"; error: string };

interface State {
  loading: boolean;
  thread: Thread | null;
  error: string;
}

const initialThreadState: State = {
  loading: false,
  thread: null,
  error: "",
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "loading":
      return { loading: true, thread: null, error: "" };
    case "success":
      return { loading: false, thread: action.payload, error: "" };
    case "fail":
      return { loading: false, thread: null, error: action.error };
    default:
      return state;
  }
};

const SingleThread: React.FC = () => {
  const [threadState, dispatch] = useReducer(reducer, initialThreadState);
  const [update, setUpdate] = useState<boolean>(false);
  const { thread_id } = useParams();

  // This re-triggers the useEffect() below to reflect updated content
  const runUpdate = (): void => {
    setUpdate((prevUpdate) => !prevUpdate);
  };

  useEffect(() => {
    const fetchThread = async (): Promise<void> => {
      dispatch({ type: "loading" });
      try {
        const response = await fetch(
          import.meta.env.VITE_SHIBESPACEAPI_BASEURL + "/threads/" + thread_id
        );

        if (!response.ok) {
          if (response.status === StatusCodes.BAD_REQUEST) {
            dispatch({
              type: "fail",
              error: "The requested thread ID is invalid",
            });
            console.error("The requested thread ID is invalid");
          } else if (response.status === StatusCodes.NOT_FOUND) {
            dispatch({
              type: "fail",
              error: "The requested thread does not exist",
            });
            console.error("The requested thread does not exist");
          } else {
            const errorResponse = (await response.json()) as ErrorResponse;
            throw new Error(errorResponse.error);
          }
        } else {
          const thread = (await response.json()) as Thread;
          dispatch({ type: "success", payload: thread });
        }
      } catch (error: unknown) {
        dispatch({
          type: "fail",
          error: "Something went wrong, please try again later",
        });
        if (error instanceof Error) {
          console.error("Error fetching data:", error.message);
        } else {
          console.error("An unknown error occured:", error);
        }
      }
    };
    fetchThread();
  }, [update]);

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
          justifyContent: "center",
          mb: 10,
        }}
      >
        {/* Only one of these 3 states can be active at one time */}
        {threadState.loading ? (
          <CircularProgress size={40} color="primary" />
        ) : null}
        {threadState.thread ? (
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" mb={1} sx={{ wordBreak: "break-word" }}>
              {threadState.thread.title}{" "}
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                gap: "10px 10px",
              }}
            >
              {threadState.thread.tags.map((t) => (
                <Chip key={t} label={t} size="small" />
              ))}
            </Box>
            <ThreadMain {...threadState.thread} runUpdate={runUpdate} />
          </Box>
        ) : null}
        {threadState.error ? (
          <Typography variant="body1" color="error">
            {threadState.error}
          </Typography>
        ) : null}
      </Box>
    </Container>
  );
};

export default SingleThread;
