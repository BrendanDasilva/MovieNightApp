import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { IoMdAdd, IoMdRemove } from "react-icons/io";

// In-memory cache for TMDB responses (expires after 1 hour)
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
  refreshWatchlist, // optional callback to refresh global watchlist state
}) => {
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: "", type: "" });
  const [activeTab, setActiveTab] = useState("cast"); // UI tab state

  const cacheKey = useRef("");

  // Fetch movie details from TMDB or use cached value
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
          language: res.data.language?.toUpperCase(),
          country: res.data.country,
          rating: res.data.rating,
          production: res.data.production_companies?.length
            ? res.data.production_companies
                .map((c) => c.name)
                .filter(Boolean)
                .join(", ")
            : "N/A",
          production_countries: res.data.production_countries?.length
            ? res.data.production_countries
                .map((c) => c.name)
                .filter(Boolean)
                .join(", ")
            : "N/A",
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

  // ESC key closes modal
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Check if current movie is in user's watchlist
  const isInWatchlist = watchlistTitles.some(
    (m) => m?.id && m.id === details?.id
  );

  // Toast notification handler
  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast({ visible: false, message: "", type: "" });
    }, 3000);
  };

  // Close modal when clicking outside content
  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center"
      onClick={handleBackgroundClick}
    >
      <div className="bg-[#14181c] text-white w-full max-w-4xl max-h-[90vh] p-6 rounded-lg shadow-xl relative overflow-y-auto animate-fade-in">
        {/* Close modal */}
        <button
          className="absolute top-3 right-4 text-gray-400 hover:text-white text-2xl"
          onClick={onClose}
        >
          &times;
        </button>

        {/* Toast Message */}
        {toast.visible && (
          <div
            className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded shadow-lg z-50 text-white ${
              toast.type === "error" ? "bg-red-600" : "bg-green-600"
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3">
              <div className="w-full h-96 bg-gray-700 animate-pulse rounded" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="h-6 w-2/3 bg-gray-700 animate-pulse rounded" />
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 bg-gray-700 animate-pulse rounded w-full"
                />
              ))}
            </div>
          </div>
        ) : details?.error ? (
          <div className="text-red-500 text-center py-10">{details.error}</div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Poster and buttons */}
            <div className="w-full md:w-1/3 relative">
              <img
                src={details.poster}
                alt={details.title}
                className="w-full rounded shadow-md"
                onError={(e) => {
                  e.target.src = "/placeholder-poster.png";
                  e.target.className += " bg-gray-700 p-4";
                }}
              />

              {/* Selection toggle */}
              <div className="absolute top-2 right-2 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    isSelected ? onRemove(movie) : onAdd(movie);
                  }}
                  className={`group p-[6px] rounded-full border-2 border-white bg-black/60 flex items-center justify-center transition-colors duration-300 ${
                    isSelected ? "hover:bg-red-700" : "hover:bg-green-700"
                  }`}
                >
                  {isSelected ? (
                    <IoMdRemove
                      size={22}
                      className="text-white transition-transform duration-300 group-hover:rotate-180"
                    />
                  ) : (
                    <IoMdAdd
                      size={22}
                      className="text-white transition-transform duration-300 group-hover:rotate-90"
                    />
                  )}
                </button>
              </div>

              {/* Watchlist button */}
              <div className="absolute bottom-0 left-0 right-0 z-10">
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (isInWatchlist) {
                      await handleRemoveFromWatchlist(details);
                      showToast("Movie removed from watchlist", "error");
                    } else {
                      await handleAddToWatchlist(details);
                      showToast("Movie added to watchlist", "success");
                    }
                    if (refreshWatchlist) await refreshWatchlist();
                  }}
                  className={`w-full relative py-2 text-sm font-semibold text-white bg-black/60 overflow-hidden transition-colors duration-300 hover:bg-transparent before:absolute before:top-0 before:-left-full before:w-full before:h-full before:transition-all before:duration-500 before:ease-in-out before:z-[-1] hover:before:left-0 ${
                    isInWatchlist
                      ? "before:bg-gradient-to-r before:from-red-500 before:to-red-700"
                      : "before:bg-gradient-to-r before:from-green-500 before:to-green-700"
                  }`}
                >
                  {isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                </button>
              </div>
            </div>

            {/* Movie info */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">
                {details.title}
                {details.release_date &&
                  ` (${details.release_date.split("-")[0]})`}
              </h2>
              {details.tagline && (
                <p className="italic text-gray-400 mb-3">"{details.tagline}"</p>
              )}

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-4">
                {details.genre.split(", ").map((g) => (
                  <span
                    key={g}
                    className="bg-gray-700 text-xs px-3 py-1 rounded-full uppercase"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Plot */}
              {details.plot && (
                <p className="text-sm text-gray-200 mb-4">
                  <strong>Plot:</strong> {details.plot}
                </p>
              )}

              {/* Tabs */}
              <div className="mb-4 border-b border-gray-700">
                <button
                  onClick={() => setActiveTab("cast")}
                  className={`mr-4 pb-2 border-b-2 ${
                    activeTab === "cast"
                      ? "border-white"
                      : "border-transparent text-gray-400"
                  }`}
                >
                  Cast
                </button>
                <button
                  onClick={() => setActiveTab("details")}
                  className={`mr-4 pb-2 border-b-2 ${
                    activeTab === "details"
                      ? "border-white"
                      : "border-transparent text-gray-400"
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab("releases")}
                  className={`pb-2 border-b-2 ${
                    activeTab === "releases"
                      ? "border-white"
                      : "border-transparent text-gray-400"
                  }`}
                >
                  Releases
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === "cast" && (
                <div className="flex flex-wrap gap-2">
                  {details.actors?.split(", ").map((actor) => (
                    <span
                      key={actor}
                      className="bg-gray-700 text-xs px-3 py-1 rounded-full"
                    >
                      {actor}
                    </span>
                  ))}
                </div>
              )}

              {activeTab === "details" && (
                <div className="text-sm space-y-2">
                  <p>
                    <strong>Director:</strong> {details.director}
                  </p>
                  <p>
                    <strong>Language:</strong> {details.language}
                  </p>
                  <p>
                    <strong>Country:</strong> {details.country}
                  </p>
                  <p>
                    <strong>Production:</strong> {details.production}
                  </p>
                  <p>
                    <strong>Production Countries:</strong>{" "}
                    {details.production_countries}
                  </p>
                </div>
              )}

              {activeTab === "releases" && (
                <p className="text-sm">
                  <strong>Released:</strong> {details.released}
                </p>
              )}
            </div>
            {details.rating && (
              <div
                className={`absolute bottom-4 right-4 text-white font-bold text-sm px-3 py-2 rounded shadow-lg ${
                  Number(details.rating) < 2
                    ? "bg-red-700"
                    : Number(details.rating) < 4
                    ? "bg-orange-600"
                    : Number(details.rating) < 6
                    ? "bg-yellow-500"
                    : Number(details.rating) < 8
                    ? "bg-lime-500"
                    : "bg-green-600"
                }`}
              >
                {Number(details.rating).toFixed(1)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieModal;
