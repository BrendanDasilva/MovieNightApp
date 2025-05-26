import React from "react";
import { IoMdAdd, IoMdRemove } from "react-icons/io"; // Add/Remove icons

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

  // Track if movie is selected or in watchlist
  const isSelected = selectedPosters.includes(title);
  const isInWatchlist = watchlistTitles.includes(title);

  // Get the correct poster path
  const poster =
    posterMap?.[movie.title] ||
    (movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : null);

  // Handle selection toggle (Add/Remove from selectedPosters)
  const toggleSelection = (e) => {
    e.stopPropagation();
    isSelected ? handleRemovePoster(title) : handleAddPoster(title, poster);
  };

  // Handle watchlist toggle (Add/Remove from watchlistTitles)
  const toggleWatchlist = (e) => {
    e.stopPropagation();
    isInWatchlist
      ? handleRemoveFromWatchlist({ title })
      : handleAddToWatchlist({ title });
  };

  return (
    <div
      className="relative aspect-[2/3] rounded overflow-hidden shadow-inner cursor-pointer transform transition-transform duration-200 hover:scale-105 hover:border-2 hover:border-white group"
      onClick={() => setSelectedMovie({ title, poster })}
    >
      {/* Movie poster image */}
      <img
        src={poster || "/placeholder-poster.jpg"}
        alt={title}
        className="w-full h-full object-cover rounded"
      />

      {/* Selection icon button (top-right corner) */}
      <div className="absolute top-1.5 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={toggleSelection}
          title={isSelected ? "Remove" : "Add"}
          className={`
            p-[6px] rounded-full border-2 border-white 
            flex items-center justify-center transition-colors duration-300 group/select
            ${
              isSelected
                ? "hover:bg-red-700" // transparent by default, red on hover
                : "hover:bg-green-700"
            }
          `}
        >
          {/* Rotate animation ONLY on icon (based on state) */}
          {isSelected ? (
            <IoMdRemove
              size={22}
              className="text-white transition-transform duration-300 group-hover/select:rotate-180"
            />
          ) : (
            <IoMdAdd
              size={24}
              className="text-white transition-transform duration-300 group-hover/select:rotate-90"
            />
          )}
        </button>
      </div>

      {/* Watchlist button (bottom overlay, full width) */}
      <div className="absolute bottom-0 left-0 right-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={toggleWatchlist}
          className={`
            w-full relative py-2 text-sm font-semibold text-white overflow-hidden 
            before:absolute before:top-0 before:-left-full before:w-full before:h-full before:transition-all before:duration-500 before:ease-in-out
            before:z-[-1]
            ${
              isInWatchlist
                ? "before:bg-gradient-to-r before:from-red-500 before:to-red-700 hover:before:left-0"
                : "before:bg-gradient-to-r before:from-green-500 before:to-green-700 hover:before:left-0"
            }
          `}
        >
          {isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
        </button>
      </div>
    </div>
  );
};

export default MoviePoster;
