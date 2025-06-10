import { useEffect, useState } from "react";
import axios from "axios";

// Custom hook for searching TMDB by movie title or actor name with pagination support
const useTmdbSearch = (searchQuery, searchMode = "movie", page = 1) => {
  const [results, setResults] = useState([]); // Search results (array of movies)
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Optional error state

  useEffect(() => {
    const fetchResults = async () => {
      if (searchQuery.length < 3) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        if (searchMode === "actor") {
          // Actor search — returns all known-for movies
          const actorRes = await axios.get(
            `/api/tmdb/actor?query=${encodeURIComponent(searchQuery)}`
          );
          const movies = actorRes.data || [];
          setResults(movies);
        } else {
          // Movie search — paginated enrichment supported
          const movieRes = await axios.get(
            `/api/tmdb/search?query=${encodeURIComponent(
              searchQuery
            )}&page=${page}`
          );
          const movies = movieRes.data || [];

          // If page === 1, replace; if page > 1, append results
          setResults((prev) => (page === 1 ? movies : [...prev, ...movies]));
        }
      } catch (err) {
        console.error("TMDB search failed:", err.message);
        setError("Failed to fetch TMDB results");
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 500);
    return () => clearTimeout(debounce);
  }, [searchQuery, searchMode, page]);

  return { results, loading, error };
};

export default useTmdbSearch;
