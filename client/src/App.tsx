import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import NewThread from "./pages/NewThread.tsx";
import NotFound from "./pages/NotFound";
import { ROUTEPATHS } from "./types/types";
import SignUp from "./pages/SignUp";
import SingleThread from "./pages/SingleThread.tsx";
import UserProvider from "./components/UserProvider";

const App: React.FC = () => {
  return (
    <UserProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path={ROUTEPATHS.HOME} element={<Home />} />
          <Route path={ROUTEPATHS.LOGIN} element={<Login />} />
          <Route path={ROUTEPATHS.SIGNUP} element={<SignUp />} />
          <Route path={ROUTEPATHS.THREADSNEW} element={<NewThread />} />
          <Route
            path={ROUTEPATHS.THREADS + "/:thread_id"}
            element={<SingleThread />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
