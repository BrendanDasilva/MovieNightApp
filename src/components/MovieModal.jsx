import { useState, useEffect } from "react";
import axios from "axios";

const MovieModal = ({
  movie,
  onClose,
  onAdd,
  onRemove,
  isSelected,
  canAdd,
}) => {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const query = `title=${encodeURIComponent(movie.title)}${
          movie.year ? `&year=${movie.year}` : ""
        }`;
        const res = await axios.get(`http://localhost:3001/tmdb?${query}`);
        setDetails(res.data);
      } catch {
        setDetails({ error: "Failed to load details." });
      }
    };

    fetchDetails();
  }, [movie.title, movie.year]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-md p-6 rounded shadow-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
          onClick={onClose}
        >
          ✕
        </button>

        {!details ? (
          <div>Loading...</div>
        ) : details.error ? (
          <div className="text-red-500">{details.error}</div>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-2">
              {details.title} ({details.year})
            </h2>
            <img
              src={details.poster}
              alt={details.title}
              className="w-full h-auto rounded mb-4"
            />
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

            <div className="mt-4 flex gap-2">
              {isSelected ? (
                <button
                  onClick={() => {
                    onRemove(movie.title);
                    onClose();
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Remove
                </button>
              ) : (
                <button
                  onClick={() => {
                    onAdd(movie.title);
                    onClose();
                  }}
                  disabled={!canAdd}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {canAdd ? "Add" : "Max Selected"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MovieModal;
