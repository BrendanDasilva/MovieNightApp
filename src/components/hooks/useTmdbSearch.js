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
  const [totalResults, setTotalResults] = useState(0); // Total result count for pagination

  useEffect(() => {
    const fetchResults = async () => {
      // Skip fetch if search query is too short
      if (searchQuery.length < 3) {
        setResults([]);
        setTotalResults(0);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let url = "";

        if (searchMode === "actor") {
          url = `/api/tmdb/actor?query=${encodeURIComponent(
            searchQuery
          )}&page=${page}&limit=${limit}`;
        } else {
          url = `/api/tmdb/search?query=${encodeURIComponent(
            searchQuery
          )}&page=${page}&limit=${limit}`;
        }

        const res = await axios.get(url);

        // Expecting format: { results: [...], total: 60 }
        setResults(res.data.results || []);
        setTotalResults(res.data.total || 0);
      } catch (err) {
        console.error("TMDB search failed:", err.message);
        setError("Failed to fetch TMDB results");
        setResults([]);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 500); // Debounce user typing
    return () => clearTimeout(debounce);
  }, [searchQuery, searchMode, page, limit]);

  return { results, totalResults, loading, error };
};

export default useTmdbSearch;
