import { useMemo } from "react";

const useFilteredTmdbMovies = (
  movies,
  searchQuery,
  selectedDecade,
  selectedGenreId,
  sortBy,
  mode // <-- ADD THIS
) => {
  return useMemo(() => {
    let filtered = [...movies];

    // 🛑 For actor mode, skip title filtering
    if (searchQuery && mode !== "actor") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((movie) =>
        movie.title?.toLowerCase().includes(query)
      );
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

    // Sorting
    switch (sortBy) {
      case "releaseDesc":
        filtered.sort(
          (a, b) => new Date(b.release_date) - new Date(a.release_date)
        );
        break;
      case "releaseAsc":
        filtered.sort(
          (a, b) => new Date(a.release_date) - new Date(b.release_date)
        );
        break;
      case "ratingDesc":
        filtered.sort((a, b) => b.vote_average - a.vote_average);
        break;
      case "ratingAsc":
        filtered.sort((a, b) => a.vote_average - b.vote_average);
        break;
      case "runtimeAsc":
        filtered.sort((a, b) => (a.runtime || 0) - (b.runtime || 0));
        break;
      case "runtimeDesc":
        filtered.sort((a, b) => (b.runtime || 0) - (a.runtime || 0));
        break;
      case "title":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return filtered;
  }, [movies, searchQuery, selectedGenreId, selectedDecade, sortBy, mode]);
};

export default useFilteredTmdbMovies;
