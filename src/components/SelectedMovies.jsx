import React from "react";

const SelectedMovies = ({
  selectedPosters,
  posterMap,
  setSelectedMovie,
  handleRemovePoster,
}) => {
  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {selectedPosters.map((title, idx) => {
        const poster = posterMap[title];
        return (
          <div
            key={idx}
            className="h-48 bg-gray-200 rounded-lg shadow-inner flex items-center justify-center text-gray-500 text-lg overflow-hidden cursor-pointer"
            onClick={() => title && setSelectedMovie({ title })}
          >
            {poster ? (
              <img
                src={poster}
                alt={title}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              `Placeholder ${idx + 1}`
            )}
            {poster && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemovePoster(title);
                }}
                className="absolute top-2 right-2 text-white bg-red-500 p-1 rounded"
              >
                Remove
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SelectedMovies;
