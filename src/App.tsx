
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./components/Dashboard";
import Trash from "./pages/Trash";
import PublicSearch from "./pages/PublicSearch";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./components/PrivateRoute";
import ResearchPage from "./pages/ResearchPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/public-search" element={<PublicSearch />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/trash" element={<PrivateRoute><Trash /></PrivateRoute>} />
        <Route path="/research" element={<PrivateRoute><ResearchPage /></PrivateRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
