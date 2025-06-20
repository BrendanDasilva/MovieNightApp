import React, { useState } from "react";
import LoadingDots from "../components/LoadingDots";
import LatestNews from "../components/LatestNews";
import Footer from "../components/Footer";
import MoviePoster from "../components/MoviePoster";
import PageWrapper from "../components/PageWrapper";
import useLatestHomeData from "../components/hooks/useLatestHomeData";
import useGenreMovies from "../components/hooks/useGenreMovies";
import Toast from "../components/Toast";
import { FiCheckCircle } from "react-icons/fi";

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
  // Genre selector state
  const [selectedGenre, setSelectedGenre] = useState({
    id: 28,
    name: "Action",
  });

  // State to toggle About accordion
  const [aboutOpen, setAboutOpen] = useState(false);

  // Fetch home data from custom hook
  const { latestLog, trendingMovies, genres, news, loading, errors } =
    useLatestHomeData();

  // Fetch genre-specific movies
  const {
    genreMovies,
    loading: genreLoading,
    error: genreError,
  } = useGenreMovies(selectedGenre);

  // Toast alert state for adding/removing from watchlist
  const [watchlistAlert, setWatchlistAlert] = useState(false);
  const [watchlistRemoveAlert, setWatchlistRemoveAlert] = useState(false);

  // Wrapper to add + show toast
  const onAddToWatchlist = async (movie) => {
    await handleAddToWatchlist(movie);
    setWatchlistAlert(true);
    setTimeout(() => setWatchlistAlert(false), 3000);
  };

  // Wrapper to remove + show toast
  const onRemoveFromWatchlist = async (movie) => {
    await handleRemoveFromWatchlist(movie);
    setWatchlistRemoveAlert(true);
    setTimeout(() => setWatchlistRemoveAlert(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Toasts */}
      <Toast
        visible={watchlistAlert}
        message="Movie added to watchlist"
        type="success"
      />
      <Toast
        visible={watchlistRemoveAlert}
        message="Movie removed from watchlist"
        type="error"
      />

      <PageWrapper isDrawerOpen={isDrawerOpen}>
        {/* ---- Header Section ---- */}
        <div className="w-full max-w-[1600px] mb-10 p-10 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] rounded-2xl ring-1 ring-white/5">
          <h1 className="text-5xl font-bold mb-10 text-center text-white">
            Welcome to the Movie Night App!
          </h1>

          {/* Accordion Toggle */}
          <div className="flex justify-center mb-2">
            <button
              onClick={() => setAboutOpen(!aboutOpen)}
              className="text-white text-lg font-semibold focus:outline-none"
            >
              About the App
              <span className="ml-2">{aboutOpen ? "▲" : "▼"}</span>
            </button>
          </div>

          {/* Accordion Content */}
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              aboutOpen ? "max-h-[1000px] mt-4" : "max-h-0"
            }`}
          >
            <div className="space-y-4 text-white text-lg text-left">
              <p>
                Here's how this works - if you just want to look through a bunch
                of movies and pick one to watch, go for it! But what this app
                provides you is something a little different when you're trying
                to pick a movie with your partner or with friends. What I've
                done, is turn picking a movie into something much more
                interactive and fun!
              </p>
              <p>
                This is what you do - pick 3 movies, from the database or from
                your watchlist, and then you can vote on which one you want to
                watch. The app will keep track of your selections, so you can
                see what you've watched in the past and what you might want to
                watch in the future. You can also add movies to your watchlist,
                so you never forget what you want to see next!
              </p>
              <p>
                My wife and I have been using this method to pick movies for
                over 5 years now and have had over 175 movie nights together
                this way! We make it fun through presentation of the picks,
                seeing if the other can guess the movie based on different clues
                and details! Give it a try!
              </p>
            </div>
          </div>
        </div>

        {/* ---- Last Movie Night Selection ---- */}
        <div className="w-full max-w-[1600px] mb-10 p-10 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] rounded-2xl ring-1 ring-white/5">
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
                    !movie.isSelected ? "grayscale" : "border-2 border-white"
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

                  {/* Green checkmark icon for selected movie */}
                  {movie.isSelected && (
                    <div className="absolute top-1.5 right-2 text-green-400">
                      <FiCheckCircle size={26} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // Placeholder if no past logs exist
            <div className="relative">
              {/* Overlay message */}
              <div className="absolute inset-0 z-10 bg-black/60 flex items-center justify-center text-center px-4 rounded-lg">
                <p className="text-white text-lg font-medium max-w-[90%]">
                  No movie night history yet. Head to the Watchlist or Browse to
                  get started!
                </p>
              </div>

              {/* Placeholder poster grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-full aspect-[2/3] bg-gray-200 rounded-lg shadow-inner"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Trending Section */}
        <div className="w-full max-w-[1600px] mb-10 p-10 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] rounded-2xl ring-1 ring-white/5">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-bold text-white">
              Trending This Week
            </h2>
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
                  handleAddToWatchlist={() => onAddToWatchlist(movie)}
                  handleRemoveFromWatchlist={() => onRemoveFromWatchlist(movie)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Genre Spotlight */}
        <div className="w-full max-w-[1600px] mb-10 p-10 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] rounded-2xl ring-1 ring-white/5">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-bold text-white">
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

          {genreLoading ? (
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
                  handleAddToWatchlist={() => onAddToWatchlist(movie)}
                  handleRemoveFromWatchlist={() => onRemoveFromWatchlist(movie)}
                />
              ))}
            </div>
          )}
        </div>

        {/* News Section */}
        <div className="w-full max-w-[1600px] mb-10 p-10 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] rounded-2xl ring-1 ring-white/5">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-bold text-white">Latest Movie News</h2>
          </div>
          {loading.news ? <LoadingDots /> : <LatestNews articles={news} />}
        </div>
      </PageWrapper>
      <Footer />
    </div>
  );
};

export default Home;
