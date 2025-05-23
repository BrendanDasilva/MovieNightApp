import React, { useEffect, useState } from "react";
import axios from "axios";
import LoadingDots from "../components/LoadingDots";
import LatestNews from "../components/LatestNews";
import Footer from "../components/Footer";
import MoviePoster from "../components/MoviePoster";
import PageWrapper from "../components/PageWrapper";

// Home page: shows last selection log, trending films, spotlight genre, and news
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
  // App-wide data
  const [latestLog, setLatestLog] = useState(null); // user's last selection
  const [trendingMovies, setTrendingMovies] = useState([]); // trending TMDB titles
  const [genreMovies, setGenreMovies] = useState([]); // genre-based selection
  const [genres, setGenres] = useState([]); // list of genres from TMDB
  const [selectedGenre, setSelectedGenre] = useState({
    id: 28,
    name: "Action",
  });

  // Loading and error state trackers
  const [loading, setLoading] = useState({
    history: true,
    trending: true,
    genre: true,
    news: true,
    genres: true,
  });
  const [errors, setErrors] = useState({});

  // News feed
  const [news, setNews] = useState([]);

  // Fetch logs, trending, genres, and news when page mounts
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

  // Fetch genre-specific movies when user changes genre dropdown
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
    <div className="min-h-screen flex flex-col">
      <PageWrapper isDrawerOpen={isDrawerOpen}>
        {/* ---- Header Section ---- */}
        <div className="w-full max-w-[1600px] mb-10 p-10 bg-[#202830] text-white rounded shadow">
          <h1 className="text-5xl font-bold mb-10 text-center">
            Welcome to the Movie Night App!
          </h1>
          <p className=" text-white text-lg m-10">
            Here's how this works - if you just want to look through a bunch of
            movies and pick one to watch, go for it! But what this app provides
            you is something a little different when you're trying to picking a
            movie with your partner or with friends. What I've done, is turn
            picking a movie into something much more interactive and fun!
          </p>
          <p className=" text-white text-lg m-10">
            This is what you do - pick 3 movies, from the database or from your
            watchlist, and then you can vote on which one you want to watch. The
            app will keep track of your selections, so you can see what you've
            watched in the past and what you might want to watch in the future.
            You can also add movies to your watchlist, so you never forget what
            you want to see next!
          </p>
          <p className="text-white text-lg m-10">
            My wife and I have been using this method to pick movies for over 5
            years now and have had over 175 movie nights together this way! We
            make it fun through presentation of the picks, seeing if the other
            can guess the movie based on different clues and details! Give it a
            try!
          </p>
        </div>
        {/* ---- Last Movie Night Selection ---- */}
        <div className="w-full max-w-[1600px] mb-10 p-10 bg-[#202830] text-white rounded shadow">
          <h3 className="text-center text-white text-2xl mb-10">
            Here’s what you chose between last time…
          </h3>

          {/* Show latest log or placeholder posters */}
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
                  {/* Poster image or fallback box */}
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
                  {/* Movie label with checkmark */}
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
            // Placeholder if no past logs exist
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
        <div className="w-full max-w-[1600px] mb-10 p-10 bg-[#202830] text-white rounded shadow">
          <div className="flex justify-between items-center mb-10">
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
        <div className="w-full max-w-[1600px] mb-10 p-10 bg-[#202830] text-white rounded shadow">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-bold">
              Popular in {selectedGenre.name}
            </h2>

            {/* Genre selector dropdown */}
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
        <div className="w-full max-w-[1600px] mb-10 p-10 bg-[#202830] text-white rounded shadow">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-bold">Latest Movie News</h2>
          </div>
          {loading.news ? <LoadingDots /> : <LatestNews articles={news} />}
        </div>
      </PageWrapper>
      <Footer />
    </div>
  );
};

export default Home;
