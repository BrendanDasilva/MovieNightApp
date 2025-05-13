import React, { useEffect, useState } from "react";
import axios from "axios";
import LoadingDots from "../components/LoadingDots";
import TrendingMovies from "../components/TrendingMovies";
import GenreSpotlight from "../components/GenreSpotlight";
import MovieModal from "../components/MovieModal";
import LatestNews from "../components/LatestNews";
import Footer from "../components/Footer";

const Home = () => {
  const [latestLog, setLatestLog] = useState(null);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingAction, setLoadingAction] = useState(true);
  const [historyError, setHistoryError] = useState(null);
  const [trendingError, setTrendingError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedPosters, setSelectedPosters] = useState(() => {
    const saved = localStorage.getItem("selectedPosters");
    return saved ? JSON.parse(saved) : ["", "", ""];
  });
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [newsError, setNewsError] = useState(null);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState({
    id: 28,
    name: "Action",
  });
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [genreError, setGenreError] = useState(null);

  useEffect(() => {
    localStorage.setItem("selectedPosters", JSON.stringify(selectedPosters));
  }, [selectedPosters]);

  const handleAddPoster = (title) => {
    const emptyIndex = selectedPosters.findIndex((p) => p === "");
    if (emptyIndex !== -1) {
      const updated = [...selectedPosters];
      updated[emptyIndex] = title;
      setSelectedPosters(updated);
    }
  };

  const handleRemovePoster = (title) => {
    setSelectedPosters((prev) => prev.map((p) => (p === title ? "" : p)));
  };

  const handleCloseModal = () => setSelectedMovie(null);

  useEffect(() => {
    const fetchLatestSelection = async () => {
      try {
        const res = await axios.get("/api/logs/latest", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setLatestLog(res.data);
      } catch (err) {
        setHistoryError(err.response?.data?.error || err.message);
      } finally {
        setLoadingHistory(false);
      }
    };

    const fetchTrendingMovies = async () => {
      try {
        const res = await axios.get("/api/tmdb/trending");
        setTrendingMovies(res.data);
      } catch (err) {
        setTrendingError(err.message);
      } finally {
        setLoadingTrending(false);
      }
    };

    const fetchGenres = async () => {
      try {
        const res = await axios.get("/api/tmdb/genres");
        setGenres(res.data);
      } catch (err) {
        setGenreError(err.message);
      } finally {
        setLoadingGenres(false);
      }
    };

    fetchLatestSelection();
    fetchTrendingMovies();
    fetchGenres();
  }, []);

  useEffect(() => {
    const fetchGenreMovies = async () => {
      setLoadingAction(true);
      try {
        const res = await axios.get(`/api/tmdb/genre/${selectedGenre.id}`);
        setActionMovies(res.data);
      } catch (err) {
        setActionError(err.message);
      } finally {
        setLoadingAction(false);
      }
    };
    fetchGenreMovies();
  }, [selectedGenre.id]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get("/api/news");
        setNews(res.data);
      } catch (err) {
        setNewsError(err.response?.data?.error || err.message);
      } finally {
        setLoadingNews(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="w-full max-w-5xl mt-28 mb-8 px-4 py-10 bg-[#202830] text-white rounded shadow">
        <h2 className="text-3xl font-bold mb-4 text-center">Welcome back,</h2>
        <p className="text-center text-white text-lg mb-8">
          Here’s what you chose between last time…
        </p>

        {loadingHistory ? (
          <div className="flex justify-center">
            <LoadingDots />
          </div>
        ) : historyError ? (
          <div className="text-center text-red-500">{historyError}</div>
        ) : latestLog?.movies ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {latestLog.movies.map((movie, i) => (
              <div
                key={i}
                className={`w-full aspect-[2/3] rounded-lg shadow-inner overflow-hidden relative ${
                  !movie.isSelected ? "grayscale" : ""
                }`}
              >
                {movie.poster ? (
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                    {movie.title || `Poster ${i + 1}`}
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
                  {movie.title}
                  {movie.isSelected && (
                    <span className="ml-2 text-green-400">✓ Selected</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-full aspect-[2/3] bg-gray-200 rounded-lg shadow-inner flex items-center justify-center text-gray-500 text-lg"
              >
                Poster {i} (placeholder)
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-full max-w-5xl mb-8 px-4 py-10 bg-[#202830] text-white rounded shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Trending This Week</h2>
        </div>

        {loadingTrending ? (
          <div className="flex justify-center">
            <LoadingDots />
          </div>
        ) : trendingError ? (
          <div className="text-red-500 text-center">{trendingError}</div>
        ) : (
          <TrendingMovies
            movies={trendingMovies}
            onMovieClick={(movie) => setSelectedMovie(movie)}
          />
        )}
      </div>

      <div className="w-full max-w-5xl mb-8 px-4 py-10 bg-[#202830] text-white rounded shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Popular in {selectedGenre.name}
          </h2>
          <div className="relative">
            <select
              value={selectedGenre.id}
              onChange={(e) => {
                const genre = genres.find(
                  (g) => g.id === parseInt(e.target.value)
                );
                setSelectedGenre(genre);
              }}
              className="bg-[#14181c] text-white px-4 py-2 rounded-md border border-gray-600 appearance-none focus:outline-none focus:border-blue-500"
            >
              {loadingGenres ? (
                <option>Loading genres...</option>
              ) : genreError ? (
                <option>Error loading genres</option>
              ) : (
                genres.map((genre) => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))
              )}
            </select>
            <div className="absolute right-3 top-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {loadingAction ? (
          <div className="flex justify-center">
            <LoadingDots />
          </div>
        ) : actionError ? (
          <div className="text-red-500 text-center">{actionError}</div>
        ) : (
          <GenreSpotlight
            movies={actionMovies}
            onMovieClick={(movie) => setSelectedMovie(movie)}
          />
        )}
      </div>

      <div className="w-full max-w-5xl mb-8 px-4 py-10 bg-[#202830] text-white rounded shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Latest Movie News</h2>
        </div>

        {loadingNews ? (
          <div className="flex justify-center">
            <LoadingDots />
          </div>
        ) : newsError ? (
          <div className="text-red-500 text-center">{newsError}</div>
        ) : (
          <LatestNews articles={news} />
        )}
      </div>

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={handleCloseModal}
          onAdd={handleAddPoster}
          onRemove={handleRemovePoster}
          isSelected={selectedPosters.includes(selectedMovie.title)}
          canAdd={selectedPosters.includes("")}
        />
      )}
      <Footer />
    </div>
  );
};

export default Home;
