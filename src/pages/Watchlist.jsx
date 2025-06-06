import React, { useState, useEffect, useRef } from "react";
import LoadingDots from "../components/LoadingDots";
import SearchBox from "../components/SearchBox";
import MoviePoster from "../components/MoviePoster";
import WatchlistFilters from "../components/WatchlistFilters";
import PageWrapper from "../components/PageWrapper";
import Footer from "../components/Footer";
import ResultsSummary from "../components/ResultsSummary";
import useWatchlistData from "../components/hooks/useWatchlistData";
import useFilteredMovies from "../components/hooks/useFilteredMovies";
import useGenres from "../components/hooks/useGenres";
import Toast from "../components/Toast";

// Number of movies to load at a time for infinite scroll
const CHUNK_SIZE = 20;

// Watchlist page: shows saved movies, allows filtering/sorting/searching
const Watchlist = ({
  selectedPosters,
  setSelectedPosters,
  posterMap,
  setPosterMap,
  handleAddPoster,
  handleRemovePoster,
  setSelectedMovie,
  handleAddToWatchlist,
  handleRemoveFromWatchlist,
  isDrawerOpen,
}) => {
  // UI and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDecade, setSelectedDecade] = useState("All");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState("createdDesc");

  // Genre options
  const genres = useGenres();

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

  // Movie data + poster loading logic
  const {
    allMovies,
    setAllMovies,
    visibleMovies,
    setVisibleMovies,
    isLoading,
    isAppending,
    loadMoreRef,
    loadMore,
  } = useWatchlistData(setPosterMap, selectedPosters);

  // Filtered + sorted movies
  const filteredMovies = useFilteredMovies(
    allMovies,
    searchQuery,
    selectedDecade,
    selectedGenre,
    sortBy
  );

  // Reset visible chunked list when filters/search change
  useEffect(() => {
    setVisibleMovies(filteredMovies.slice(0, CHUNK_SIZE));
  }, [filteredMovies]);

  // Infinite scroll trigger
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (
        entry.isIntersecting &&
        visibleMovies.length < filteredMovies.length
      ) {
        loadMore(filteredMovies);
      }
    });

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [visibleMovies, filteredMovies]);

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
        {/* Outer container */}
        <div className="w-full mx-auto mb-10 bg-[#202830] text-white rounded shadow">
          {/* Header + search bar */}
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold pt-10 mb-4">Your Watchlist</h2>
            <SearchBox
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>

          {/* Filter/sort controls */}
          <WatchlistFilters
            selectedGenre={selectedGenre}
            setSelectedGenre={setSelectedGenre}
            selectedDecade={selectedDecade}
            setSelectedDecade={setSelectedDecade}
            sortBy={sortBy}
            setSortBy={setSortBy}
            genres={genres}
          />

          {/* Filtered results count */}
          {filteredMovies.length > 0 && (
            <ResultsSummary count={filteredMovies.length} />
          )}

          {/* Loading spinner */}
          {isLoading && <LoadingDots />}

          {/* Movie grid */}
          {!isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-10 mb-10">
              {visibleMovies.map((movie, idx) => (
                <MoviePoster
                  key={movie.id ?? movie._id ?? movie.title}
                  movie={movie}
                  posterMap={posterMap}
                  setSelectedMovie={setSelectedMovie}
                  selectedPosters={selectedPosters}
                  handleAddPoster={handleAddPoster}
                  handleRemovePoster={handleRemovePoster}
                  watchlistTitles={allMovies}
                  handleAddToWatchlist={() => onAddToWatchlist(movie)}
                  handleRemoveFromWatchlist={async () => {
                    await onRemoveFromWatchlist(movie);
                    setAllMovies((prev) =>
                      prev.filter((m) => m.title !== movie.title)
                    );
                  }}
                />
              ))}
            </div>
          )}

          {/* Infinite scroll loading spinner */}
          {!isLoading && isAppending && <LoadingDots />}
          <div ref={loadMoreRef} className="h-10 mt-10" />
        </div>
      </PageWrapper>
      <Footer />
    </div>
  );
};

export default Watchlist;
