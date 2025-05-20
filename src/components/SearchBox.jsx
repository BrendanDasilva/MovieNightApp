import React from "react";

// Simple reusable input field for searching movies
const SearchBox = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="m-6 px-4">
      <input
        type="text"
        placeholder="Search movies..."
        value={searchQuery} // controlled input value
        onChange={(e) => setSearchQuery(e.target.value)} // update state on change
        className="w-full max-w-md mx-auto px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
      />
    </div>
  );
};

export default SearchBox;
