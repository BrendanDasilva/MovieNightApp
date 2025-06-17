import React from "react";

// Reusable search input with optional search mode toggle
const SearchBox = ({
  searchQuery,
  setSearchQuery,
  searchMode,
  setSearchMode,
  enableModeToggle = false,
}) => {
  const placeholder = enableModeToggle
    ? `Search ${searchMode}s...`
    : "Search...";

  return (
    <div className="m-6 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4">
        {/* Input field with clear button */}
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
          />

          {searchQuery.length > 0 && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 text-gray-400 hover:text-black"
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>

        {/* Toggle buttons, only shown if enabled */}
        {enableModeToggle && setSearchMode && (
          <div className="flex space-x-1">
            <button
              onClick={() => setSearchMode("movie")}
              className={`px-4 py-2 text-sm font-semibold rounded-l-md transition ${
                searchMode === "movie"
                  ? "bg-purple-600 text-white shadow"
                  : "bg-gray-300 text-gray-800 hover:bg-gray-400"
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setSearchMode("actor")}
              className={`px-4 py-2 text-sm font-semibold transition ${
                searchMode === "actor"
                  ? "bg-purple-600 text-white shadow"
                  : "bg-gray-300 text-gray-800 hover:bg-gray-400"
              }`}
            >
              Actors
            </button>
            <button
              onClick={() => setSearchMode("director")}
              className={`px-4 py-2 text-sm font-semibold rounded-r-md transition ${
                searchMode === "director"
                  ? "bg-purple-600 text-white shadow"
                  : "bg-gray-300 text-gray-800 hover:bg-gray-400"
              }`}
            >
              Directors
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBox;
