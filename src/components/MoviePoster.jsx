import React from "react";
import { FiPlusSquare, FiMinusSquare } from "react-icons/fi";

const MoviePoster = ({
  movie,
  posterUrl,
  selectedMovie,
  setSelectedMovie,
  selectedPosters,
  posterMap,
  handleAddPoster,
  handleRemovePoster,
  watchlistTitles,
  handleAddToWatchlist,
  handleRemoveFromWatchlist,
}) => {
  const title = movie.title;

  const isSelected = selectedPosters.includes(title);
  const isInWatchlist = watchlistTitles.includes(title);
  const poster =
    posterMap?.[movie.title] ||
    (movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : null);

  const toggleSelection = (e) => {
    e.stopPropagation();
    isSelected ? handleRemovePoster(title) : handleAddPoster(title, poster);
  };

  const toggleWatchlist = (e) => {
    e.stopPropagation();
    isInWatchlist
      ? handleRemoveFromWatchlist({ title })
      : handleAddToWatchlist({ title });
  };

  return (
    <div
      className="relative aspect-[2/3] rounded overflow-hidden shadow-inner cursor-pointer transform transition-transform duration-200 hover:scale-105 group hover:border-2 hover:border-white"
      onClick={() => setSelectedMovie({ title, poster })}
    >
      {/* Movie poster */}
      <img
        src={poster || "/placeholder-poster.jpg"}
        alt={title}
        className="w-full h-full object-cover rounded"
      />

      {/* Selection button (top-right) */}
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={toggleSelection}
          className={`p-1 rounded text-white shadow-md text-xl transition-colors ${
            isSelected
              ? "bg-red-500 hover:bg-red-600"
              : "bg-[#00e054] hover:bg-green-600"
          }`}
          aria-label={isSelected ? "Remove from selection" : "Add to selection"}
        >
          {isSelected ? <FiMinusSquare /> : <FiPlusSquare />}
        </button>
      </div>

      {/* Watchlist button (bottom full-width overlay) */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <button
          onClick={toggleWatchlist}
          className={`
            w-full py-2 text-sm font-semibold text-white transition-colors duration-200
            bg-black/60
            ${isInWatchlist ? "hover:bg-red-600" : "hover:bg-green-600"}
          `}
        >
          {isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
        </button>
      </div>
    </div>
  );
};

export default MoviePoster;
