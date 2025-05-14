// src/components/SelectedMovies.jsx
import React, { useState } from "react";

const PANEL_WIDTH_PX = 320; // 20rem
const BUTTON_VISIBLE_PX = 48; // 3rem

const SelectedMovies = ({
  selectedPosters,
  posterMap,
  setSelectedMovie,
  handleRemovePoster,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => setIsOpen((open) => !open);

  // only show non-empty titles
  const titles = selectedPosters.filter((t) => t);

  return (
    <div
      className="
        fixed
        top-16       
        bottom-0         
        left-0
        flex
        flex-col
        bg-[#14181c]
        shadow-lg
        transition-transform
        duration-300
        ease-in-out
        z-20
        w-80           
      "
      style={{
        transform: isOpen
          ? "translateX(0)"
          : `translateX(-${PANEL_WIDTH_PX - BUTTON_VISIBLE_PX}px)`,
      }}
    >
      {/* toggle button */}
      <button
        onClick={toggleDrawer}
        className="
          self-end
          mt-4
          mr-2
          w-8 h-8
          flex items-center justify-center
          bg-[#ff8000] text-white
          rounded-full
          focus:outline-none
        "
        aria-label={isOpen ? "Close selections" : "Open selections"}
      >
        {isOpen ? "←" : "→"}
      </button>

      <span
        className="
          absolute
          top-1/2
          right-[-4.5rem]
          transform -translate-y-1/2 rotate-90
          text-white text-base
          font-bold
          whitespace-nowrap
          origin-center
        "
      >
        Movie Night Selections
      </span>

      {/* panel content */}
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
                  <button
                    onClick={() => handleRemovePoster(title)}
                    className="text-red-500 hover:underline text-xs"
                  >
                    Remove
                  </button>
                  {idx < titles.length - 1 && (
                    <hr className="w-full border-gray-700 mt-4" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectedMovies;
