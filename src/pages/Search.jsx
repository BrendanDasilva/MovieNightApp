import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import SearchBox from "../components/SearchBox";
import LoadingDots from "../components/LoadingDots";
import Footer from "../components/Footer";
import MoviePoster from "../components/MoviePoster";
import PageWrapper from "../components/PageWrapper";
import useTmdbSearch from "../components/hooks/useTmdbSearch";
import Toast from "../components/Toast";
import SearchFilters from "../components/SearchFilters";
import useFilteredTmdbMovies from "../components/hooks/useFilteredTmdbMovies";
import useGenres from "../components/hooks/useGenres";

// Search page: allows searching TMDB (movies or actors), filtering, and paginating
const Search = ({
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
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState("movie");

  const [selectedDecade, setSelectedDecade] = useState("All");
  const [selectedGenreId, setSelectedGenreId] = useState("All");
  const [sortBy, setSortBy] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const RESULTS_PER_PAGE = 20;

  // Pull from URL query params
  useEffect(() => {
    const queryFromUrl = searchParams.get("query");
    const modeFromUrl = searchParams.get("mode");

    if (queryFromUrl) setSearchQuery(queryFromUrl);
    if (modeFromUrl) setSearchMode(modeFromUrl);
  }, [searchParams]);

  const genres = useGenres();

  // Fetch search results from backend (paginated)
  const { results, totalResults, loading } = useTmdbSearch(
    searchQuery,
    searchMode,
    currentPage,
    RESULTS_PER_PAGE
  );

  // De-dupe by movie ID
  const uniqueResults = results.filter(
    (movie, idx, arr) => arr.findIndex((m) => m.id === movie.id) === idx
  );

  // Apply filters
  const filteredResults = useFilteredTmdbMovies(
    uniqueResults,
    searchQuery,
    selectedDecade,
    selectedGenreId,
    sortBy,
    searchMode,
    genres
  );

  const [watchlistAlert, setWatchlistAlert] = useState(false);
  const [watchlistRemoveAlert, setWatchlistRemoveAlert] = useState(false);

  const onAddToWatchlist = async (movie) => {
    await handleAddToWatchlist(movie);
    setWatchlistAlert(true);
    setTimeout(() => setWatchlistAlert(false), 3000);
  };

  const onRemoveFromWatchlist = async (movie) => {
    await handleRemoveFromWatchlist(movie);
    setWatchlistRemoveAlert(true);
    setTimeout(() => setWatchlistRemoveAlert(false), 3000);
  };

  // Reset to page 1 on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, searchMode, selectedDecade, selectedGenreId, sortBy]);

  return (
    <div className="min-h-screen flex flex-col">
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
            <h1 className="text-4xl font-bold text-white">Search Movies</h1>

            {/* Search bar with mode toggle */}
            <div className="max-w-3xl text-black mx-auto">
              <SearchBox
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchMode={searchMode}
                setSearchMode={setSearchMode}
                enableModeToggle={true}
              />
            </div>

            {/* Filters */}
            <SearchFilters
              genres={genres}
              selectedGenreId={selectedGenreId}
              setSelectedGenreId={setSelectedGenreId}
              selectedDecade={selectedDecade}
              setSelectedDecade={setSelectedDecade}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />

            {loading && <LoadingDots />}
          </div>

          {/* Movie results grid + pagination */}
          {!loading && searchQuery.length > 2 && (
            <>
              {/* Results count display */}
              {filteredResults.length > 0 && (
                <p className="text-white text-sm mt-6">
                  Showing {(currentPage - 1) * RESULTS_PER_PAGE + 1}–
                  {Math.min(
                    currentPage * RESULTS_PER_PAGE,
                    filteredResults.length
                  )}{" "}
                  of {filteredResults.length} results
                </p>
              )}

              {/* Results */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                {filteredResults.map((movie, idx) => (
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
                    handleRemoveFromWatchlist={() =>
                      onRemoveFromWatchlist(movie)
                    }
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {filteredResults.length > 0 && (
                <div className="flex justify-center mt-8 gap-4 text-white">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 disabled:opacity-30"
                  >
                    Previous
                  </button>

                  <span className="px-4 py-2 font-semibold">
                    Page {currentPage} of{" "}
                    {Math.ceil(totalResults / RESULTS_PER_PAGE)}
                  </span>

                  <button
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={currentPage * RESULTS_PER_PAGE >= totalResults}
                    className="px-4 py-2 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 disabled:opacity-30"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </PageWrapper>

      <Footer />
    </div>
  );
};

export default Search;
