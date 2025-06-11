import React, { useState } from "react";
import SearchBox from "../components/SearchBox";
import LoadingDots from "../components/LoadingDots";
import Footer from "../components/Footer";
import MoviePoster from "../components/MoviePoster";
import PageWrapper from "../components/PageWrapper";
import useTmdbSearch from "../components/hooks/useTmdbSearch";
import Toast from "../components/Toast";

// Browse page: allows user to search TMDB movies and add/remove them from their watchlist
const Browse = ({
  selectedPosters,
  posterMap,
  handleAddPoster,
  handleRemovePoster,
  setSelectedMovie,
  selectedMovie,
  watchlistTitles,
  handleAddToWatchlist,
  handleRemoveFromWatchlist,
  isDrawerOpen,
}) => {
  // Search input and mode state
  const [searchQuery, setSearchQuery] = useState(""); // user input
  const [searchMode, setSearchMode] = useState("movie"); // "movie" or "actor"

  // Fetch results via TMDB API based on query
  const { results, loading } = useTmdbSearch(searchQuery, searchMode);

  // Deduplicate by TMDB ID to avoid duplicate movie renders
  const uniqueResults = results.filter(
    (movie, idx, arr) => arr.findIndex((m) => m.id === movie.id) === idx
  );

  // Toast alerts for watchlist changes
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
        <div className="w-full max-w-[1600px] mb-10 p-10 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] rounded-2xl ring-1 ring-white/5">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-white">Browse Movies</h1>

            {/* Search bar with mode toggle */}
            <div className="max-w-3xl text-black mx-auto">
              <SearchBox
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchMode={searchMode}
                setSearchMode={setSearchMode}
              />
            </div>

            {/* Loading indicator */}
            {loading && <LoadingDots />}
          </div>

          {/* Render results if not loading */}
          {!loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-10">
              {uniqueResults.map((movie, idx) => (
                <MoviePoster
                  key={idx}
                  movie={movie}
                  posterMap={posterMap}
                  setSelectedMovie={setSelectedMovie}
                  selectedPosters={selectedPosters}
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
      </PageWrapper>

      {/* Site footer */}
      <Footer />
    </div>
  );
};

export default Browse;
