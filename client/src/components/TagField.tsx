import {
  Box,
  Chip,
  FormControl,
  InputAdornment,
  TextField,
} from "@mui/material";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import IconButton from "@mui/material/IconButton";
import { flushSync } from "react-dom";
import { useState } from "react";

interface Props {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
  loading: boolean;
}

const TagField: React.FC<Props> = ({ tags, setTags, loading }) => {
  const [errorText, setErrorText] = useState<string>("");
  const [defaultTag, setDefaultTag] = useState<string>("");
  const [isValidTag, setIsValidTag] = useState<boolean>(true);

  const mapTagsToElements = (tags: string[]): JSX.Element[] => {
    return tags.map((t) => (
      <Chip
        key={t}
        label={t}
        onDelete={() => {
          setTags((prevTags) => {
            return [...prevTags].filter((tag) => tag !== t);
          });
        }}
        sx={{ mb: 1 }}
      />
    ));
  };

  const handleNewTag = (formData: FormData): void => {
    const newTag = formData.get("tag") as string;

    setDefaultTag(newTag);

    flushSync(() => {
      setErrorText("");
      setIsValidTag(true);
    });

    if (tags.includes(newTag)) {
      setErrorText("Tag has already been added");
      setIsValidTag(false);
      return;
    } else if (newTag.length < 1 || newTag.length > 35) {
      setErrorText("Tag must be between 1 and 35 characters long");
      setIsValidTag(false);
      return;
    } else {
      setDefaultTag("");
      setTags((prevTags) => [...prevTags, newTag]);
    }
  };

  return (
    <>
      <form action={handleNewTag}>
        <FormControl sx={{ mb: 1, width: "100%" }}>
          <TextField
            name="tag"
            type="text"
            label="Tags"
            defaultValue={defaultTag}
            error={!isValidTag}
            helperText={errorText}
            disabled={tags.length >= 5 || loading}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="submit"
                      disabled={tags.length >= 5 || loading}
                    >
                      <ArrowForwardIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </FormControl>
      </form>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: "10px 10px",
          my: 1,
        }}
      >
        {mapTagsToElements(tags)}
      </Box>
    </>
  );
};

export default TagField;
