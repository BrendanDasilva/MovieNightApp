import React, { useState, useEffect } from "react";
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
import Browse from "./pages/Browse";
import Watchlist from "./pages/Watchlist";
import Logs from "./pages/Logs";

import SelectedMovies from "./components/SelectedMovies";
import MovieModal from "./components/MovieModal";

function AuthWrapper({ token, children }) {
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function ErrorFallback({ error }) {
  return (
    <div className="p-4 bg-red-100 text-red-700">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
    </div>
  );
}

const App = () => {
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null
  );

  const [selectedPosters, setSelectedPosters] = useState([]);
  const [posterMap, setPosterMap] = useState({});
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [successAlert, setSuccessAlert] = useState(false);
  const [watchlistAlert, setWatchlistAlert] = useState(false);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common.Authorization;
    }
  }, [token]);

  const handleAuth = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("token");
    setSelectedPosters([]);
    setPosterMap({});
  };

  const handleAddPoster = async (title, posterUrl) => {
    if (selectedPosters.includes(title) || selectedPosters.length >= 3) return;

    if (!posterUrl && !posterMap[title]) {
      try {
        const res = await axios.get(
          `http://localhost:3001/tmdb?title=${encodeURIComponent(title)}`
        );
        posterUrl = res.data.poster;
      } catch (err) {
        console.error("Failed to fetch poster for:", title, err);
        posterUrl = null;
      }
    }

    setSelectedPosters((prev) => [...prev, title]);
    setPosterMap((prev) => ({ ...prev, [title]: posterUrl }));
  };

  const handleRemovePoster = (title) => {
    setSelectedPosters((prev) => prev.filter((t) => t !== title));
    setPosterMap((prev) => {
      const copy = { ...prev };
      delete copy[title];
      return copy;
    });
  };

  const handleConfirmSelection = async (selectedTitle) => {
    try {
      const moviesToSave = selectedPosters.map((title) => ({
        title,
        poster: posterMap[title],
        isSelected: title === selectedTitle,
      }));

      await axios.post("/api/logs", { movies: moviesToSave });

      setSuccessAlert(true);
      setTimeout(() => setSuccessAlert(false), 3000);
    } catch (err) {
      console.error("Failed to save selection:", err);
    }
  };

  const handleAddToWatchlist = async (movie) => {
    const token = localStorage.getItem("token");
    if (!token || !movie?.title) return;

    try {
      await axios.post("http://localhost:3001/watchlist/add", movie, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWatchlistAlert(true);
      setTimeout(() => setWatchlistAlert(false), 3000);
      console.log(`✅ Added ${movie.title} to watchlist`);
    } catch (err) {
      console.error("❌ Failed to add to watchlist", err.message);
    }
  };

  return (
    <Router>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        {successAlert && (
          <div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                      bg-green-500 text-white px-6 py-3 rounded shadow-lg text-lg z-50 
                      animate-fade-in-out"
          >
            Selection saved successfully!
          </div>
        )}

        {watchlistAlert && (
          <div
            className="fixed top-20 left-1/2 transform -translate-x-1/2 
                      bg-green-500 text-white px-6 py-3 rounded shadow-lg text-lg z-50 
                      animate-fade-in-out"
          >
            Added to watchlist!
          </div>
        )}

        <Routes>
          <Route
            path="/login"
            element={
              token ? (
                <Navigate to="/" replace />
              ) : (
                <LoginForm onAuth={handleAuth} />
              )
            }
          />
          <Route
            path="/register"
            element={
              token ? (
                <Navigate to="/" replace />
              ) : (
                <RegisterForm onAuth={handleAuth} />
              )
            }
          />
          <Route
            path="/*"
            element={
              <AuthWrapper token={token}>
                <NavBar onLogout={handleLogout} />

                <SelectedMovies
                  selectedPosters={selectedPosters}
                  posterMap={posterMap}
                  setSelectedMovie={setSelectedMovie}
                  handleRemovePoster={handleRemovePoster}
                  handleAddPoster={handleAddPoster}
                  allWatchlistTitles={posterMap ? Object.keys(posterMap) : []}
                  handleConfirmSelection={handleConfirmSelection}
                />

                {selectedMovie && (
                  <MovieModal
                    movie={selectedMovie}
                    onClose={() => setSelectedMovie(null)}
                    onAdd={() =>
                      handleAddPoster(selectedMovie.title, selectedMovie.poster)
                    }
                    onRemove={() => handleRemovePoster(selectedMovie.title)}
                    isSelected={selectedPosters.includes(selectedMovie.title)}
                    canAdd={selectedPosters.length < 3}
                    handleAddToWatchlist={handleAddToWatchlist}
                  />
                )}

                <Routes>
                  <Route
                    path="/"
                    element={
                      <Home
                        selectedPosters={selectedPosters}
                        posterMap={posterMap}
                        handleAddPoster={handleAddPoster}
                        handleRemovePoster={handleRemovePoster}
                        selectedMovie={selectedMovie}
                        setSelectedMovie={setSelectedMovie}
                      />
                    }
                  />
                  <Route
                    path="/browse"
                    element={
                      <Browse
                        selectedPosters={selectedPosters}
                        posterMap={posterMap}
                        handleAddPoster={handleAddPoster}
                        handleRemovePoster={handleRemovePoster}
                        setSelectedMovie={setSelectedMovie}
                        selectedMovie={selectedMovie}
                      />
                    }
                  />
                  <Route
                    path="/watchlist"
                    element={
                      <Watchlist
                        onLogout={handleLogout}
                        selectedPosters={selectedPosters}
                        setSelectedPosters={setSelectedPosters}
                        posterMap={posterMap}
                        setPosterMap={setPosterMap}
                        handleAddPoster={handleAddPoster}
                        handleRemovePoster={handleRemovePoster}
                        setSelectedMovie={setSelectedMovie}
                      />
                    }
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
