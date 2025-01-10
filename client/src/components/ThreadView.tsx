import { Box, Chip, Typography } from "@mui/material";
import { Thread, UserInfo } from "../types/shibespaceAPI";
import { useEffect, useState } from "react";

import Grid from "@mui/material/Grid2";
import convertToRelativeTime from "../utils/convertToRelativeTime";
import getUserIcon from "../utils/getUserIcon";
import { grey } from "@mui/material/colors";

const ThreadView: React.FC<Thread> = (props) => {
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

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" mb={1} sx={{ wordBreak: "break-word" }}>
        {props.title}{" "}
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
          <Chip key={t} label={t} size="small" />
        ))}
      </Box>
      <Box sx={{ flexGrow: 1, mt: 2, p: 2, background: grey[100] }}>
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
            <Typography variant="body1" mb={1}>
              {props.content}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              last updated {convertToRelativeTime(props.updated_timestamp)}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ThreadView;
