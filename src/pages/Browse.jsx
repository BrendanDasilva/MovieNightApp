import React, { useState } from "react";
import SearchBox from "../components/SearchBox";
import LoadingDots from "../components/LoadingDots";
import Footer from "../components/Footer";
import MoviePoster from "../components/MoviePoster";
import PageWrapper from "../components/PageWrapper";
import useTmdbSearch from "../components/hooks/useTmdbSearch";
import Toast from "../components/Toast";
import BrowseFilters from "../components/BrowseFilters";
import useFilteredTmdbMovies from "../components/hooks/useFilteredTmdbMovies";
import useGenres from "../components/hooks/useGenres";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState("movie");

  const [selectedDecade, setSelectedDecade] = useState("All");
  const [selectedGenreId, setSelectedGenreId] = useState("All");
  const [sortBy, setSortBy] = useState("popularityDesc");

  const genres = useGenres();

  const { results, loading } = useTmdbSearch(searchQuery, searchMode);

  const uniqueResults = results.filter(
    (movie, idx, arr) => arr.findIndex((m) => m.id === movie.id) === idx
  );

  const filteredResults = useFilteredTmdbMovies(
    uniqueResults,
    searchQuery,
    selectedDecade,
    selectedGenreId,
    sortBy
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
            <h1 className="text-4xl font-bold text-white">Browse Movies</h1>

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
            {searchQuery.length > 2 && (
              <BrowseFilters
                genres={genres}
                selectedGenreId={selectedGenreId}
                setSelectedGenreId={setSelectedGenreId}
                selectedDecade={selectedDecade}
                setSelectedDecade={setSelectedDecade}
                sortBy={sortBy}
                setSortBy={setSortBy}
              />
            )}

            {loading && <LoadingDots />}
          </div>

          {/* Results grid */}
          {!loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-10">
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
                  handleRemoveFromWatchlist={() => onRemoveFromWatchlist(movie)}
                />
              ))}
            </div>
          )}
        </div>
      </PageWrapper>

      <Footer />
    </div>
  );
};

export default Browse;
