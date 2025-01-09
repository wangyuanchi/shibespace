import { Box, CircularProgress, Container, Typography } from "@mui/material";
import { ErrorResponse, Thread } from "../types/shibespaceAPI";
import { useEffect, useReducer, useState } from "react";

import { StatusCodes } from "http-status-codes";
import TagFilter from "../components/TagFilter";
import Threads from "../components/Threads";

type Action =
  | { type: "loading" }
  | { type: "success"; payload: Thread[] }
  | { type: "fail" };

interface State {
  loading: boolean;
  threads: Thread[] | null;
  error: boolean;
}

const initialThreadsState: State = {
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
  const [threadsState, dispatch] = useReducer(reducer, initialThreadsState);
  const [threadsTotalCount, setThreadsTotalCount] = useState<number>(0);

  // Defaults according to shibespaceAPI for /threads endpoint queries
  // This will be used to trigger useEffect() to get the relevant information
  const [tags, setTags] = useState<string[]>([]);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    const fetchThreads = async (): Promise<void> => {
      dispatch({ type: "loading" });
      try {
        const response = await fetch(
          import.meta.env.VITE_SHIBESPACEAPI_BASEURL +
            "/threads?tags=" +
            tags.join(",") +
            "&page=" +
            page
        );

        if (!response.ok) {
          const errorResponse = (await response.json()) as ErrorResponse;
          throw new Error(errorResponse.error);
        } else {
          if (response.status === StatusCodes.NO_CONTENT) {
            // If there is no content, we do not need to get "x-total-count"
            dispatch({ type: "success", payload: [] });
          } else {
            const threads = (await response.json()) as Thread[];

            // This is used to calculate the number pages required to display all threads
            setThreadsTotalCount(Number(response.headers.get("x-total-count")));

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
  }, [tags, page]);

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
          alignItems: "start",
        }}
      >
        {" "}
        <Typography variant="h4" textAlign="center" width="100%" mb={2}>
          Threads
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <TagFilter
            tags={tags}
            setTags={setTags}
            setPage={setPage}
            threads={threadsState.threads}
          />
          {/* Only one of these 3 states can be active at one time */}
          {threadsState.loading ? (
            <CircularProgress size={40} color="primary" />
          ) : null}
          {threadsState.threads ? (
            <Threads
              threads={threadsState.threads}
              threadsTotalCount={threadsTotalCount}
              page={page}
              setPage={setPage}
            />
          ) : null}
          {threadsState.error ? (
            <Typography variant="body1" color="error">
              Something went wrong, please try again later
            </Typography>
          ) : null}
        </Box>
      </Box>
    </Container>
  );
};

export default Home;
