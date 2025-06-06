import React from "react";
import { IoMdAdd, IoMdRemove } from "react-icons/io"; // Add/Remove icons

const MoviePoster = ({
  movie,
  posterUrl,
  selectedMovie,
  setSelectedMovie,
  selectedPosters = [],
  posterMap = {},
  handleAddPoster,
  handleRemovePoster,
  watchlistTitles = [],
  handleAddToWatchlist,
  handleRemoveFromWatchlist,
  mode = "default", // "default" for Browse/Watchlist, "selection" for SelectedMovies panel
  onSelect,
  onRemove,
}) => {
  const title = movie.title;

  // Determine if this movie is selected or in the watchlist
  const isSelected = selectedPosters.some((m) => m.id === movie.id);
  const isInWatchlist = watchlistTitles.some((m) => m?.title === title);

  // Get poster path from prop or TMDB
  const poster =
    posterUrl ||
    posterMap?.[title] ||
    (movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : null);

  // Toggle selection for global selectedPosters list
  const toggleSelection = (e) => {
    e.stopPropagation();
    isSelected ? handleRemovePoster?.(movie.id) : handleAddPoster?.(movie);
  };

  // Toggle watchlist for default mode
  const toggleWatchlist = (e) => {
    e.stopPropagation();
    isInWatchlist
      ? handleRemoveFromWatchlist?.(movie)
      : handleAddToWatchlist?.(movie);
  };

  return (
    <div
      className="relative aspect-[2/3] rounded overflow-hidden shadow-inner cursor-pointer transform transition-transform duration-200 hover:scale-105 hover:border-2 hover:border-white group"
      onClick={() => setSelectedMovie(movie)}
    >
      {/* Movie poster image */}
      {poster ? (
        <img
          src={poster}
          alt={title}
          className="w-full h-full object-cover rounded"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-black text-white text-center p-4 text-sm rounded">
          {title || "No Poster"}
        </div>
      )}

      {/* Top-right action button */}
      <div className="absolute top-1.5 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {mode === "default" ? (
          <button
            onClick={toggleSelection}
            title={isSelected ? "Remove" : "Add"}
            className={`
              group/select p-[6px] rounded-full border-2 border-white bg-black/60
              flex items-center justify-center transition-colors duration-300
              ${isSelected ? "hover:bg-red-700" : "hover:bg-green-700"}
            `}
          >
            {isSelected ? (
              <IoMdRemove
                size={22}
                className="text-white transition-transform duration-300 group-hover/select:rotate-180"
              />
            ) : (
              <IoMdAdd
                size={22}
                className="text-white transition-transform duration-300 group-hover/select:rotate-90"
              />
            )}
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.(title);
            }}
            title="Remove"
            className="group/remove p-[6px] rounded-full border-2 border-white bg-black/60
                       flex items-center justify-center transition-colors duration-300 hover:bg-red-700"
          >
            <IoMdRemove
              size={22}
              className="text-white transition-transform duration-300 group-hover/remove:rotate-180"
            />
          </button>
        )}
      </div>

      {/* Bottom watchlist button */}
      <div className="absolute bottom-0 left-0 right-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {mode === "default" ? (
          <button
            onClick={toggleWatchlist}
            className={`
              w-full relative py-2 text-sm font-semibold text-white bg-black/60 overflow-hidden 
              transition-colors duration-300 hover:bg-transparent
              before:absolute before:top-0 before:-left-full before:w-full before:h-full 
              before:transition-all before:duration-500 before:ease-in-out
              before:z-[-1] hover:before:left-0
              ${
                isInWatchlist
                  ? "before:bg-gradient-to-r before:from-red-500 before:to-red-700"
                  : "before:bg-gradient-to-r before:from-green-500 before:to-green-700"
              }
            `}
          >
            {isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
          </button>
        ) : selectedPosters.length === 3 ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(title);
            }}
            className={`
              w-full py-2 text-sm font-semibold text-white bg-black/60 relative overflow-hidden
              transition-colors duration-300 hover:bg-transparent
              before:absolute before:top-0 before:-left-full before:w-full before:h-full
              before:transition-all before:duration-500 before:ease-in-out before:z-[-1]
              before:bg-gradient-to-r before:from-green-500 before:to-green-700 hover:before:left-0
            `}
          >
            Make Selection
          </button>
        ) : (
          <div className="w-full py-2 text-sm font-semibold text-white bg-black/50 text-center">
            Add 3 movies to enable selection
          </div>
        )}
      </div>
    </div>
  );
};

export default MoviePoster;
