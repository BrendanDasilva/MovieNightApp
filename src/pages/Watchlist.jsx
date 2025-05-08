import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import MovieModal from "../components/MovieModal";
import NavBar from "../components/NavBar";
import Search from "../components/Search";
import LoadingDots from "../components/LoadingDots";
import SelectedMovies from "../components/SelectedMovies";
import SearchBox from "../components/SearchBox";

const CHUNK_SIZE = 20;

const Watchlist = ({ onLogout }) => {
  const [username, setUsername] = useState("");
  const [allMovies, setAllMovies] = useState([]);
  const [visibleMovies, setVisibleMovies] = useState([]);
  const [posterMap, setPosterMap] = useState({});
  const [isPosterView, setIsPosterView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAppending, setIsAppending] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [posterErrors, setPosterErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPosters, setSelectedPosters] = useState(() => {
    const saved = localStorage.getItem("selectedPosters");
    try {
      return saved ? JSON.parse(saved) : ["", "", ""];
    } catch {
      return ["", "", ""];
    }
  });

  const fetchCache = useRef({});
  const loadMoreRef = useRef(null);

  const filteredMovies = useMemo(() => {
    return allMovies.filter((movie) =>
      movie.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allMovies, searchQuery]);

  useEffect(() => {
    localStorage.setItem("selectedPosters", JSON.stringify(selectedPosters));
  }, [selectedPosters]);

  const handleWatchlistResponse = (titles) => {
    setAllMovies(titles);
    setVisibleMovies(titles.slice(0, CHUNK_SIZE));
  };

  const resetState = () => {
    setAllMovies([]);
    setVisibleMovies([]);
    setPosterMap({});
    setSelectedPosters(["", "", ""]);
  };

  const fetchWatchlist = async () => {
    if (!username) return;
    setIsLoading(true);
    resetState();
    try {
      const res = await axios.get(
        `http://localhost:3001/watchlist/${username}`
      );
      handleWatchlistResponse(res.data);
    } catch (err) {
      console.error("Failed to fetch watchlist");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshWatchlist = async () => {
    if (!username) return;
    setIsLoading(true);
    resetState();
    try {
      const res = await axios.get(
        `http://localhost:3001/watchlist/${username}/refresh`
      );
      handleWatchlistResponse(res.data);
    } catch (err) {
      console.error("Failed to refresh watchlist");
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

  const handleAddPoster = (title) => {
    const emptyIndex = selectedPosters.findIndex((p) => p === "");
    if (emptyIndex !== -1) {
      const updated = [...selectedPosters];
      updated[emptyIndex] = title;
      setSelectedPosters(updated);
    }
  };

  const handleRemovePoster = (title) => {
    setSelectedPosters((prev) => prev.map((p) => (p === title ? "" : p)));
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
    if (!isPosterView) return;

    const fetchVisiblePosters = async () => {
      const toFetch = visibleMovies.filter(
        (title) => !posterMap[title] && !fetchCache.current[title]
      );
      await Promise.allSettled(toFetch.map((title) => fetchPoster(title)));
    };

    fetchVisiblePosters();
  }, [visibleMovies, isPosterView]);

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

  useEffect(() => {
    const fetchInitialWatchlist = async () => {
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

    fetchInitialWatchlist();
  }, []);

  const renderPoster = (title, idx) => {
    const poster = posterMap[title];
    const error = posterErrors[title];

    if (error) {
      return (
        <div className="relative w-full aspect-[2/3] bg-gray-200 rounded-lg shadow-inner flex flex-col items-center justify-center p-2 text-center">
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
        <div className="w-full aspect-[2/3] bg-gray-200 rounded-lg shadow-inner flex items-center justify-center text-gray-500 animate-pulse">
          Loading...
        </div>
      );
    }

    return (
      <div className="relative" key={idx}>
        <img
          src={poster}
          alt={title}
          onClick={() => setSelectedMovie({ title })}
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
              : handleAddPoster(title);
          }}
          disabled={
            !selectedPosters.includes(title) && !selectedPosters.includes("")
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

      <div className="w-full max-w-5xl mt-28 px-4 py-10 bg-[#202830] text-white rounded shadow">
        <h1 className="text-xl font-bold uppercase text-center">
          Movie Night Selections
        </h1>
        <SelectedMovies
          selectedPosters={selectedPosters}
          posterMap={posterMap}
          setSelectedMovie={setSelectedMovie}
          handleRemovePoster={handleRemovePoster}
          setSelectedPosters={setSelectedPosters}
        />
      </div>

      <div className="w-full max-w-5xl mt-8 mb-8 px-4 py-10 bg-[#202830] text-white rounded shadow">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-4">
            Letterboxd Watchlist Viewer
          </h2>
          <Search
            username={username}
            setUsername={setUsername}
            fetchWatchlist={fetchWatchlist}
            refreshWatchlist={refreshWatchlist}
            isPosterView={isPosterView}
            toggleView={() => setIsPosterView(!isPosterView)}
          />
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

        {!isPosterView && !isLoading && (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#14181c] text-white text-left">
                <th className="p-3">Title</th>
                <th className="p-3">Info</th>
                <th className="p-3">Add</th>
              </tr>
            </thead>
            <tbody>
              {visibleMovies.map((title, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-100">
                  <td className="p-3">{title}</td>
                  <td className="p-3">
                    <button
                      onClick={() => setSelectedMovie({ title })}
                      className="bg-green-500 text-white px-3 py-1 rounded"
                    >
                      Info
                    </button>
                  </td>
                  <td className="p-3">
                    <button
                      className="bg-purple-500 text-white px-3 py-1 rounded disabled:opacity-50"
                      disabled={
                        selectedPosters.includes(title) ||
                        !selectedPosters.includes("")
                      }
                      onClick={() => handleAddPoster(title)}
                    >
                      {selectedPosters.includes(title) ? "Added" : "Add"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {isPosterView && !isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 mt-6">
            {visibleMovies.map((title, idx) => renderPoster(title, idx))}
          </div>
        )}

        {!isLoading && isAppending && <LoadingDots />}
        <div ref={loadMoreRef} className="h-10 mt-10" />
      </div>

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onAdd={handleAddPoster}
          onRemove={handleRemovePoster}
          isSelected={selectedPosters.includes(selectedMovie.title)}
          canAdd={selectedPosters.includes("")}
        />
      )}
    </div>
  );
};

export default Watchlist;
