import { useMemo } from "react";
import Fuse from "fuse.js";

// Hook for fuzzy searching and sorting TMDB movie results
const useFilteredTmdbMovies = (
  movies,
  searchQuery,
  selectedDecade,
  selectedGenreId,
  sortBy,
  mode
) => {
  return useMemo(() => {
    let filtered = [...movies];

    // Apply fuzzy search only for movie mode
    if (searchQuery && mode === "movie") {
      const fuse = new Fuse(movies, {
        keys: ["title"],
        threshold: 0.4, // lower = stricter match
        ignoreLocation: true,
      });
      const results = fuse.search(searchQuery);
      filtered = results.map((r) => r.item); // Extract movie objects
    }

    // Genre filter
    if (selectedGenreId !== "All") {
      filtered = filtered.filter((movie) =>
        movie.genre?.split(", ").includes(selectedGenreId)
      );
    }

    // Decade filter
    if (selectedDecade !== "All") {
      filtered = filtered.filter((movie) => {
        const year = parseInt(movie.release_date?.slice(0, 4));
        if (isNaN(year)) return false;
        return selectedDecade === "Earlier"
          ? year < 1950
          : String(year).startsWith(selectedDecade.slice(0, 3));
      });
    }

    // Sorting logic (after fuzzy match)
    switch (sortBy) {
      case "releaseDesc":
        filtered.sort(
          (a, b) =>
            new Date(b.release_date || 0) - new Date(a.release_date || 0)
        );
        break;
      case "releaseAsc":
        filtered.sort(
          (a, b) =>
            new Date(a.release_date || 0) - new Date(b.release_date || 0)
        );
        break;
      case "ratingDesc":
        filtered.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
        break;
      case "ratingAsc":
        filtered.sort((a, b) => (a.vote_average || 0) - (b.vote_average || 0));
        break;
      case "runtimeAsc":
        filtered.sort((a, b) => (a.runtime || 0) - (b.runtime || 0));
        break;
      case "runtimeDesc":
        filtered.sort((a, b) => (b.runtime || 0) - (a.runtime || 0));
        break;
      case "title":
        filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
    }

    return filtered;
  }, [movies, searchQuery, selectedGenreId, selectedDecade, sortBy, mode]);
};

export default useFilteredTmdbMovies;
