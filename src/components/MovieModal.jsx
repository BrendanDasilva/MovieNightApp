import { useState, useEffect, useRef } from "react";
import axios from "axios";

// Cache movie details for 5 minutes
const MOVIE_CACHE_TTL = 5 * 60 * 1000;
const movieCache = {};

const MovieModal = ({
  movie,
  onClose,
  onAdd,
  onRemove,
  isSelected,
  canAdd,
}) => {
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const cacheKey = useRef(`${movie.title}-${movie.year}`);

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      const cachedData = movieCache[cacheKey.current];

      if (cachedData && Date.now() - cachedData.timestamp < MOVIE_CACHE_TTL) {
        setDetails(cachedData.data);
        setIsLoading(false);
        return;
      }

      try {
        const query = `title=${encodeURIComponent(movie.title)}${
          movie.year ? `&year=${movie.year}` : ""
        }`;
        const res = await axios.get(`http://localhost:3001/tmdb?${query}`);

        const movieData = {
          title: res.data.title,
          year: res.data.release_date?.split("-")[0],
          released: res.data.release_date,
          poster: res.data.poster,
          genre: res.data.genre,
          director: res.data.director,
          runtime: res.data.runtime,
          plot: res.data.plot,
          actors: res.data.actors,
          language: res.data.language,
          country: res.data.country,
        };

        movieCache[cacheKey.current] = {
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
  }, [movie.title, movie.year]);

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      onClick={handleBackgroundClick}
    >
      <div className="bg-white w-full max-w-4xl max-h-[90vh] p-6 rounded shadow-lg relative overflow-y-auto">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
          onClick={onClose}
        >
          ✕
        </button>

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
          <div className="text-red-500 text-center py-8">{details.error}</div>
        ) : (
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
              <h2 className="text-2xl font-bold mb-4">
                {details.title} ({details.year})
              </h2>
              <div className="space-y-2 text-sm">
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
              </div>

              <div className="mt-6 flex gap-4 flex-wrap">
                {isSelected ? (
                  <>
                    <button
                      onClick={() => onRemove(movie.title)}
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
                    onClick={() => onAdd(movie.title)}
                    disabled={!canAdd}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {canAdd ? "Add" : "Max Selected"}
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
