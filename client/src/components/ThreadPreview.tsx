import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Typography,
} from "@mui/material";
import { Thread, UserInfo } from "../types/shibespaceAPI";
import { useEffect, useState } from "react";

import { ROUTEPATHS } from "../types/types";
import convertToRelativeTime from "../utils/convertToRelativeTime";
import { useNavigate } from "react-router-dom";

const ThreadPreview: React.FC<Thread> = (props) => {
  const [username, setUsername] = useState<string>("unknown user");
  const navigate = useNavigate();

  const viewThreadID = (): void => {
    navigate(ROUTEPATHS.THREADS + "/" + props.id);
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
    <Card sx={{ width: { xs: 400, sm: 500, md: 800, lg: 1000 }, mb: 4 }}>
      <CardActionArea onClick={viewThreadID}>
        <CardContent>
          <Typography variant="h6" sx={{ wordBreak: "break-word" }}>
            {props.title}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }} mb={1}>
            by {username} • last updated{" "}
            {convertToRelativeTime(props.updated_timestamp)}
          </Typography>
          <Typography
            variant="body1"
            mb={1.25}
            sx={{ wordBreak: "break-word" }}
          >
            {props.content.length <= 200
              ? props.content
              : props.content.slice(0, 200) + "..."}
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: "10px 10px",
            }}
          >
            {props.tags.map((t) => (
              <Chip key={t} label={t} size="small" /> // tag values are unique
            ))}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ThreadPreview;
