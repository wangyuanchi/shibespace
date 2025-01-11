import { Box, IconButton } from "@mui/material";

import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { grey } from "@mui/material/colors";

interface Props {
  editing: boolean;
  toggleEdit: () => void;
  submitEditButton: React.MutableRefObject<HTMLButtonElement | null>;
}

const ThreadMainButtons: React.FC<Props> = ({
  editing,
  toggleEdit,
  submitEditButton,
}) => {
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
    </Box>
  );
};

export default ThreadMainButtons;
