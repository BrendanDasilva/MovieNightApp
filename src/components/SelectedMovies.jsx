import React, { useState } from "react";
import axios from "axios";

const SelectedMovies = ({
  selectedPosters,
  posterMap,
  setSelectedMovie,
  handleRemovePoster,
  setSelectedPosters,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleSelect = async (index) => {
    if (!window.confirm("Are you sure you want to select this movie?")) return;

    try {
      const logData = selectedPosters.map((title, idx) => ({
        title,
        poster: posterMap[title] || "",
        isSelected: idx === index,
      }));

      await axios.post(
        "/api/logs",
        { movies: logData },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Clear selection after successful submission
      setSelectedPosters(["", "", ""]);
    } catch (err) {
      console.error("Failed to save log:", err);
    }
  };

  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {selectedPosters.map((title, idx) => {
        const poster = posterMap[title];
        return (
          <div
            key={idx}
            className="relative h-[480px] bg-gray-200 rounded-lg shadow-inner flex items-center justify-center text-gray-500 text-lg overflow-hidden cursor-pointer"
            onClick={() => title && setSelectedMovie({ title })}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {poster ? (
              <img
                src={poster}
                alt={title}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              `Pick ${idx + 1}`
            )}

            {poster && hoveredIndex === idx && (
              <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(idx);
                  }}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Select
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemovePoster(title);
                  }}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SelectedMovies;
