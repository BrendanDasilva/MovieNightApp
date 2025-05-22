import React, { useState } from "react";
import axios from "axios";

// Panel and toggle button sizing constants
const PANEL_WIDTH_PX = 420;
const BUTTON_VISIBLE_PX = 48;

const SelectedMovies = ({
  selectedPosters,
  posterMap,
  setSelectedMovie,
  handleRemovePoster,
  handleAddPoster,
  allWatchlistTitles,
  setSelectedPosters,
  setPosterMap,
  isDrawerOpen,
  setIsDrawerOpen,
}) => {
  const [showConfirm, setShowConfirm] = useState(null); // for selection confirmation
  const [showSuccess, setShowSuccess] = useState(false); // shows toast on success

  const titles = selectedPosters.filter((t) => t); // clean list of selected movie titles

  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);

  // Randomly select up to 3 movies from user's watchlist
  const handleRandom = () => {
    if (!allWatchlistTitles.length) return;
    const shuffled = [...allWatchlistTitles].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    selected.forEach((title) => {
      if (!selectedPosters.includes(title)) {
        const poster = posterMap[title] || null;
        handleAddPoster(title, poster);
      }
    });
  };

  // Remove all selected posters
  const handleClear = () => {
    selectedPosters.forEach((title) => handleRemovePoster(title));
  };

  // Finalize selected movies and save to backend
  const handleConfirmSelection = async (selectedTitle) => {
    const movies = selectedPosters.map((title) => ({
      title,
      poster: posterMap[title],
      isSelected: title === selectedTitle,
    }));

    try {
      await axios.post("http://localhost:3001/api/logs", { movies });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setSelectedPosters([]);
      setPosterMap({});
    } catch (err) {
      console.error("Failed to submit selection", err);
    }
  };

  return (
    <div
      className="fixed top-16 bottom-0 left-0 flex flex-col bg-[#14181c] shadow-lg transition-transform duration-300 ease-in-out z-20 w-[420px]"
      style={{
        transform: isDrawerOpen
          ? "translateX(0)"
          : `translateX(-${PANEL_WIDTH_PX - BUTTON_VISIBLE_PX}px)`,
      }}
    >
      {/* Toggle drawer */}
      <button
        onClick={toggleDrawer}
        className="self-end mt-4 mr-2 w-8 h-8 flex items-center justify-center bg-[#ff8000] text-white rounded-full focus:outline-none"
        aria-label={isDrawerOpen ? "Close selections" : "Open selections"}
      >
        {isDrawerOpen ? "←" : "→"}
      </button>

      {/* Rotated label */}
      <span className="absolute top-1/2 right-[-4.5rem] transform -translate-y-1/2 rotate-90 text-white text-base font-bold whitespace-nowrap origin-center">
        Movie Night Selections
      </span>

      {/* Selected movies */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
        {titles.length === 0 ? (
          <p className="text-gray-500 text-sm">No movies selected.</p>
        ) : (
          <div className="space-y-6 flex flex-col items-center justify-center w-full">
            {titles.map((title, idx) => {
              const poster = posterMap[title];
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center text-center space-y-2"
                >
                  {poster ? (
                    <img
                      src={poster}
                      alt={title}
                      onClick={() => setSelectedMovie({ title })}
                      className="w-32 h-auto object-cover rounded cursor-pointer"
                    />
                  ) : (
                    <div className="w-24 h-36 bg-gray-500 rounded animate-pulse" />
                  )}
                  <span className="text-white text-sm font-medium">
                    {title}
                  </span>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowConfirm(title)}
                      className="text-[#00e054] hover:underline text-xs"
                    >
                      Select
                    </button>
                    <button
                      onClick={() => handleRemovePoster(title)}
                      className="text-red-500 hover:underline text-xs"
                    >
                      Remove
                    </button>
                  </div>
                  {idx < titles.length - 1 && (
                    <hr className="w-full border-gray-700 mt-4" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="p-4 flex flex-col items-center gap-3 text-white w-full">
        <button
          onClick={handleRandom}
          className="w-3/4 text-sm uppercase font-bold px-4 py-2 rounded-md bg-[#00e054] hover:bg-green-600 transition-colors duration-200"
        >
          Random
        </button>
        <button
          onClick={handleClear}
          className="w-3/4 text-sm uppercase font-bold px-4 py-2 rounded-md bg-[#40bcf4] hover:bg-blue-600 transition-colors duration-200"
        >
          Clear
        </button>
      </div>

      {/* Confirm selection popup */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-xl text-center animate-fade-in">
            <p className="text-lg font-semibold mb-4">
              Are you sure about this pick?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  handleConfirmSelection(showConfirm);
                  setShowConfirm(null);
                }}
                className="px-4 py-2 rounded bg-[#00e054] text-white font-bold"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConfirm(null)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success toast */}
      {showSuccess && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#00e054] text-white font-bold py-3 px-6 rounded shadow-lg animate-fade-in">
          Selection logged successfully!
        </div>
      )}
    </div>
  );
};

export default SelectedMovies;
