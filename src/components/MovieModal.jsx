import { useState, useEffect } from "react";
import axios from "axios";

const MovieModal = ({ movie, onClose }) => {
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
            {details.awards !== "N/A" && (
              <p>
                <strong>Awards:</strong> {details.awards}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MovieModal;
