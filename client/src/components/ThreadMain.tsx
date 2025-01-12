import { Box, Button, FormControl, TextField, Typography } from "@mui/material";
import {
  ErrorResponse,
  Thread,
  ThreadContent,
  UserInfo,
} from "../types/shibespaceAPI";
import { useEffect, useRef, useState } from "react";

import Grid from "@mui/material/Grid2";
import { StatusCodes } from "http-status-codes";
import ThreadMainButtons from "./ThreadMainButtons";
import { blue } from "@mui/material/colors";
import checkSurfacePerms from "../utils/checkPermissions";
import convertToRelativeTime from "../utils/convertToRelativeTime";
import getUserIcon from "../utils/getUserIcon";

interface Props extends Thread {
  runUpdate: () => void;
}

const ThreadMain: React.FC<Props> = (props) => {
  const [username, setUsername] = useState<string>("");
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
    const threadContent: ThreadContent = {
      content: formData.get("content") as string,
    };

    // So that content remains if an error occurs
    setDefaultContent(threadContent.content);

    try {
      const response = await fetch(
        import.meta.env.VITE_SHIBESPACEAPI_BASEURL +
          `/threads/${props.id}/content`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(threadContent),
        }
      );

      if (!response.ok) {
        const errorResponse = (await response.json()) as ErrorResponse;
        if (response.status === StatusCodes.UNAUTHORIZED) {
          setEditError("You do not have permission to edit this thread");
          console.error("You do not have permission to edit this thread");
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
        flexGrow: 1,
        mt: 2,
        p: 2,
        background: blue[50],
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
              <img
                src={getUserIcon(username)}
                alt="user icon"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
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
                <ThreadMainButtons
                  editing={editing}
                  toggleEdit={toggleEdit}
                  submitEditButton={submitEditButton}
                  thread_id={props.id}
                />
              ) : null}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ThreadMain;
