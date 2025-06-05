import { useState, useEffect, useRef } from "react";
import axios from "axios";

// Cache time-to-live: 1 hour
const MOVIE_CACHE_TTL = 60 * 60 * 1000;
const movieCache = {};

const MovieModal = ({
  movie,
  onClose,
  onAdd,
  onRemove,
  isSelected,
  canAdd,
  handleAddToWatchlist,
  handleRemoveFromWatchlist,
  watchlistTitles = [],
}) => {
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const cacheKey = useRef("");

  // Fetch movie details from TMDB or cache
  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);

      const cacheKeyStr = movie.id ? `id-${movie.id}` : movie.title;
      cacheKey.current = cacheKeyStr;

      const cachedData = movieCache[cacheKeyStr];
      if (cachedData && Date.now() - cachedData.timestamp < MOVIE_CACHE_TTL) {
        setDetails(cachedData.data);
        setIsLoading(false);
        return;
      }

      try {
        const query = movie.id
          ? `id=${movie.id}`
          : `title=${encodeURIComponent(movie.title)}`;

        const res = await axios.get(`http://localhost:3001/tmdb?${query}`);

        const movieData = {
          id: movie.id,
          title: res.data.title,
          release_date: res.data.release_date,
          released: res.data.released,
          tagline: res.data.tagline,
          poster: res.data.poster,
          genre: res.data.genre,
          director: res.data.director,
          runtime: res.data.runtime,
          plot: res.data.plot,
          actors: res.data.actors,
          language: res.data.language,
          country: res.data.country,
          rating: res.data.rating,
        };

        movieCache[cacheKeyStr] = {
          data: movieData,
          timestamp: Date.now(),
        };

        setDetails(movieData);
      } catch (err) {
        setDetails({ error: "Failed to load details." });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [movie.id, movie.title]);

  // Close modal if clicking outside
  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // ESC key closes modal
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Check if movie is already in watchlist
  const isInWatchlist =
    details?.title && watchlistTitles?.includes(details.title);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      onClick={handleBackgroundClick}
    >
      <div className="bg-white w-full max-w-4xl max-h-[90vh] p-6 rounded shadow-lg relative overflow-y-auto">
        {/* Close button */}
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0 w-full md:w-1/3">
              <div className="w-full h-96 bg-gray-200 animate-pulse rounded" />
            </div>
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-gray-200 animate-pulse w-3/4 rounded" />
              <div className="space-y-2">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="h-4 bg-gray-200 animate-pulse w-full rounded"
                  />
                ))}
              </div>
              <div className="h-10 bg-gray-200 animate-pulse w-32 rounded" />
            </div>
          </div>
        ) : details?.error ? (
          // Error state
          <div className="text-red-500 text-center py-8">{details.error}</div>
        ) : (
          // Movie content
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0 w-full md:w-1/3">
              <img
                src={details.poster}
                alt={details.title}
                className="w-full h-auto rounded"
                onError={(e) => {
                  e.target.src = "/placeholder-poster.png";
                  e.target.className += " bg-gray-200 p-4";
                }}
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              <h2 className="text-2xl font-bold">
                {details.title}
                {details.release_date &&
                  ` (${details.release_date.split("-")[0]})`}
              </h2>
              <div className="space-y-2 text-sm">
                {details.tagline && (
                  <p className="italic text-gray-600">"{details.tagline}"</p>
                )}
                <p>
                  <strong>Released:</strong> {details.released}
                </p>
                <p>
                  <strong>Genre:</strong> {details.genre}
                </p>
                <p>
                  <strong>Runtime:</strong> {details.runtime}
                </p>
                <p>
                  <strong>Plot:</strong> {details.plot}
                </p>
                <p>
                  <strong>Director:</strong> {details.director}
                </p>
                <p>
                  <strong>Actors:</strong> {details.actors}
                </p>
                <p>
                  <strong>Language:</strong> {details.language}
                </p>
                <p>
                  <strong>Country:</strong> {details.country}
                </p>
                <p>
                  <strong>Rating:</strong> {details.rating}
                </p>
              </div>

              {/* Action buttons */}
              <div className="mt-6 flex gap-4 flex-wrap">
                {isSelected ? (
                  <>
                    <button
                      onClick={() => onRemove(movie)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                    <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                      Select
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onAdd(movie)}
                    disabled={!canAdd}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {canAdd ? "Add" : "Max Selected"}
                  </button>
                )}

                {/* Watchlist action */}
                {isInWatchlist ? (
                  <button
                    onClick={() => handleRemoveFromWatchlist(details)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Remove from Watchlist
                  </button>
                ) : (
                  <button
                    onClick={() => handleAddToWatchlist(details)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                  >
                    Add to Watchlist
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieModal;
