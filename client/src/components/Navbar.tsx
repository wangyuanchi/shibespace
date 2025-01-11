import {
  AppBar,
  Box,
  Button,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
} from "@mui/material";

import Logout from "@mui/icons-material/Logout";
import { ROUTEPATHS } from "../types/types";
import getUserIcon from "../utils/getUserIcon";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUser } from "./UserProvider";

const Navbar: React.FC = () => {
  const { username, startSessionCheck } = useUser();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();

  const handleRedirectToHome = (): void => {
    navigate(ROUTEPATHS.HOME);
  };

  const handleRedirectToLogin = (): void => {
    navigate(ROUTEPATHS.LOGIN);
  };

  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await fetch(
        import.meta.env.VITE_SHIBESPACEAPI_BASEURL + "/users/unauth",
        {
          credentials: "include",
        }
      );
      localStorage.removeItem("session");
      startSessionCheck();

      // Close the menu before redirecting to the home page
      handleClose();
      navigate(ROUTEPATHS.HOME);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed">
        <Toolbar
          sx={{ display: "flex", justifyContent: "space-between", p: 1.5 }}
        >
          <span onClick={handleRedirectToHome} className="logo">
            SHIBESPACE
          </span>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button color="inherit" onClick={handleRedirectToHome}>
              Threads
            </Button>
            {username ? (
              <>
                <Button onClick={handleClick} sx={{ p: 0 }}>
                  <Box
                    sx={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      overflow: "hidden",
                    }}
                  >
                    <img src={getUserIcon(username)} alt="user icon" />
                  </Box>
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  sx={{ mt: 0.75 }}
                >
                  <MenuItem onClick={handleLogout} sx={{ pr: 3 }}>
                    <ListItemIcon>
                      <Logout fontSize="small" />
                    </ListItemIcon>
                    Log out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button color="inherit" onClick={handleRedirectToLogin}>
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Navbar;
