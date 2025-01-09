import { Session } from "../types/types";

// This function creates and sets the session item in local storage
const setSession = (username: string): void => {
  const session: Session = {
    username: username,
    expiry: Date.now() + 60 * 60 * 1000, // 1 hour from the present based on shibespaceAPI
  };
  localStorage.setItem("session", JSON.stringify(session));
};

export default setSession;
