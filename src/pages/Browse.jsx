import React, { useState, useEffect } from "react";
import axios from "axios";
import SearchBox from "../components/SearchBox";
import LoadingDots from "../components/LoadingDots";
import Footer from "../components/Footer";
import MovieModal from "../components/MovieModal";
import MoviePoster from "../components/MoviePoster";

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
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [watchlistAlert, setWatchlistAlert] = useState(false);
  const [watchlistRemoveAlert, setWatchlistRemoveAlert] = useState(false);

  useEffect(() => {
    const searchMovies = async () => {
      if (searchQuery.length < 3) return;
      setLoading(true);
      try {
        const res = await axios.get(
          `/api/tmdb/search?query=${encodeURIComponent(searchQuery)}`
        );
        setResults(res.data);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchMovies, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Toasts */}
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

      <div className="flex-grow px-8 mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="w-full max-w-5xl mx-auto px-4 py-10 bg-[#202830] text-white rounded shadow mt-8 mb-12">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold mt-4">Browse Movies</h1>
              <div className="max-w-3xl text-black mx-auto">
                <SearchBox
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              </div>
              {loading && <LoadingDots />}
            </div>
          </div>

          {results.length > 0 && (
            <div className="mt-8 bg-[#202830] rounded-lg shadow">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
                {results.map((movie, idx) => (
                  <MoviePoster
                    key={idx}
                    movie={movie}
                    selectedPosters={selectedPosters}
                    posterMap={posterMap}
                    handleAddPoster={handleAddPoster}
                    handleRemovePoster={handleRemovePoster}
                    setSelectedMovie={setSelectedMovie}
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
        </div>
      </div>

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onAdd={() => handleAddPoster(selectedMovie.title)}
          onRemove={() => handleRemovePoster(selectedMovie.title)}
          isSelected={selectedPosters.includes(selectedMovie.title)}
          canAdd={selectedPosters.length < 3}
          handleAddToWatchlist={handleAddToWatchlist}
          handleRemoveFromWatchlist={handleRemoveFromWatchlist}
          watchlistTitles={watchlistTitles}
        />
      )}

      <Footer />
    </div>
  );
};

export default Browse;
