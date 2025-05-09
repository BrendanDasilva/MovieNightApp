import React from "react";
import LoadingDots from "./LoadingDots";

const GenreSpotlight = ({
  genreName,
  movies,
  loading,
  error,
  onMovieClick,
}) => {
  if (loading) return <LoadingDots />;
  if (error)
    return <div className="text-red-500">Error loading {genreName} movies</div>;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {movies.map((movie) => (
        <div
          key={movie.id}
          onClick={() =>
            onMovieClick({
              title: movie.title,
              year: movie.release_date?.split("-")[0],
            })
          }
          className="group relative aspect-[2/3] rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
        >
          <img
            src={
              movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : "/placeholder-poster.jpg"
            }
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
            <h3 className="text-white font-medium truncate">{movie.title}</h3>
            <div className="flex items-center mt-1">
              <span className="text-yellow-400 text-sm">★</span>
              <span className="text-white text-sm ml-1">
                {movie.vote_average?.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GenreSpotlight;
