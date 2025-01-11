import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  Pagination,
  TextField,
  Typography,
} from "@mui/material";
import { Comment, CommentData, ErrorResponse } from "../types/shibespaceAPI";

import CommentMain from "./CommentMain";
import { ROUTEPATHS } from "../types/types";
import { StatusCodes } from "http-status-codes";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUser } from "./UserProvider";

interface Props {
  comments: Comment[];
  commentsTotalCount: number;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  runUpdate: () => void;
  thread_id: number;
}

const Comments: React.FC<Props> = ({
  comments,
  commentsTotalCount,
  page,
  setPage,
  runUpdate,
  thread_id,
}) => {
  const [errorText, setErrorText] = useState<string>("");
  const [defaultContent, setDefaultContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { username } = useUser();
  const navigate = useNavigate();

  // The default limit query is 10 based on shibespaceAPI
  // Also, this allows the page query to always be valid.
  const totalPageCount = Math.ceil(commentsTotalCount / 10);

  const mapCommentsToElements = (comments: Comment[]): JSX.Element[] => {
    // This check allows us to redirect the user to the second last page
    // if they delete the single last comment
    let singleLastComment = false;
    if (totalPageCount > 1 && (commentsTotalCount - 1) % 10 === 0) {
      singleLastComment = true;
    }

    return comments.map((c) => (
      <CommentMain
        key={c.id}
        {...c}
        setPage={setPage}
        runUpdate={runUpdate}
        singleLastComment={singleLastComment}
      />
    ));
  };

  const handleNewComment = async (formData: FormData): Promise<void> => {
    const CommentData: CommentData = {
      content: formData.get("content") as string,
      thread_id: thread_id,
    };

    // Prevent fields from being cleared
    setDefaultContent(CommentData.content);

    flushSync(() => {
      setErrorText("");
      setLoading(true);
    });

    try {
      const response = await fetch(
        import.meta.env.VITE_SHIBESPACEAPI_BASEURL + "/comments",
        {
          method: "POST",
          credentials: "include", // To send the jwt cookie
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(CommentData),
        }
      );

      if (!response.ok) {
        const errorResponse = (await response.json()) as ErrorResponse;

        // There could be multiple reasons for unauthorized
        if (
          response.status === StatusCodes.UNAUTHORIZED &&
          errorResponse.error.includes("cookie 'jwt' is not found")
        ) {
          setErrorText("You must be logged in to create a new comment");
          console.error("You must be logged in to create a new comment");
        } else {
          throw new Error(errorResponse.error);
        }
      } else {
        setDefaultContent("");
        setPage(Math.ceil((commentsTotalCount + 1) / 10)); // Bring to the last page
        runUpdate();
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
    <>
      {comments.length ? (
        <>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems={{ sm: "flexstart" }}
            gap={1}
            width="100%"
            pt={2}
          >
            <Typography variant="h6">Comments</Typography>
            <Pagination
              count={totalPageCount}
              page={page} // So that the page remains as previously set
              hidePrevButton={true}
              hideNextButton={true}
              onChange={(_event, value: number) => setPage(value)}
            />
          </Box>
          {mapCommentsToElements(comments)}
        </>
      ) : null}
      {/* User must be logged in to comment */}
      {username ? (
        <Box width="100%">
          <form action={handleNewComment}>
            <FormControl sx={{ mt: 1.5 }} fullWidth>
              <TextField
                name="content"
                label="Share your thoughts"
                type="text"
                margin="normal"
                defaultValue={defaultContent}
                error={errorText !== ""}
                helperText={errorText}
                disabled={loading}
                required
                rows={5}
                multiline
              ></TextField>
              <Box width="100%" display="flex" justifyContent="end">
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    width: { xs: "100%", md: "17.5%", lg: "15%" },
                    height: "36.5px",
                    mt: 1.5,
                  }}
                  startIcon={
                    loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : null
                  }
                  disabled={loading}
                >
                  {loading ? "" : "Comment"}
                </Button>
              </Box>
            </FormControl>
          </form>
        </Box>
      ) : (
        <Button
          type="button"
          variant="contained"
          sx={{
            height: "36.5px",
            textWrap: "nowrap",
            mt: 4,
          }}
          onClick={() => navigate(ROUTEPATHS.LOGIN)}
        >
          Log in to comment
        </Button>
      )}
    </>
  );
};

export default Comments;
