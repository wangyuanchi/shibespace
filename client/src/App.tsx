import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import NotFound from "./pages/NotFound";
import { ROUTEPATHS } from "./types/types";

const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path={ROUTEPATHS.HOME} element={<Home />} />
        <Route path={ROUTEPATHS.LOGIN} element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
