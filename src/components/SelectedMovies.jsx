import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import MoviePoster from "./MoviePoster";

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
  const [showConfirm, setShowConfirm] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);

  // Pick 3 random titles from the watchlist and add them to the selection
  const handleRandom = () => {
    if (!allWatchlistTitles.length) return;
    const shuffled = [...allWatchlistTitles].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    selected.forEach((movie) => {
      if (!selectedPosters.some((m) => m.id === movie.id)) {
        handleAddPoster(movie);
      }
    });
  };

  // Clear all selected posters
  const handleClear = () => {
    selectedPosters.forEach((movie) => handleRemovePoster(movie.id));
  };

  // Confirm a selection (highlighting one movie as 'selected')
  const handleConfirmSelection = async (selectedMovie) => {
    const movies = selectedPosters.map((m) => ({
      title: m.title,
      poster: posterMap[m.id],
      id: m.id,
      isSelected: m.id === selectedMovie.id,
    }));

    try {
      await axios.post("http://localhost:3001/api/logs", { movies });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // Only clear the selected slots. Do NOT clear posterMap entirely.
      setSelectedPosters([]);
    } catch (err) {
      console.error("Failed to submit selection", err);
    }
  };

  return (
    <div
      className="fixed top-0 bottom-0 left-0 flex flex-col bg-[#14181c] shadow-lg transition-transform duration-300 ease-in-out z-50 w-[420px]"
      style={{
        transform: isDrawerOpen
          ? "translateX(0)"
          : `translateX(-${PANEL_WIDTH_PX - BUTTON_VISIBLE_PX}px)`,
      }}
    >
      {/* Header inside drawer */}
      <div className="px-4 py-4 flex justify-center">
        <Link
          to="/"
          className="hover:opacity-80 transition-opacity text-center"
        >
          <h1 className="text-xl font-semibold text-white">🎬 Movie Night</h1>
          <span className="text-xs text-white opacity-75 block">
            Powered by TMDB
          </span>
        </Link>
      </div>

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
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
        <div className="space-y-6 flex flex-col items-center w-full">
          {[0, 1, 2].map((slotIdx) => {
            const movie = selectedPosters[slotIdx];
            const poster = movie ? posterMap[movie.id] : null;

            return (
              <div
                key={slotIdx}
                className="flex flex-col items-center text-center space-y-2 group"
              >
                <span className="text-sm text-white font-semibold uppercase tracking-wider">
                  Pick {slotIdx + 1}
                </span>
                {movie && poster ? (
                  <div className="w-36 h-[13.5rem]">
                    <MoviePoster
                      movie={movie}
                      posterUrl={poster}
                      selectedPosters={selectedPosters}
                      posterMap={posterMap}
                      setSelectedMovie={setSelectedMovie}
                      onRemove={() => handleRemovePoster(movie.id)}
                      onSelect={
                        selectedPosters.length === 3
                          ? () => setShowConfirm(movie)
                          : undefined
                      }
                      mode="selection"
                    />
                  </div>
                ) : (
                  <div className="w-36 h-[13.5rem] bg-gray-700 rounded opacity-50" />
                )}
              </div>
            );
          })}
        </div>
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
