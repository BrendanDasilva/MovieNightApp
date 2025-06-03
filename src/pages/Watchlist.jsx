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
                  key={idx}
                  movie={movie}
                  posterMap={posterMap}
                  setSelectedMovie={setSelectedMovie}
                  selectedPosters={selectedPosters}
                  handleAddPoster={handleAddPoster}
                  handleRemovePoster={handleRemovePoster}
                  watchlistTitles={allMovies.map((m) => m.title)}
                  handleAddToWatchlist={() => handleAddToWatchlist(movie)}
                  handleRemoveFromWatchlist={async () => {
                    await handleRemoveFromWatchlist(movie);
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
