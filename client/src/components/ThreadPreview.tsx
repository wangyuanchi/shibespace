import {
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import { Thread, UserInfo } from "../types/shibespaceAPI";
import { useEffect, useState } from "react";

import Tag from "./Tag";
import convertToRelativeTime from "../utils/convertToRelativeTime";

interface Props extends Thread {}

const ThreadPreview: React.FC<Props> = (props) => {
  const [username, setUsername] = useState<string>("unknown user");

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

  const mapTagsToElements = (tags: string[]): JSX.Element[] => {
    // Tags are unique according to shibespaceAPI
    return tags.map((t) => <Tag key={t} value={t} />);
  };

  return (
    <Card sx={{ width: { xs: 400, sm: 500, md: 800, lg: 1000 }, mb: 4 }}>
      <CardActionArea>
        <CardContent>
          <Typography variant="h6">{props.title}</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }} mb={1}>
            by {username} • last updated{" "}
            {convertToRelativeTime(props.updated_timestamp)}
          </Typography>
          <Typography variant="body1" mb={1.25}>
            {props.content.length <= 200
              ? props.content
              : props.content.slice(0, 200) + "..."}
          </Typography>
          <Stack direction="row" spacing={1.5}>
            {mapTagsToElements(props.tags)}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ThreadPreview;
