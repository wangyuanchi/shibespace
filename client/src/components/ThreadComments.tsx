import { Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useReducer, useState } from "react";

import { Comment } from "../types/shibespaceAPI";
import Comments from "./Comments";
import { ErrorResponse } from "../types/shibespaceAPI";
import { StatusCodes } from "http-status-codes";

type Action =
  | { type: "loading" }
  | { type: "success"; payload: Comment[] }
  | { type: "fail" };

interface State {
  loading: boolean;
  comments: Comment[] | null;
  error: boolean;
}

const initialCommentsState: State = {
  loading: false,
  comments: null,
  error: false,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "loading":
      return { loading: true, comments: null, error: false };
    case "success":
      return { loading: false, comments: action.payload, error: false };
    case "fail":
      return { loading: false, comments: null, error: true };
    default:
      return state;
  }
};

interface Props {
  thread_id: number;
}

const ThreadComments: React.FC<Props> = ({ thread_id }) => {
  const [commentsState, dispatch] = useReducer(reducer, initialCommentsState);
  const [commentsTotalCount, setCommentsTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [update, setUpdate] = useState<boolean>(false);

  // This re-triggers the useEffect() below to reflect updated content
  const runUpdate = (): void => {
    setUpdate((prevUpdate) => !prevUpdate);
  };

  useEffect(() => {
    const fetchComments = async (): Promise<void> => {
      dispatch({ type: "loading" });
      try {
        const response = await fetch(
          import.meta.env.VITE_SHIBESPACEAPI_BASEURL +
            `/comments?thread_id=${thread_id}&page=${page}`
        );

        if (!response.ok) {
          const errorResponse = (await response.json()) as ErrorResponse;
          throw new Error(errorResponse.error);
        } else {
          // This is used to calculate the number pages required to display all comments
          setCommentsTotalCount(Number(response.headers.get("x-total-count")));

          if (response.status === StatusCodes.NO_CONTENT) {
            dispatch({ type: "success", payload: [] });
          } else {
            const comments = (await response.json()) as Comment[];
            dispatch({ type: "success", payload: comments });
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
    fetchComments();
  }, [page, update]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
      }}
    >
      {/* Only one of these 3 states can be active at one time */}
      {commentsState.loading ? (
        <CircularProgress size={40} color="primary" sx={{ mt: 4 }} />
      ) : null}
      {commentsState.comments ? (
        <Comments
          comments={commentsState.comments}
          commentsTotalCount={commentsTotalCount}
          page={page}
          setPage={setPage}
          runUpdate={runUpdate}
        />
      ) : null}
      {commentsState.error ? (
        <Typography variant="body1" color="error" sx={{ mt: 4 }}>
          Something went wrong, please try again later
        </Typography>
      ) : null}
    </Box>
  );
};

export default ThreadComments;
