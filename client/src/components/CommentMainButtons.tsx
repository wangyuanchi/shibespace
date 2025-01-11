import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from "@mui/material";

import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { ErrorResponse } from "../types/shibespaceAPI";
import { StatusCodes } from "http-status-codes";
import { grey } from "@mui/material/colors";
import { useState } from "react";

interface Props {
  editing: boolean;
  toggleEdit: () => void;
  submitEditButton: React.MutableRefObject<HTMLButtonElement | null>;
  comment_id: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  runUpdate: () => void;
  singleLastComment: boolean;
}

const CommentMainButtons: React.FC<Props> = ({
  editing,
  toggleEdit,
  submitEditButton,
  comment_id,
  setPage,
  runUpdate,
  singleLastComment,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>("");

  const handleDelete = async (): Promise<void> => {
    try {
      const response = await fetch(
        import.meta.env.VITE_SHIBESPACEAPI_BASEURL + "/comments/" + comment_id,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorResponse = (await response.json()) as ErrorResponse;

        if (
          (response.status === StatusCodes.UNAUTHORIZED &&
            errorResponse.error.includes("cookie 'jwt' is not found")) ||
          errorResponse.error.includes(
            "mismatch between user ID from jwt and target ID"
          )
        ) {
          setErrorText("You do not have permission to delete this thread");
          console.error("You do not have permission to delete this thread");
        } else {
          throw new Error(errorResponse.error);
        }
      } else {
        // Redirect to second last page if the comment deleted is the single last comment
        setPage((prevPage) => (singleLastComment ? prevPage - 1 : prevPage));
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
  };

  return (
    <Box display="flex" justifyContent="space-between" gap={1}>
      {editing ? (
        <IconButton
          // We need to do this as the button is outside the form
          onClick={() => {
            submitEditButton.current?.click();
          }}
          sx={{
            cursor: "pointer",
            color: grey[600],
            "&:hover": {
              color: grey[800],
            },
          }}
        >
          <CheckIcon />
        </IconButton>
      ) : null}
      <IconButton
        onClick={toggleEdit}
        sx={{
          cursor: "pointer",
          color: grey[600],
          "&:hover": {
            color: grey[800],
          },
        }}
      >
        {editing ? <CloseIcon /> : <EditIcon />}
      </IconButton>
      <IconButton
        onClick={() => {
          setOpen(true);
          setErrorText("");
        }}
        sx={{
          cursor: "pointer",
          color: grey[600],
          "&:hover": {
            color: grey[800],
          },
        }}
      >
        <DeleteIcon />
      </IconButton>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{"Delete this comment?"}</DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <DialogContentText>You cannot undo this action.</DialogContentText>
          {errorText ? (
            <DialogContentText color="error">{errorText}</DialogContentText>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommentMainButtons;
