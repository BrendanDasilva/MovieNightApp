import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import MoviePoster from "../components/MoviePoster";
import Footer from "../components/Footer";
import useGenres from "../components/hooks/useGenres";
import useBrowseQuery from "../components/hooks/useBrowseQuery";
import Toast from "../components/Toast";
import LoadingDots from "../components/LoadingDots";

const Browse = ({
  selectedPosters,
  posterMap,
  handleAddPoster,
  handleRemovePoster,
  setSelectedMovie,
  watchlistTitles,
  handleAddToWatchlist,
  handleRemoveFromWatchlist,
  isDrawerOpen,
}) => {
  const navigate = useNavigate();
  const genres = useGenres();

  // Params to control which query is active
  const [query, setQuery] = useState(null);
  const [genre, setGenre] = useState(null);
  const [decade, setDecade] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  // Trigger query fetch only if a valid one is selected
  const { results, totalResults, loading } = useBrowseQuery({
    query,
    genre,
    decade,
    page,
    limit,
  });

  // Toast alerts for watchlist changes
  const [watchlistAlert, setWatchlistAlert] = useState(false);
  const [watchlistRemoveAlert, setWatchlistRemoveAlert] = useState(false);

  const handleTileClick = (newQuery, extras = {}) => {
    setQuery(newQuery);
    setGenre(extras.genre || null);
    setDecade(extras.decade || null);
    setPage(1);
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
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            Browse Movies
          </h1>

          {/* Tiles for filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-gray-800 p-6 rounded-xl shadow text-white">
              <h2 className="text-xl font-semibold mb-4">Search by Decade</h2>
              <div className="flex flex-wrap gap-2">
                {[
                  "2020s",
                  "2010s",
                  "2000s",
                  "1990s",
                  "1980s",
                  "1970s",
                  "1960s",
                  "1950s",
                  "Earlier",
                ].map((decadeStr) => (
                  <button
                    key={decadeStr}
                    onClick={() =>
                      handleTileClick("__tmdb_decade__", { decade: decadeStr })
                    }
                    className="px-3 py-1 rounded bg-white/10 hover:bg-white/20"
                  >
                    {decadeStr}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl shadow text-white">
              <h2 className="text-xl font-semibold mb-4">Search by Genre</h2>
              <div className="flex flex-wrap gap-2">
                {genres.map((g) => (
                  <button
                    key={g.id}
                    onClick={() =>
                      handleTileClick("__tmdb_genre__", { genre: g.id })
                    }
                    className="px-3 py-1 rounded bg-white/10 hover:bg-white/20"
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xl py-10 rounded-xl shadow col-span-1"
              onClick={() => handleTileClick("__tmdb_popular__")}
            >
              Most Popular (Top 100)
            </button>

            <button
              className="bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xl py-10 rounded-xl shadow col-span-1"
              onClick={() => handleTileClick("__tmdb_top_rated__")}
            >
              Highest Rated (Top 100)
            </button>
          </div>

          {/* Only show results once user selects something */}
          {query &&
            (loading ? (
              <LoadingDots />
            ) : (
              <>
                <div className="text-white text-sm mb-4 text-center">
                  Showing {results.length > 0 ? (page - 1) * limit + 1 : 0} –
                  {Math.min(page * limit, totalResults)} of {totalResults}{" "}
                  results
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {results.map((movie, idx) => (
                    <MoviePoster
                      key={idx}
                      movie={movie}
                      posterMap={posterMap}
                      setSelectedMovie={setSelectedMovie}
                      selectedPosters={selectedPosters}
                      handleAddPoster={handleAddPoster}
                      handleRemovePoster={handleRemovePoster}
                      watchlistTitles={watchlistTitles}
                      handleAddToWatchlist={async () => {
                        await handleAddToWatchlist(movie);
                        setWatchlistAlert(true);
                        setTimeout(() => setWatchlistAlert(false), 3000);
                      }}
                      handleRemoveFromWatchlist={async () => {
                        await handleRemoveFromWatchlist(movie);
                        setWatchlistRemoveAlert(true);
                        setTimeout(() => setWatchlistRemoveAlert(false), 3000);
                      }}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalResults > limit && (
                  <div className="flex justify-center mt-8 gap-4 text-white">
                    <button
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 disabled:opacity-30"
                    >
                      Previous
                    </button>

                    <span className="px-4 py-2 font-semibold">
                      Page {page} of {Math.ceil(totalResults / limit)}
                    </span>

                    <button
                      onClick={() => setPage((prev) => prev + 1)}
                      disabled={page * limit >= totalResults}
                      className="px-4 py-2 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 disabled:opacity-30"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ))}
        </div>
      </PageWrapper>

      <Footer />
    </div>
  );
};

export default Browse;
