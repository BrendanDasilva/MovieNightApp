import { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Home from "./pages/Home";
import Logs from "./pages/Logs";
import Watchlist from "./pages/Watchlist";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  if (!token) {
    return showLogin ? (
      <LoginForm onAuth={setToken} toggle={() => setShowLogin(false)} />
    ) : (
      <RegisterForm onAuth={setToken} toggle={() => setShowLogin(true)} />
    );
  }

  return (
    <Router>
      <NavBar onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/watchlist"
          element={<Watchlist onLogout={handleLogout} />}
        />
        <Route path="/logs" element={<Logs />} />
      </Routes>
    </Router>
  );
};

export default App;
