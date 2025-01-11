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
import { ROUTEPATHS } from "../types/types";
import { StatusCodes } from "http-status-codes";
import { grey } from "@mui/material/colors";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface Props {
  editing: boolean;
  toggleEdit: () => void;
  submitEditButton: React.MutableRefObject<HTMLButtonElement | null>;
  thread_id: number;
}

const ThreadMainButtons: React.FC<Props> = ({
  editing,
  toggleEdit,
  submitEditButton,
  thread_id,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>("");
  const navigate = useNavigate();

  const handleDelete = async (): Promise<void> => {
    try {
      const response = await fetch(
        import.meta.env.VITE_SHIBESPACEAPI_BASEURL + "/threads/" + thread_id,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorResponse = (await response.json()) as ErrorResponse;
        if (response.status === StatusCodes.UNAUTHORIZED) {
          setErrorText("You do not have permission to delete this thread");
          console.error("You do not have permission to delete this thread");
        } else {
          throw new Error(errorResponse.error);
        }
      } else {
        navigate(ROUTEPATHS.HOME);
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
        <DialogTitle>{"Delete this thread?"}</DialogTitle>
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

export default ThreadMainButtons;
