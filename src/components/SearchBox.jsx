import React from "react";

// Reusable search input with search mode toggle
const SearchBox = ({
  searchQuery,
  setSearchQuery,
  searchMode,
  setSearchMode,
}) => {
  return (
    <div className="m-6 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2">
        {/* Input field */}
        <input
          type="text"
          placeholder={
            searchMode === "actor" ? "Search actors..." : "Search movies..."
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
        />

        {/* Toggle buttons */}
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
            className={`px-4 py-2 text-sm font-semibold rounded-r-md transition ${
              searchMode === "actor"
                ? "bg-purple-600 text-white shadow"
                : "bg-gray-300 text-gray-800 hover:bg-gray-400"
            }`}
          >
            Actors
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBox;
