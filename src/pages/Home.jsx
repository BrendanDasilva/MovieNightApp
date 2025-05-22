import React, { useEffect, useState } from "react";
import axios from "axios";
import LoadingDots from "../components/LoadingDots";
import TrendingMovies from "../components/TrendingMovies";
import GenreSpotlight from "../components/GenreSpotlight";
import LatestNews from "../components/LatestNews";
import Footer from "../components/Footer";
import MoviePoster from "../components/MoviePoster";

const Home = ({
  selectedPosters,
  posterMap,
  handleAddPoster,
  handleRemovePoster,
  selectedMovie,
  setSelectedMovie,
  watchlistTitles,
  handleAddToWatchlist,
  handleRemoveFromWatchlist,
  isDrawerOpen,
}) => {
  // State for latest selection log, trending movies, genres, selected genre, loading and error states
  const [latestLog, setLatestLog] = useState(null);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [genreMovies, setGenreMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState({
    id: 28,
    name: "Action",
  });

  // State for loading and error messages
  const [loading, setLoading] = useState({
    history: true,
    trending: true,
    genre: true,
    news: true,
    genres: true,
  });

  // State for error messages
  const [errors, setErrors] = useState({});

  // State for news articles
  const [news, setNews] = useState([]);

  // Fetch user log, trending movies, genres, and news on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logRes, trendingRes, genresRes, newsRes] = await Promise.all([
          axios.get("/api/logs/latest", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          axios.get("/api/tmdb/trending"),
          axios.get("/api/tmdb/genres"),
          axios.get("/api/news"),
        ]);

        setLatestLog(logRes.data);
        setTrendingMovies(trendingRes.data);
        setGenres(genresRes.data);
        setNews(newsRes.data);
      } catch (err) {
        setErrors((prev) => ({ ...prev, general: err.message }));
      } finally {
        setLoading((prev) => ({
          ...prev,
          history: false,
          trending: false,
          genres: false,
          news: false,
        }));
      }
    };

    fetchData();
  }, []);

  // Fetch genre-based movie list when selectedGenre changes
  useEffect(() => {
    const fetchGenreMovies = async () => {
      setLoading((prev) => ({ ...prev, genre: true }));
      try {
        const res = await axios.get(`/api/tmdb/genre/${selectedGenre.id}`);
        setGenreMovies(res.data);
      } catch (err) {
        setErrors((prev) => ({ ...prev, genre: err.message }));
      } finally {
        setLoading((prev) => ({ ...prev, genre: false }));
      }
    };

    if (selectedGenre?.id) fetchGenreMovies();
  }, [selectedGenre]);

  return (
    <div
      className={`min-h-screen flex flex-col items-center transition-all duration-300 ${
        isDrawerOpen ? "pl-[420px]" : "pl-12"
      }`}
    >
      {/* History Section */}
      <div className="w-full max-w-[1600px] px-[50px] mt-28 mb-8 py-10 bg-[#202830] text-white rounded shadow">
        <h2 className="text-3xl font-bold mb-4 text-center">Welcome back,</h2>
        <p className="text-center text-white text-lg mb-8">
          Here’s what you chose between last time…
        </p>

        {loading.history ? (
          <LoadingDots />
        ) : latestLog?.movies?.length ? (
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
                    <span className="ml-2 text-green-400">✓</span>
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

      {/* Trending Section */}
      <div className="w-full max-w-[1600px] px-[50px] mb-8 py-10 bg-[#202830] text-white rounded shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Trending This Week</h2>
        </div>
        {loading.trending ? (
          <LoadingDots />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {trendingMovies.map((movie, i) => (
              <MoviePoster
                key={i}
                movie={movie}
                posterUrl={
                  movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : null
                }
                selectedMovie={selectedMovie}
                setSelectedMovie={setSelectedMovie}
                selectedPosters={selectedPosters}
                posterMap={posterMap}
                handleAddPoster={handleAddPoster}
                handleRemovePoster={handleRemovePoster}
                watchlistTitles={watchlistTitles}
                handleAddToWatchlist={handleAddToWatchlist}
                handleRemoveFromWatchlist={handleRemoveFromWatchlist}
              />
            ))}
          </div>
        )}
      </div>

      {/* Genre Spotlight */}
      <div className="w-full max-w-[1600px] px-[50px] mb-8 py-10 bg-[#202830] text-white rounded shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Popular in {selectedGenre.name}
          </h2>
          <select
            value={selectedGenre.id}
            onChange={(e) => {
              const genre = genres.find(
                (g) => g.id === parseInt(e.target.value)
              );
              setSelectedGenre(genre);
            }}
            className="bg-[#14181c] text-white px-4 py-2 rounded-md border border-gray-600"
          >
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>

        {loading.genre ? (
          <LoadingDots />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {genreMovies.map((movie, i) => (
              <MoviePoster
                key={i}
                movie={movie}
                posterUrl={
                  movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : null
                }
                selectedMovie={selectedMovie}
                setSelectedMovie={setSelectedMovie}
                selectedPosters={selectedPosters}
                posterMap={posterMap}
                handleAddPoster={handleAddPoster}
                handleRemovePoster={handleRemovePoster}
                watchlistTitles={watchlistTitles}
                handleAddToWatchlist={handleAddToWatchlist}
                handleRemoveFromWatchlist={handleRemoveFromWatchlist}
              />
            ))}
          </div>
        )}
      </div>

      {/* News Section */}
      <div className="w-full max-w-[1600px] px-[50px] mb-8 py-10 bg-[#202830] text-white rounded shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Latest Movie News</h2>
        </div>
        {loading.news ? <LoadingDots /> : <LatestNews articles={news} />}
      </div>

      <Footer />
    </div>
  );
};

export default Home;
