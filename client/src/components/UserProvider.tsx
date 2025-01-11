import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { Session } from "../types/types";

type Username = string | null;

interface UserContextType {
  username: Username;
  startSessionCheck: () => void;
}

const defaultUserContextValue: UserContextType = {
  username: null,
  startSessionCheck: () => {},
};

const UserContext = createContext<UserContextType>(defaultUserContextValue);

// This function must be used within a UserContext.Provider to properly access the context value
export const useUser = () => useContext(UserContext);

interface Props {
  children: ReactNode;
}

const UserProvider: React.FC<Props> = ({ children }) => {
  const [username, setUsername] = useState<Username>(null);
  const [check, setCheck] = useState<boolean>(false);

  const startSessionCheck = () => setCheck((prevCheck) => !prevCheck);

  /*
  This effect is essentially a client sided session check that uses local storage.
  The session item expiry value in local storage matches that of the jwt that is only accessible through HTTP.
  If the session item does not exist, it proceeds as if no user is logged in.
  Otherwise, it checks if the session is still valid in intervals.
  */
  useEffect(() => {
    const session = localStorage.getItem("session");

    if (session !== null) {
      const { username, expiry } = JSON.parse(session) as Session;

      // Initial session check
      if (Date.now() > expiry) {
        localStorage.removeItem("session");
        setUsername(null);
      } else {
        setUsername(username); // User is logged in
        const intervalID = setInterval(() => {
          if (Date.now() > expiry) {
            localStorage.removeItem("session");
            setUsername(null);
            clearInterval(intervalID); // We can stop the interval after session expires.
          }
        }, 5000);
        return () => clearInterval(intervalID);
      }
    } else {
      setUsername(null); // Logout
    }
  }, [check]);

  return (
    <UserContext.Provider value={{ username, startSessionCheck }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
