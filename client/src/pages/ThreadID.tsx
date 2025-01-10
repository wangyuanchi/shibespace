import { Box, CircularProgress } from "@mui/material";
import { Container, Typography } from "@mui/material";
import { useEffect, useReducer } from "react";

import { ErrorResponse } from "../types/shibespaceAPI";
import { StatusCodes } from "http-status-codes";
import { Thread } from "../types/shibespaceAPI";
import ThreadView from "../components/ThreadView";
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

const ThreadID: React.FC = () => {
  const [threadState, dispatch] = useReducer(reducer, initialThreadState);
  const { thread_id } = useParams();

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
  }, []);

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
        }}
      >
        {/* Only one of these 3 states can be active at one time */}
        {threadState.loading ? (
          <CircularProgress size={40} color="primary" />
        ) : null}
        {threadState.thread ? <ThreadView {...threadState.thread} /> : null}
        {threadState.error ? (
          <Typography variant="body1" color="error">
            {threadState.error}
          </Typography>
        ) : null}
      </Box>
    </Container>
  );
};

export default ThreadID;
