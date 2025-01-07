import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { usernameAndExpiry } from "../types/types";

type Username = string | null;

interface UserContextType {
  username: Username;
  startExpiryCheck: () => void;
}

// Safer fallback compared to undefined
const defaultUserContextValue: UserContextType = {
  username: null,
  startExpiryCheck: () => {},
};

const UserContext = createContext<UserContextType>(defaultUserContextValue);

interface Props {
  children: ReactNode;
}

export const UserProvider: React.FC<Props> = ({ children }) => {
  const [username, setUsername] = useState<Username>(null);
  const [check, setCheck] = useState<boolean>(false);

  // Allow the triggering of useEffect() below which detects the login signal
  const startExpiryCheck = () => setCheck((prevCheck) => !prevCheck);

  // This effect uses usernameAndExpiry in local storage as a signal to
  // check if the user is currently logged in. The timing of the expiry
  // matches that of the jwt cookie that is only accessible through HTTP.
  // It periodically checks if the expiry date is past, i.e. the user is logged out.
  useEffect(() => {
    const usernameAndExpiry = localStorage.getItem("usernameAndExpiry");

    // If user is not logged in, do nothing
    if (usernameAndExpiry !== null) {
      const { username, expiry } = JSON.parse(
        usernameAndExpiry
      ) as usernameAndExpiry;

      // Check if the user is logged in initially
      if (Date.now() > expiry) {
        localStorage.removeItem("usernameAndExpiry");
        setUsername(null);
      } else {
        setUsername(username);

        // Check if the user is still logged in once in a while
        const intervalID = setInterval(() => {
          // If the user is logged out, we can stop the interval
          if (Date.now() > expiry) {
            localStorage.removeItem("usernameAndExpiry");
            setUsername(null);
            clearInterval(intervalID);
          }
        }, 5000);

        return () => clearInterval(intervalID);
      }
    }
  }, [check]);

  return (
    // Provide the actual context using state
    <UserContext.Provider value={{ username, startExpiryCheck }}>
      {children}
    </UserContext.Provider>
  );
};

// This function must be used within a UserContext.Provider to properly access the context value
export const useUser = () => useContext(UserContext);

// This function creates and sets the item in local storage that signals a user being logged in
export const signalLogin = (username: string): void => {
  const usernameAndExpiry: usernameAndExpiry = {
    username: username,
    expiry: Date.now() + 60 * 60 * 1000, // 1 hour from the present based on shibespaceAPI
  };
  localStorage.setItem("usernameAndExpiry", JSON.stringify(usernameAndExpiry));
};
