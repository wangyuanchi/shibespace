import { Box, Button, FormControl, TextField, Typography } from "@mui/material";
import { useRef, useState } from "react";

import { Comment } from "../types/shibespaceAPI";
import { CommentContent } from "../types/shibespaceAPI";
import CommentMainButtons from "./CommentMainButtons";
import { ErrorResponse } from "../types/shibespaceAPI";
import Grid from "@mui/material/Grid2";
import { StatusCodes } from "http-status-codes";
import { UserInfo } from "../types/shibespaceAPI";
import checkSurfacePerms from "../utils/checkPermissions";
import convertToRelativeTime from "../utils/convertToRelativeTime";
import getUserIcon from "../utils/getUserIcon";
import { grey } from "@mui/material/colors";
import { useEffect } from "react";

interface Props extends Comment {
  runUpdate: () => void;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  singleLastComment: boolean;
}

const CommentMain: React.FC<Props> = (props) => {
  const [username, setUsername] = useState<string>("unknown user");
  const [editing, setEditing] = useState<boolean>(false);
  const [editError, setEditError] = useState<string>("");
  const [defaultContent, setDefaultContent] = useState<string>(props.content);
  const submitEditButton = useRef<HTMLButtonElement | null>(null);

  const toggleEdit = (): void => {
    setEditError(""); // Reset on every toggle
    setDefaultContent(props.content); // Reset on every toggle
    setEditing((prevEditing) => !prevEditing);
  };

  const handleEdit = async (formData: FormData): Promise<void> => {
    const commentContent: CommentContent = {
      content: formData.get("content") as string,
    };

    // So that content remains if an error occurs
    setDefaultContent(commentContent.content);

    try {
      const response = await fetch(
        import.meta.env.VITE_SHIBESPACEAPI_BASEURL +
          `/comments/${props.id}/content`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(commentContent),
        }
      );

      if (!response.ok) {
        const errorResponse = (await response.json()) as ErrorResponse;
        if (response.status === StatusCodes.UNAUTHORIZED) {
          setEditError("You do not have permission to edit this comment");
          console.error("You do not have permission to edit this comment");
        } else {
          throw new Error(errorResponse.error);
        }
      } else {
        toggleEdit();
        props.runUpdate();
      }
    } catch (error: unknown) {
      setEditError("Something went wrong, please try again later");
      if (error instanceof Error) {
        console.error("Error fetching data:", error.message);
      } else {
        console.error("An unknown error occured:", error);
      }
    }
  };

  useEffect(() => {
    const fetchUsername = async (): Promise<void> => {
      // There should be no error as we are using values provided by the server
      const response = await fetch(
        import.meta.env.VITE_SHIBESPACEAPI_BASEURL +
          "/users/" +
          props.creator_id
      );
      const userInfo = (await response.json()) as UserInfo;
      setUsername(userInfo.username);
    };
    fetchUsername();
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        mt: 2,
        p: 2,
        background: grey[100],
        border: 1,
        borderColor: "grey.500",
      }}
    >
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Box
            display="flex"
            flexDirection={{ sm: "column" }}
            alignItems="center"
            px={{ sm: 2 }}
            gap={1}
          >
            <Box
              sx={{
                width: { xs: 40, sm: 100 },
                height: { xs: 40, sm: 100 },
                borderRadius: { xs: "50%", sm: 0 },
                overflow: "hidden",
              }}
            >
              <img src={getUserIcon(username)} alt="user icon" />
            </Box>
            <Typography
              variant="body1"
              mb={{ sm: 1 }}
              sx={{ wordBreak: "break-word" }}
            >
              {username}
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 9 }}>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            height="100%"
          >
            {editing ? (
              <form action={handleEdit}>
                <FormControl fullWidth>
                  <TextField
                    name="content"
                    defaultValue={defaultContent}
                    error={editError !== ""}
                    helperText={editError}
                    multiline
                    required
                    sx={{ background: "white" }}
                  ></TextField>
                  {/* Don't show this button as we are using the one outside the form */}
                  <Button
                    ref={submitEditButton}
                    type="submit"
                    sx={{ display: "none" }}
                  ></Button>
                </FormControl>
              </form>
            ) : (
              <Typography
                variant="body1"
                mb={1}
                // To load line breaks
                sx={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
              >
                {props.content}
              </Typography>
            )}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              pt={1}
            >
              <Typography variant="body2" color="textSecondary">
                last updated {convertToRelativeTime(props.updated_timestamp)}
              </Typography>
              {/* Only display the "edit" and "delete" buttons for the users that have permission*/}
              {checkSurfacePerms(username) ? (
                <CommentMainButtons
                  editing={editing}
                  toggleEdit={toggleEdit}
                  submitEditButton={submitEditButton}
                  comment_id={props.id}
                  setPage={props.setPage}
                  runUpdate={props.runUpdate}
                  singleLastComment={props.singleLastComment}
                />
              ) : null}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CommentMain;
