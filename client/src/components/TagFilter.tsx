import { Box, Chip, FormControl, TextField } from "@mui/material";

import { Thread } from "../types/shibespaceAPI";
import { flushSync } from "react-dom";
import { useState } from "react";

interface Props {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  threads: Thread[] | null;
}

const Tags: React.FC<Props> = ({ tags, setTags, setPage, threads }) => {
  const [errorText, setErrorText] = useState<string>("");
  const [defaultTag, setDefaultTag] = useState<string>("");
  const [isValidTag, setIsValidTag] = useState<boolean>(true);

  const mapTagsToElements = (tags: string[]): JSX.Element[] => {
    return tags.map((t) => (
      <Chip
        key={t}
        label={t}
        // Delete itself from the tags state in Home
        onDelete={() => {
          setTags((prevTags) => {
            return [...prevTags].filter((tag) => tag !== t);
          });
        }}
      />
    ));
  };

  const handleNewTag = (formData: FormData): void => {
    const newTag = formData.get("tag-filter") as string;

    setDefaultTag(newTag);

    flushSync(() => {
      setErrorText("");
      setIsValidTag(true);
    });

    if (tags.includes(newTag)) {
      setErrorText("Tag is already being filtered");
      setIsValidTag(false);
      return;
    } else if (newTag.length < 1 || newTag.length > 35) {
      setErrorText("Tag must be between 1 and 35 characters long");
      setIsValidTag(false);
      return;
    } else {
      setDefaultTag(""); // Clear field if successful
      setTags((prevTags) => [...prevTags, newTag]);
      setPage(1); // We want to return to the first page
    }
  };

  return (
    <Box
      sx={{
        width: { xs: 400, sm: 500, md: 800, lg: 1000 },
      }}
    >
      <form action={handleNewTag}>
        <FormControl sx={{ mb: 2 }}>
          <TextField
            name="tag-filter"
            type="text"
            label="Tag Filter"
            variant="standard"
            defaultValue={defaultTag}
            error={!isValidTag}
            helperText={errorText}
            // There cannot be more than 5 tags according to shibespaceAPI
            // We also want it to be enabled when threads are loaded
            disabled={tags.length >= 5 || threads === null}
          />
        </FormControl>
      </form>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: "10px 10px",
        }}
        mb={2}
      >
        {mapTagsToElements(tags)}
      </Box>
    </Box>
  );
};

export default Tags;
