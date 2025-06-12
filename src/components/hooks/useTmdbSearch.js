import { useEffect, useState } from "react";
import axios from "axios";

// Custom hook for searching TMDB by movie title or actor name with pagination
const useTmdbSearch = (
  searchQuery,
  searchMode = "movie",
  page = 1,
  limit = 20
) => {
  const [results, setResults] = useState([]); // Fetched results
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    const fetchResults = async () => {
      // Skip fetch if search query is too short
      if (searchQuery.length < 3) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let url = "";

        if (searchMode === "actor") {
          // Actor search endpoint with pagination
          url = `/api/tmdb/actor?query=${encodeURIComponent(
            searchQuery
          )}&page=${page}&limit=${limit}`;
        } else {
          // Movie search endpoint with pagination
          url = `/api/tmdb/search?query=${encodeURIComponent(
            searchQuery
          )}&page=${page}&limit=${limit}`;
        }

        const res = await axios.get(url);
        setResults(res.data || []);
      } catch (err) {
        console.error("TMDB search failed:", err.message);
        setError("Failed to fetch TMDB results");
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 500); // Debounce user typing
    return () => clearTimeout(debounce);
  }, [searchQuery, searchMode, page, limit]);

  return { results, loading, error };
};

export default useTmdbSearch;
