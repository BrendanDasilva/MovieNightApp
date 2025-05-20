import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import NavBar from "../components/NavBar";
import LoadingDots from "../components/LoadingDots";
import SearchBox from "../components/SearchBox";

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
}) => {
  const [allMovies, setAllMovies] = useState([]);
  const [visibleMovies, setVisibleMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAppending, setIsAppending] = useState(false);
  const [posterErrors, setPosterErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCache = useRef({});
  const loadMoreRef = useRef(null);

  // Filter movies by search query
  const filteredMovies = useMemo(() => {
    return allMovies.filter((movie) =>
      movie.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allMovies, searchQuery]);

  // Save and show first chunk of movies
  const handleWatchlistResponse = (titles) => {
    setAllMovies(titles);
    setVisibleMovies(titles.slice(0, CHUNK_SIZE));
  };

  // Fetch user's watchlist
  const fetchWatchlist = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3001/watchlist/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      handleWatchlistResponse(res.data);
    } catch (err) {
      console.error("Failed to load saved watchlist");
    } finally {
      setIsLoading(false);
    }
  };

  // Append more movies to the view
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

  // Fetch poster for a given title and cache result
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

  // Load initial watchlist
  useEffect(() => {
    fetchWatchlist();
  }, []);

  // Fetch posters for all visible movies
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

  // Fetch posters for selected movies (in case not visible yet)
  useEffect(() => {
    const fetchSelectedPosters = async () => {
      const toFetch = selectedPosters.filter(
        (title) => title && !posterMap[title] && !fetchCache.current[title]
      );
      await Promise.allSettled(toFetch.map((title) => fetchPoster(title)));
    };
    fetchSelectedPosters();
  }, [selectedPosters]);

  // Trigger lazy loading via intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && visibleMovies.length < filteredMovies.length)
        loadMore();
    });
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [visibleMovies, filteredMovies]);

  // Reset visible slice when filter changes
  useEffect(() => {
    setVisibleMovies(filteredMovies.slice(0, CHUNK_SIZE));
  }, [filteredMovies]);

  // Render individual movie poster with button controls
  const renderPoster = (movie, idx) => {
    const title = movie.title;
    const poster = posterMap[title];
    const error = posterErrors[title];

    if (error) {
      return (
        <div
          key={idx}
          className="relative w-full aspect-[2/3] bg-gray-200 rounded-lg shadow-inner flex flex-col items-center justify-center p-2 text-center"
        >
          <span className="text-red-500 text-sm mb-2">
            Error loading poster
          </span>
          <button
            onClick={() => fetchPoster(title)}
            className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
          >
            Retry
          </button>
        </div>
      );
    }

    if (!poster) {
      return (
        <div
          key={idx}
          className="w-full aspect-[2/3] bg-gray-200 rounded-lg shadow-inner flex items-center justify-center text-gray-500 animate-pulse"
        >
          Loading...
        </div>
      );
    }

    return (
      <div key={idx} className="relative">
        <img
          src={poster}
          alt={title}
          onClick={() => setSelectedMovie(movie)}
          className="cursor-pointer w-full aspect-[2/3] object-cover rounded shadow-inner bg-gray-200 transition-transform duration-200 hover:scale-105"
        />
        <button
          className={`absolute top-2 right-2 text-white px-2 py-1 rounded text-sm ${
            selectedPosters.includes(title)
              ? "bg-red-500 hover:bg-red-600"
              : "bg-purple-500 hover:bg-purple-600"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            selectedPosters.includes(title)
              ? handleRemovePoster(title)
              : handleAddPoster(title, poster);
          }}
          disabled={
            !selectedPosters.includes(title) && selectedPosters.length >= 3
          }
        >
          {selectedPosters.includes(title) ? "Remove" : "Add"}
        </button>
      </div>
    );
  };

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
            {visibleMovies.map((movie, idx) => renderPoster(movie, idx))}
          </div>
        )}

        {!isLoading && isAppending && <LoadingDots />}
        <div ref={loadMoreRef} className="h-10 mt-10" />
      </div>
    </div>
  );
};

export default Watchlist;
