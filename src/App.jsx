import { useState, useEffect } from "react";
import axios from "axios";
import AuthForm from "./components/AuthForm";
import MainApp from "./MainApp";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);

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
    return <AuthForm onAuth={setToken} />;
  }

  return <MainApp onLogout={handleLogout} />;
};

export default App;
