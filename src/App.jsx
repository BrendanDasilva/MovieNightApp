import { useState, useEffect } from "react";
import axios from "axios";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import MainApp from "./MainApp";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [showRegister, setShowRegister] = useState(false);

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

  if (token) {
    return <MainApp onLogout={handleLogout} />;
  }

  return showRegister ? (
    <RegisterForm
      onAuth={setToken}
      switchToLogin={() => setShowRegister(false)}
    />
  ) : (
    <LoginForm
      onAuth={setToken}
      switchToRegister={() => setShowRegister(true)}
    />
  );
};

export default App;
