import React from "react";

// Static options for decade and sorting
const decades = [
  "All",
  "2020s",
  "2010s",
  "2000s",
  "1990s",
  "1980s",
  "1970s",
  "1960s",
  "1950s",
  "Earlier",
];

const sortOptions = [
  { value: "", label: "None" },
  { value: "releaseDesc", label: "Release Date (Newest)" },
  { value: "releaseAsc", label: "Release Date (Oldest)" },
  { value: "ratingDesc", label: "Rating (High to Low)" },
  { value: "ratingAsc", label: "Rating (Low to High)" },
  { value: "runtimeAsc", label: "Length (Short to Long)" },
  { value: "runtimeDesc", label: "Length (Long to Short)" },
  { value: "title", label: "Film Name (A–Z)" },
];

// Filter component for Browse page (TMDB data)
const BrowseFilters = ({
  genres,
  selectedGenreId,
  setSelectedGenreId,
  selectedDecade,
  setSelectedDecade,
  sortBy,
  setSortBy,
}) => {
  return (
    <div className="flex flex-wrap gap-4 justify-center items-center mb-6">
      {/* Decade filter dropdown */}
      <div>
        <label className="block text-sm text-white mb-1">Decade</label>
        <select
          value={selectedDecade}
          onChange={(e) => setSelectedDecade(e.target.value)}
          className="bg-[#14181c] text-white px-3 py-2 rounded border border-gray-600"
        >
          {decades.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Genre filter dropdown */}
      <div>
        <label className="block text-sm text-white mb-1">Genre</label>
        <select
          value={selectedGenreId}
          onChange={(e) => setSelectedGenreId(e.target.value)}
          className="bg-[#14181c] text-white px-3 py-2 rounded border border-gray-600"
        >
          <option value="All">All</option>
          {(genres || []).map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sort options dropdown */}
      <div>
        <label className="block text-sm text-white mb-1">Sort By</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-[#14181c] text-white px-3 py-2 rounded border border-gray-600"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default BrowseFilters;
