import React, { useState } from "react";
import SearchBox from "../components/SearchBox";
import LoadingDots from "../components/LoadingDots";
import Footer from "../components/Footer";
import MoviePoster from "../components/MoviePoster";
import PageWrapper from "../components/PageWrapper";
import useTmdbSearch from "../components/hooks/useTmdbSearch";

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
  // Search and result state
  const [searchQuery, setSearchQuery] = useState(""); // user input

  // Toast alerts for watchlist changes
  const [watchlistAlert, setWatchlistAlert] = useState(false);
  const [watchlistRemoveAlert, setWatchlistRemoveAlert] = useState(false);

  // Use TMDB search hook
  const { results, loading } = useTmdbSearch(searchQuery);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Toast: movie added */}
      {watchlistAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg z-50">
          Movie added to watchlist
        </div>
      )}

      {/* Toast: movie removed */}
      {watchlistRemoveAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded shadow-lg z-50">
          Movie removed from watchlist
        </div>
      )}

      {/* Main content container with layout margin */}
      <PageWrapper isDrawerOpen={isDrawerOpen}>
        {/* Search form section */}
        <div className="w-full mx-auto p-10 bg-[#202830] text-white rounded shadow mb-10">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Browse Movies</h1>
            <div className="max-w-3xl text-black mx-auto">
              <SearchBox
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </div>
            {loading && <LoadingDots />}
          </div>
        </div>

        {/* Display results grid if available */}
        {results.length > 0 && (
          <div className="bg-[#202830] rounded-lg shadow">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-10 mb-10">
              {results.map((movie, idx) => (
                <MoviePoster
                  key={idx}
                  movie={movie}
                  selectedPosters={selectedPosters}
                  posterMap={posterMap}
                  handleAddPoster={handleAddPoster}
                  handleRemovePoster={handleRemovePoster}
                  setSelectedMovie={setSelectedMovie}
                  selectedMovie={selectedMovie}
                  watchlistTitles={watchlistTitles}
                  handleAddToWatchlist={async (m) => {
                    await handleAddToWatchlist(m);
                    setWatchlistAlert(true);
                    setTimeout(() => setWatchlistAlert(false), 3000);
                  }}
                  handleRemoveFromWatchlist={async (m) => {
                    await handleRemoveFromWatchlist(m);
                    setWatchlistRemoveAlert(true);
                    setTimeout(() => setWatchlistRemoveAlert(false), 3000);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </PageWrapper>

      {/* Site footer */}
      <Footer />
    </div>
  );
};

export default Browse;
