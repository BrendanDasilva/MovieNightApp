import React, { useEffect, useState } from "react";
import axios from "axios";
import LoadingDots from "../components/LoadingDots";
import TrendingMovies from "../components/TrendingMovies";
import GenreSpotlight from "../components/GenreSpotlight";
import LatestNews from "../components/LatestNews";
import Footer from "../components/Footer";

const Home = ({
  selectedPosters,
  posterMap,
  handleAddPoster,
  handleRemovePoster,
  selectedMovie,
  setSelectedMovie,
}) => {
  // State for latest movie log (previous selection)
  const [latestLog, setLatestLog] = useState(null);

  // Trending movies
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [trendingError, setTrendingError] = useState(null);

  // Genre spotlight section
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState({
    id: 28,
    name: "Action",
  });
  const [actionMovies, setActionMovies] = useState([]);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [loadingAction, setLoadingAction] = useState(true);
  const [genreError, setGenreError] = useState(null);
  const [actionError, setActionError] = useState(null);

  // News section
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [newsError, setNewsError] = useState(null);

  // Selection history
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState(null);

  // Load on initial mount
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

  // Fetch movies from selected genre
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

  // Fetch latest movie news
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

  // Add a movie to watchlist from this page
  const handleAddToWatchlist = async (movie) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3001/watchlist/add",
        {
          title: movie.title,
          year: movie.release_date?.split("-")[0] || null,
          genre: movie.genre_names?.join(", ") || "",
          runtime: movie.runtime?.toString() || "",
          rating: movie.vote_average || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert(`${movie.title} added to your watchlist.`);
    } catch (err) {
      console.error("Add to watchlist error:", err);
      alert("Failed to add movie to watchlist.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* Welcome section with last selected movies */}
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
          // If no log available
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

      {/* Trending Movies Section */}
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
            onMovieClick={(movie) =>
              setSelectedMovie({
                title: movie.title,
                poster: movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : null,
              })
            }
            onAddToWatchlist={handleAddToWatchlist}
          />
        )}
      </div>

      {/* Genre Spotlight Section */}
      <div className="w-full max-w-5xl mb-8 px-4 py-10 bg-[#202830] text-white rounded shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Popular in {selectedGenre.name}
          </h2>
          <div className="relative">
            {/* Genre Dropdown */}
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
            onMovieClick={(movie) =>
              setSelectedMovie({
                title: movie.title,
                poster: movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : null,
              })
            }
            onAddToWatchlist={handleAddToWatchlist}
          />
        )}
      </div>

      {/* News Section */}
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

      <Footer />
    </div>
  );
};

export default Home;
