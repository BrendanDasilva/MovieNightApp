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
      className="relative aspect-[2/3] rounded overflow-hidden shadow-inner cursor-pointer transform transition-transform duration-200 hover:scale-105 group"
      onClick={() => setSelectedMovie({ title, poster })}
    >
      {/* Movie poster */}
      <img
        src={poster || "/placeholder-poster.jpg"}
        alt={title}
        className="w-full h-full object-cover rounded"
      />

      {/* Selection icon button */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={toggleSelection}
          className="p-2 rounded-full bg-black/70 hover:bg-black hover:scale-105 text-white"
        >
          {isSelected ? (
            <FiMinusSquare size={25} />
          ) : (
            <FiPlusSquare size={25} />
          )}
        </button>
      </div>

      {/* Watchlist button with animated hover effect */}
      <div className="absolute bottom-0 left-0 right-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={toggleWatchlist}
          className={`
            w-full relative py-2 text-sm font-semibold text-white overflow-hidden 
            before:absolute before:top-0 before:-left-full before:w-full before:h-full before:transition-all before:duration-500 before:ease-in-out
            before:z-[-1]
            ${
              isInWatchlist
                ? " before:bg-gradient-to-r before:from-red-500 before:to-red-700 hover:before:left-0"
                : " before:bg-gradient-to-r before:from-green-500 before:to-green-700 hover:before:left-0"
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
