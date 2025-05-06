// components/SearchBox.jsx
import React from "react";

const SearchBox = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="m-6 px-4">
      <input
        type="text"
        placeholder="Search movies..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full max-w-md mx-auto px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
    </div>
  );
};

export default SearchBox;
