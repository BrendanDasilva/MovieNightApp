import { useState, useEffect, useRef } from "react";
import axios from "axios";

const CHUNK_SIZE = 20;

// Custom hook for fetching and managing watchlist data and posters
const useWatchlistData = (setPosterMap, selectedPosters) => {
  const [allMovies, setAllMovies] = useState([]); // full watchlist
  const [visibleMovies, setVisibleMovies] = useState([]); // chunked list
  const [isLoading, setIsLoading] = useState(false); // fetch loading state
  const [isAppending, setIsAppending] = useState(false); // chunk load state
  const [posterErrors, setPosterErrors] = useState({}); // poster fetch errors

  const fetchCache = useRef({}); // poster fetch memoization
  const loadMoreRef = useRef(null); // infinite scroll trigger

  // Fetch watchlist from backend
  const fetchWatchlist = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3001/watchlist/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllMovies(Array.isArray(res.data) ? res.data : []);
      setVisibleMovies(res.data.slice(0, CHUNK_SIZE));
    } catch (err) {
      console.error("Failed to load saved watchlist", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load more visible movies (for infinite scroll)
  const loadMore = (filteredMovies) => {
    setVisibleMovies((prev) => {
      const alreadyShown = new Set(prev.map((m) => m.id ?? m._id ?? m.title));
      const newMovies = filteredMovies
        .filter((m) => !alreadyShown.has(m.id ?? m._id ?? m.title))
        .slice(0, CHUNK_SIZE);
      return [...prev, ...newMovies];
    });
  };

  // Fetch a poster image from TMDB by movie ID and cache it
  const fetchPoster = async (movie) => {
    const id = movie?.id;
    if (!id || fetchCache.current[id]) return;

    try {
      fetchCache.current[id] = { status: "pending" };
      const res = await axios.get(`http://localhost:3001/tmdb?id=${id}`);
      const poster = res.data.poster || null;
      fetchCache.current[id] = { status: "success", poster };
      setPosterMap((prev) => ({ ...prev, [id]: poster }));
      setPosterErrors((prev) => ({ ...prev, [id]: null }));
    } catch (err) {
      fetchCache.current[id] = { status: "error" };
      setPosterErrors((prev) => ({
        ...prev,
        [id]: "Failed to load poster",
      }));
    }
  };

  // Fetch posters for visible movies
  useEffect(() => {
    const fetchVisiblePosters = async () => {
      const toFetch = visibleMovies.filter(
        (m) => m?.id && !posterErrors[m.id] && !fetchCache.current[m.id]
      );
      await Promise.allSettled(toFetch.map((m) => fetchPoster(m)));
    };
    fetchVisiblePosters();
  }, [visibleMovies]);

  // Fetch posters for selected movies
  useEffect(() => {
    const fetchSelectedPosters = async () => {
      const toFetch = selectedPosters.filter(
        (m) => m?.id && !posterErrors[m.id] && !fetchCache.current[m.id]
      );
      await Promise.allSettled(toFetch.map((m) => fetchPoster(m)));
    };
    fetchSelectedPosters();
  }, [selectedPosters]);

  // Initial watchlist fetch
  useEffect(() => {
    fetchWatchlist();
  }, []);

  return {
    allMovies,
    setAllMovies,
    visibleMovies,
    setVisibleMovies,
    isLoading,
    isAppending,
    posterErrors,
    loadMoreRef,
    loadMore,
  };
};

export default useWatchlistData;
