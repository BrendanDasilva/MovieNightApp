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

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
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

        {!details ? (
          <div>Loading...</div>
        ) : details.error ? (
          <div className="text-red-500">{details.error}</div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Poster (smaller) */}
            <div className="flex-shrink-0 w-full md:w-1/3">
              <img
                src={details.poster}
                alt={details.title}
                className="w-full h-auto rounded"
              />
            </div>

            {/* Movie Info */}
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
