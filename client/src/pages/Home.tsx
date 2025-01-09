import { Box, CircularProgress, Container, Typography } from "@mui/material";
import { ErrorResponse, Thread } from "../types/shibespaceAPI";
import { useEffect, useReducer } from "react";

import { StatusCodes } from "http-status-codes";
import ThreadPreview from "../components/ThreadPreview";

type Action =
  | { type: "loading" }
  | { type: "success"; payload: Thread[] }
  | { type: "fail" };

interface State {
  loading: boolean;
  threads: Thread[] | null;
  error: boolean;
}

const initialState: State = {
  loading: false,
  threads: null,
  error: false,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "loading":
      return { loading: true, threads: null, error: false };
    case "success":
      return { loading: false, threads: action.payload, error: false };
    case "fail":
      return { loading: false, threads: null, error: true };
    default:
      return state;
  }
};

const Home: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const fetchThreads = async (): Promise<void> => {
      dispatch({ type: "loading" });
      try {
        const response = await fetch(
          import.meta.env.VITE_SHIBESPACEAPI_BASEURL + "/threads"
        );

        if (!response.ok) {
          const errorResponse = (await response.json()) as ErrorResponse;
          throw new Error(errorResponse.error);
        } else {
          if (response.status === StatusCodes.NO_CONTENT) {
            dispatch({ type: "success", payload: [] });
          } else {
            const threads = (await response.json()) as Thread[];
            dispatch({ type: "success", payload: threads });
          }
        }
      } catch (error: unknown) {
        dispatch({ type: "fail" });
        if (error instanceof Error) {
          console.error("Error fetching data:", error.message);
        } else {
          console.error("An unknown error occured:", error);
        }
      }
    };
    fetchThreads();
  }, []);

  const mapThreadsToElements = (threads: Thread[]): JSX.Element[] => {
    return threads.map((t) => <ThreadPreview key={t.id} {...t} />);
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
        {state.loading ? <CircularProgress size={40} color="primary" /> : null}
        {state.threads ? (
          state.threads.length ? (
            <>
              <Typography variant="h4" gutterBottom>
                Latest Threads
              </Typography>
              {mapThreadsToElements(state.threads)}
            </>
          ) : (
            <Typography variant="body1">
              Uh-oh! You tried to find a thread that doesn't exist.
            </Typography>
          )
        ) : null}
        {state.error ? (
          <Typography variant="body1" color="error">
            Something went wrong, please try again later
          </Typography>
        ) : null}
      </Box>
    </Container>
  );
};

export default Home;
