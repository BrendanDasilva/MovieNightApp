import { useEffect, useState } from "react";
import axios from "axios";

// Hook to handle browse queries (popular, top-rated, genre, decade)
const useBrowseQuery = ({
  query,
  genre = null,
  decade = null,
  page = 1,
  limit = 20,
}) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    // Skip fetching if query is not present or invalid
    if (!query || query === "__tmdb_placeholder__") {
      setResults([]);
      setTotalResults(0);
      return;
    }

    const fetchBrowseResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          query,
          page,
          limit,
        });

        if (genre) params.append("genre", genre);
        if (decade) params.append("decade", decade);

        const res = await axios.get(`/api/tmdb/search?${params.toString()}`);
        setResults(res.data.results || []);
        setTotalResults(res.data.total || 0);
      } catch (err) {
        console.error("Browse fetch error:", err.message);
        setError("Failed to fetch browse results");
        setResults([]);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    };

    fetchBrowseResults();
  }, [query, genre, decade, page, limit]);

  return { results, totalResults, loading, error };
};

export default useBrowseQuery;
