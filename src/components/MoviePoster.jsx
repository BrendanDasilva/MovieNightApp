import React from "react";

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
      className="relative aspect-[2/3] rounded overflow-hidden shadow-inner cursor-pointer transform transition-transform duration-200 hover:scale-105"
      onClick={() => setSelectedMovie({ title, poster })}
    >
      <img
        src={poster || "/placeholder-poster.jpg"}
        alt={title}
        className="w-full h-full object-cover rounded"
      />

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
        <h3 className="text-white font-medium text-sm truncate px-2">
          {title}
        </h3>
      </div>

      {/* Buttons (Selection + Watchlist) */}
      <div className="absolute top-2 right-2 flex flex-col items-end gap-2 z-10">
        {/* Selection Button */}
        <button
          onClick={toggleSelection}
          className={`px-2 py-1 text-xs rounded font-semibold ${
            isSelected
              ? "bg-red-500 hover:bg-red-600"
              : "bg-purple-500 hover:bg-purple-600"
          } text-white shadow`}
        >
          {isSelected ? "Remove" : "Add"}
        </button>

        {/* Watchlist Button */}
        <button
          onClick={toggleWatchlist}
          className={`px-2 py-1 text-xs rounded font-semibold ${
            isInWatchlist
              ? "bg-red-600 hover:bg-red-700"
              : "bg-yellow-500 hover:bg-yellow-600"
          } text-white shadow`}
        >
          {isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
        </button>
      </div>
    </div>
  );
};

export default MoviePoster;
