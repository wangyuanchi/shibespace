import { ReactNode, createContext, useContext, useState } from "react";

type Username = string | null;

interface UserContextType {
  username: Username;
  setUsername: (username: Username) => void;
}

// Safer fallback compared to undefined
const defaultUserContextValue: UserContextType = {
  username: null,
  setUsername: () => {},
};

const UserContext = createContext<UserContextType>(defaultUserContextValue);

interface Props {
  children: ReactNode;
}

export const UserProvider: React.FC<Props> = ({ children }) => {
  const [username, setUsername] = useState<Username>(null);

  return (
    // Provide the actual context using state
    <UserContext.Provider value={{ username, setUsername }}>
      {children}
    </UserContext.Provider>
  );
};

// This function must be used within a UserContext.Provider to properly access the context value
export const useUser = () => useContext(UserContext);
