import { useMemo } from "react";

/**
 * Filters and sorts the full movie list based on search input, decade, genre, and sort preference
 */
const useFilteredMovies = (
  allMovies = [],
  searchQuery,
  selectedDecade,
  selectedGenre,
  sortBy
) => {
  return useMemo(() => {
    if (!Array.isArray(allMovies)) return [];

    let filtered = allMovies.filter((movie) => {
      const titleMatch = movie.title
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

      const genreMatch =
        selectedGenre === "All" || (movie.genre || "").includes(selectedGenre);

      const year = parseInt(movie.release_date?.slice(0, 4), 10);
      let decadeMatch = true;
      if (selectedDecade !== "All") {
        if (selectedDecade === "Earlier") {
          decadeMatch = year < 1950;
        } else {
          const decade = parseInt(selectedDecade.slice(0, 4), 10);
          decadeMatch = year >= decade && year < decade + 10;
        }
      }

      return titleMatch && genreMatch && decadeMatch;
    });

    filtered.sort((a, b) => {
      const runtimeA = parseInt(a.runtime, 10) || 0;
      const runtimeB = parseInt(b.runtime, 10) || 0;
      const dateA = new Date(a.release_date);
      const dateB = new Date(b.release_date);

      switch (sortBy) {
        case "createdAsc":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "createdDesc":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "yearAsc":
          return dateA - dateB;
        case "yearDesc":
          return dateB - dateA;
        case "title":
          return a.title.localeCompare(b.title);
        case "runtimeAsc":
          return runtimeA - runtimeB;
        case "runtimeDesc":
          return runtimeB - runtimeA;
        case "ratingAsc":
          return (a.rating || 0) - (b.rating || 0);
        case "ratingDesc":
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [allMovies, searchQuery, selectedDecade, selectedGenre, sortBy]);
};

export default useFilteredMovies;
