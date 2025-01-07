import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";

import { ROUTEPATHS } from "../types/types";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserProvider";

const Navbar: React.FC = () => {
  const { username } = useUser();

  const navigate = useNavigate();
  const handleRedirectToHome = (): void => {
    navigate(ROUTEPATHS.HOME);
  };
  const handleRedirectToLogin = (): void => {
    navigate(ROUTEPATHS.LOGIN);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography
            variant="h6"
            sx={{
              ":hover": {
                cursor: "pointer",
              },
            }}
            onClick={handleRedirectToHome}
          >
            shibespace
          </Typography>
          {username ? (
            <Typography variant="h6">Welcome, {username}!</Typography>
          ) : (
            <Button color="inherit" onClick={handleRedirectToLogin}>
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Navbar;
