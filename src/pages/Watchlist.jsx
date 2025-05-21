import React, { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import NavBar from "../components/NavBar";
import LoadingDots from "../components/LoadingDots";
import SearchBox from "../components/SearchBox";
import MoviePoster from "../components/MoviePoster";

const CHUNK_SIZE = 20;

const Watchlist = ({
  onLogout,
  selectedPosters,
  setSelectedPosters,
  posterMap,
  setPosterMap,
  handleAddPoster,
  handleRemovePoster,
  setSelectedMovie,
  handleAddToWatchlist,
  handleRemoveFromWatchlist,
}) => {
  const [allMovies, setAllMovies] = useState([]);
  const [visibleMovies, setVisibleMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAppending, setIsAppending] = useState(false);
  const [posterErrors, setPosterErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCache = useRef({});
  const loadMoreRef = useRef(null);

  const filteredMovies = useMemo(() => {
    return allMovies.filter((movie) =>
      movie.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allMovies, searchQuery]);

  const fetchWatchlist = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3001/watchlist/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllMovies(res.data);
      setVisibleMovies(res.data.slice(0, CHUNK_SIZE));
    } catch (err) {
      console.error("Failed to load saved watchlist");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    if (isAppending || visibleMovies.length >= filteredMovies.length) return;
    setIsAppending(true);
    setTimeout(() => {
      const next = filteredMovies.slice(
        visibleMovies.length,
        visibleMovies.length + CHUNK_SIZE
      );
      setVisibleMovies((prev) => [...prev, ...next]);
      setIsAppending(false);
    }, 500);
  };

  const fetchPoster = async (title) => {
    if (!title) return null;
    if (fetchCache.current[title]) return fetchCache.current[title];

    try {
      fetchCache.current[title] = { status: "pending" };
      const res = await axios.get(
        `http://localhost:3001/tmdb?title=${encodeURIComponent(title)}`
      );
      const poster = res.data.poster || null;

      fetchCache.current[title] = { status: "success", poster };
      setPosterMap((prev) => ({ ...prev, [title]: poster }));
      setPosterErrors((prev) => ({ ...prev, [title]: null }));
      return poster;
    } catch (err) {
      fetchCache.current[title] = { status: "error" };
      setPosterErrors((prev) => ({
        ...prev,
        [title]: "Failed to load poster",
      }));
      return null;
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  useEffect(() => {
    const fetchVisiblePosters = async () => {
      const toFetch = visibleMovies.filter(
        (movie) =>
          movie?.title &&
          !posterMap[movie.title] &&
          !fetchCache.current[movie.title]
      );
      await Promise.allSettled(toFetch.map((m) => fetchPoster(m.title)));
    };
    fetchVisiblePosters();
  }, [visibleMovies]);

  useEffect(() => {
    const fetchSelectedPosters = async () => {
      const toFetch = selectedPosters.filter(
        (title) => title && !posterMap[title] && !fetchCache.current[title]
      );
      await Promise.allSettled(toFetch.map((title) => fetchPoster(title)));
    };
    fetchSelectedPosters();
  }, [selectedPosters]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && visibleMovies.length < filteredMovies.length)
        loadMore();
    });
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [visibleMovies, filteredMovies]);

  useEffect(() => {
    setVisibleMovies(filteredMovies.slice(0, CHUNK_SIZE));
  }, [filteredMovies]);

  return (
    <div className="min-h-screen flex flex-col items-center">
      <NavBar onLogout={onLogout} />

      <div className="w-full max-w-5xl mt-28 mb-8 px-4 py-10 bg-[#202830] text-white rounded shadow">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-4">Your Movie Watchlist</h2>
          <SearchBox
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>

        {filteredMovies.length > 0 && (
          <h3 className="mb-6 text-lg font-medium text-center">
            {filteredMovies.length} movies found
          </h3>
        )}

        {isLoading && <LoadingDots />}

        {!isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 mt-6">
            {visibleMovies.map((movie, idx) => (
              <MoviePoster
                key={idx}
                movie={movie}
                posterMap={posterMap}
                setSelectedMovie={setSelectedMovie}
                selectedPosters={selectedPosters}
                handleAddPoster={handleAddPoster}
                handleRemovePoster={handleRemovePoster}
                watchlistTitles={allMovies.map((m) => m.title)}
                handleAddToWatchlist={() => handleAddToWatchlist(movie)}
                handleRemoveFromWatchlist={async () => {
                  await handleRemoveFromWatchlist(movie);
                  setAllMovies((prev) =>
                    prev.filter((m) => m.title !== movie.title)
                  );
                }}
              />
            ))}
          </div>
        )}

        {!isLoading && isAppending && <LoadingDots />}
        <div ref={loadMoreRef} className="h-10 mt-10" />
      </div>
    </div>
  );
};

export default Watchlist;
