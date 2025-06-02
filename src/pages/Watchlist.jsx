import React, { useState, useRef, useEffect } from "react";
import LoadingDots from "../components/LoadingDots";
import SearchBox from "../components/SearchBox";
import MoviePoster from "../components/MoviePoster";
import WatchlistFilters from "../components/WatchlistFilters";
import PageWrapper from "../components/PageWrapper";
import Footer from "../components/Footer";
import useWatchlistData from "../components/hooks/useWatchlistData";
import useFilteredMovies from "../components/hooks/useFilteredMovies";

// Number of movies to load at a time for infinite scroll
const CHUNK_SIZE = 20;

// Watchlist page: shows saved movies, allows filtering/sorting/searching
const Watchlist = ({
  // Movie and UI state
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
  const [searchQuery, setSearchQuery] = useState(""); // search input
  const [selectedDecade, setSelectedDecade] = useState("All"); // decade filter
  const [selectedGenre, setSelectedGenre] = useState("All"); // genre filter
  const [sortBy, setSortBy] = useState("createdDesc"); // sorting criteria
  const [genres, setGenres] = useState([]); // available genres

  const {
    allMovies,
    setAllMovies,
    visibleMovies,
    setVisibleMovies,
    isLoading,
    isAppending,
    posterErrors,
    loadMoreRef,
    loadMore,
  } = useWatchlistData(setPosterMap, selectedPosters);

  const filteredMovies = useFilteredMovies(
    allMovies,
    searchQuery,
    selectedDecade,
    selectedGenre,
    sortBy
  );

  // Fetch available genres on mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch("/api/tmdb/genres");
        const data = await res.json();
        const genreNames = data.map((g) => g.name);
        setGenres(genreNames);
      } catch (err) {
        console.error("Failed to fetch genres", err);
      }
    };
    fetchGenres();
  }, []);

  // Reset chunked list when filters change
  useEffect(() => {
    setVisibleMovies(filteredMovies.slice(0, CHUNK_SIZE));
  }, [filteredMovies]);

  // Infinite scroll observer
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
        {/* Outer content container */}
        <div className="w-full mx-auto mb-10 bg-[#202830] text-white rounded shadow">
          {/* Page heading and search input */}
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold pt-10 mb-4">Your Watchlist</h2>
            <SearchBox
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>

          {/* Filter and sort controls */}
          <WatchlistFilters
            selectedGenre={selectedGenre}
            setSelectedGenre={setSelectedGenre}
            selectedDecade={selectedDecade}
            setSelectedDecade={setSelectedDecade}
            sortBy={sortBy}
            setSortBy={setSortBy}
            genres={genres}
          />

          {/* Results summary */}
          {filteredMovies.length > 0 && (
            <h3 className="text-lg font-medium text-center">
              {filteredMovies.length} movies found
            </h3>
          )}

          {/* Loading state */}
          {isLoading && <LoadingDots />}

          {/* Poster grid */}
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

          {/* Appending spinner */}
          {!isLoading && isAppending && <LoadingDots />}
          <div ref={loadMoreRef} className="h-10 mt-10" />
        </div>
      </PageWrapper>
      <Footer />
    </div>
  );
};

export default Watchlist;
