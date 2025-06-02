import { useEffect, useState } from "react";
import axios from "axios";

const useTmdbSearch = (searchQuery) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchMovies = async () => {
      if (searchQuery.length < 3) return;
      setLoading(true);
      try {
        const res = await axios.get(
          `/api/tmdb/search?query=${encodeURIComponent(searchQuery)}`
        );
        setResults(res.data);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchMovies, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return { results, loading };
};

export default useTmdbSearch;
