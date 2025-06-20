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
import Search from "./pages/Search";
import Browse from "./pages/Browse";
import Watchlist from "./pages/Watchlist";
import Logs from "./pages/Logs";
import SelectedMovies from "./components/SelectedMovies";
import MovieModal from "./components/MovieModal";

// Redirects unauthenticated users to login
function AuthWrapper({ token, children }) {
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

// Fallback UI for unexpected errors
function ErrorFallback({ error }) {
  return (
    <div className="p-4 bg-red-100 text-red-700">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
    </div>
  );
}

const App = () => {
  // Auth + selection state
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null
  );
  const [selectedPosters, setSelectedPosters] = useState([]); // now stores movie objects
  const [posterMap, setPosterMap] = useState({});
  const [selectedMovie, setSelectedMovie] = useState(null);

  // Alert state
  const [successAlert, setSuccessAlert] = useState(false);
  const [watchlistAlert, setWatchlistAlert] = useState(false);
  const [watchlistRemoveAlert, setWatchlistRemoveAlert] = useState(false);

  // Watchlist cache state
  const [watchlistTitles, setWatchlistTitles] = useState([]);

  // state for drawer tracking
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  // Set up Axios auth headers and fetch watchlist on login
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      fetchWatchlistTitles();
    } else {
      delete axios.defaults.headers.common.Authorization;
    }
  }, [token]);

  // Fetch user's watchlist titles
  const fetchWatchlistTitles = async () => {
    try {
      const res = await axios.get("http://localhost:3001/watchlist/me");
      setWatchlistTitles(res.data); // store full movie objects
    } catch (err) {
      console.error("Failed to load watchlist titles", err.message);
    }
  };

  // Handle login/register token state
  const handleAuth = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  };

  // Handle logout and clear all relevant state
  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("token");
    setSelectedPosters([]);
    setPosterMap({});
    setWatchlistTitles([]);
  };

  // Add a poster to the selection
  const handleAddPoster = (movie) => {
    if (
      selectedPosters.some((m) => m.id === movie.id) ||
      selectedPosters.length >= 3
    )
      return;

    const posterUrl =
      movie.poster ||
      (movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null);

    setSelectedPosters((prev) => [...prev, movie]);
    setPosterMap((prev) => ({ ...prev, [movie.id]: posterUrl }));
  };

  // Remove a poster from selection
  const handleRemovePoster = (movieId) => {
    setSelectedPosters((prev) => prev.filter((m) => m.id !== movieId));

    setPosterMap((prev) => {
      const copy = { ...prev };
      delete copy[movieId];
      return copy;
    });
  };

  // Submit final selection to the backend (still used for the “successAlert”)
  const handleConfirmSelection = async (selectedMovie) => {
    try {
      const moviesToSave = selectedPosters.map((movie) => ({
        title: movie.title,
        poster: posterMap[movie.id],
        isSelected: movie.id === selectedMovie.id,
      }));

      await axios.post("/api/logs", { movies: moviesToSave });

      setSuccessAlert(true);
      setTimeout(() => setSuccessAlert(false), 3000);
    } catch (err) {
      console.error("Failed to save selection:", err);
    }
  };

  // Add a movie to the watchlist and update cached titles
  const handleAddToWatchlist = async (movie) => {
    const token = localStorage.getItem("token");
    if (!token || !movie?.title) return;

    try {
      await axios.post(
        "http://localhost:3001/watchlist/add",
        { id: movie.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWatchlistAlert(true);
      setTimeout(() => setWatchlistAlert(false), 3000);
      setWatchlistTitles((prev) => [...prev, movie]); // push full object
    } catch (err) {
      console.error("Failed to add to watchlist", err.message);
    }
  };

  // Remove a movie from the watchlist and update local state
  const handleRemoveFromWatchlist = async (movie) => {
    const token = localStorage.getItem("token");
    if (!token || !movie?.title) return;

    try {
      await axios.delete("http://localhost:3001/watchlist/remove", {
        data: { title: movie.title },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setWatchlistRemoveAlert(true);
      setTimeout(() => setWatchlistRemoveAlert(false), 3000);
      setWatchlistTitles((prev) => prev.filter((t) => t.title !== movie.title));
    } catch (err) {
      console.error("Failed to remove from watchlist", err.message);
    }
  };

  return (
    <Router>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        {/* Toast alerts */}
        {successAlert && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2  bg-green-500 text-white px-6 py-3 rounded shadow-lg text-lg z-50 animate-fade-in-out">
            Selection saved successfully!
          </div>
        )}
        {watchlistAlert && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg z-50">
            Movie added to watchlist
          </div>
        )}
        {watchlistRemoveAlert && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded shadow-lg z-50">
            Movie removed from watchlist
          </div>
        )}

        {/* Routes */}
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
                <NavBar onLogout={handleLogout} isDrawerOpen={isDrawerOpen} />

                <SelectedMovies
                  selectedPosters={selectedPosters}
                  posterMap={posterMap}
                  setSelectedMovie={setSelectedMovie}
                  handleRemovePoster={handleRemovePoster}
                  handleAddPoster={handleAddPoster}
                  allWatchlistTitles={watchlistTitles}
                  setSelectedPosters={setSelectedPosters}
                  setPosterMap={setPosterMap}
                  isDrawerOpen={isDrawerOpen}
                  setIsDrawerOpen={setIsDrawerOpen}
                />

                {selectedMovie && (
                  <MovieModal
                    movie={selectedMovie}
                    onClose={() => setSelectedMovie(null)}
                    onAdd={() => handleAddPoster(selectedMovie)}
                    onRemove={() => handleRemovePoster(selectedMovie.id)}
                    isSelected={selectedPosters.some(
                      (m) => m.id === selectedMovie.id
                    )}
                    canAdd={selectedPosters.length < 3}
                    handleAddToWatchlist={handleAddToWatchlist}
                    handleRemoveFromWatchlist={handleRemoveFromWatchlist}
                    watchlistTitles={watchlistTitles}
                    refreshWatchlist={fetchWatchlistTitles}
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
                        watchlistTitles={watchlistTitles}
                        handleAddToWatchlist={handleAddToWatchlist}
                        handleRemoveFromWatchlist={handleRemoveFromWatchlist}
                        isDrawerOpen={isDrawerOpen}
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
                        watchlistTitles={watchlistTitles}
                        handleAddToWatchlist={handleAddToWatchlist}
                        handleRemoveFromWatchlist={handleRemoveFromWatchlist}
                        isDrawerOpen={isDrawerOpen}
                      />
                    }
                  />
                  <Route
                    path="/search"
                    element={
                      <Search
                        selectedPosters={selectedPosters}
                        posterMap={posterMap}
                        handleAddPoster={handleAddPoster}
                        handleRemovePoster={handleRemovePoster}
                        setSelectedMovie={setSelectedMovie}
                        selectedMovie={selectedMovie}
                        watchlistTitles={watchlistTitles}
                        handleAddToWatchlist={handleAddToWatchlist}
                        handleRemoveFromWatchlist={handleRemoveFromWatchlist}
                        isDrawerOpen={isDrawerOpen}
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
                        handleAddToWatchlist={handleAddToWatchlist}
                        handleRemoveFromWatchlist={handleRemoveFromWatchlist}
                        isDrawerOpen={isDrawerOpen}
                      />
                    }
                  />
                  <Route
                    path="/logs"
                    element={<Logs isDrawerOpen={isDrawerOpen} />}
                  />
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
