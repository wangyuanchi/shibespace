import { Session } from "../types/types";

/*
This function checks the permissions of a potentially logged in user against a target user.
This check is only on the surface level as localStorage can be tampered with.
*/
const checkSurfacePerms = (targetUsername: string): boolean => {
  let username = "";
  try {
    const session = localStorage.getItem("session");
    if (session) {
      const sessionObject = JSON.parse(session) as Session;
      username = sessionObject.username;
    }
  } catch (error) {
    console.error("Failed to parse JSON:", error);
  }

  return username === targetUsername;
};

export default checkSurfacePerms;
