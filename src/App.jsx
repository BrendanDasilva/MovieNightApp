import { useState, useEffect } from "react";
import axios from "axios";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import NavBar from "./components/NavBar";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Home from "./pages/Home";
import Logs from "./pages/Logs";
import Watchlist from "./pages/Watchlist";

const AuthWrapper = ({ children }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function ErrorFallback({ error }) {
  return (
    <div className="p-4 bg-red-100 text-red-700">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
    </div>
  );
}

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));

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

  return (
    <Router>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Routes>
          <Route
            path="/login"
            element={
              token ? (
                <Navigate to="/" replace />
              ) : (
                <LoginForm onAuth={setToken} />
              )
            }
          />
          <Route
            path="/register"
            element={
              token ? (
                <Navigate to="/" replace />
              ) : (
                <RegisterForm onAuth={setToken} />
              )
            }
          />

          <Route
            path="/*"
            element={
              <AuthWrapper>
                <NavBar onLogout={handleLogout} />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route
                    path="/watchlist"
                    element={<Watchlist onLogout={handleLogout} />}
                  />
                  <Route path="/logs" element={<Logs />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AuthWrapper>
            }
          />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
};

export default App;
