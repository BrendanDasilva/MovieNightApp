import { useState, useEffect, useRef } from "react";
import axios from "axios";
import MovieModal from "../components/MovieModal";
import NavBar from "../components/NavBar";
import Search from "../components/Search";
import LoadingDots from "../components/LoadingDots";

const CHUNK_SIZE = 20;

const Watchlist = ({ onLogout }) => {
  const [username, setUsername] = useState("");
  const [allMovies, setAllMovies] = useState([]);
  const [visibleMovies, setVisibleMovies] = useState([]);
  const [posterMap, setPosterMap] = useState({});
  const [count, setCount] = useState(0);
  const [isPosterView, setIsPosterView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAppending, setIsAppending] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const loadMoreRef = useRef(null);

  const handleWatchlistResponse = (titles) => {
    setAllMovies(titles);
    setVisibleMovies(titles.slice(0, CHUNK_SIZE));
    setCount(titles.length);
  };

  const resetState = () => {
    setAllMovies([]);
    setVisibleMovies([]);
    setPosterMap({});
    setCount(0);
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
    if (isAppending || visibleMovies.length >= allMovies.length) return;
    setIsAppending(true);
    setTimeout(() => {
      const next = allMovies.slice(
        visibleMovies.length,
        visibleMovies.length + CHUNK_SIZE
      );
      setVisibleMovies((prev) => [...prev, ...next]);
      setIsAppending(false);
    }, 500);
  };

  useEffect(() => {
    const fetchPosters = async () => {
      const toFetch = visibleMovies.filter((title) => !posterMap[title]);

      for (const title of toFetch) {
        try {
          const res = await axios.get(
            `http://localhost:3001/tmdb?title=${encodeURIComponent(title)}`
          );
          const { poster } = res.data;

          setPosterMap((prev) => ({
            ...prev,
            [title]: poster || null,
          }));
        } catch {
          setPosterMap((prev) => ({
            ...prev,
            [title]: null,
          }));
        }
      }
    };

    if (isPosterView && visibleMovies.length > 0) {
      fetchPosters();
    }
  }, [visibleMovies, isPosterView]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && visibleMovies.length < allMovies.length) {
        loadMore();
      }
    });
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [visibleMovies, allMovies]);

  useEffect(() => {
    const fetchInitialWatchlist = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get("http://localhost:3001/watchlist/me");
        handleWatchlistResponse(res.data);
      } catch (err) {
        console.error("Failed to load saved watchlist");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialWatchlist();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <NavBar onLogout={onLogout} />

      <div className="w-full max-w-5xl mt-20 px-4 py-10 bg-white rounded shadow">
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

          {count > 0 && (
            <h3 className="mt-6 text-lg font-medium">{count} movies found</h3>
          )}
        </div>

        {isLoading && <LoadingDots />}

        {!isPosterView && !isLoading && (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
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
                    <button className="bg-purple-500 text-white px-3 py-1 rounded">
                      Add
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {isPosterView && !isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 mt-6">
            {visibleMovies.map((title, idx) => {
              const poster = posterMap[title];
              if (!poster) return null;

              return (
                <img
                  key={idx}
                  src={poster}
                  alt={title}
                  onClick={() => setSelectedMovie({ title })}
                  className="cursor-pointer w-full aspect-[2/3] object-cover rounded shadow-inner bg-gray-200 transition-transform duration-200 hover:scale-105"
                />
              );
            })}
          </div>
        )}

        {!isLoading && isAppending && <LoadingDots />}
        <div ref={loadMoreRef} className="h-10 mt-10" />
      </div>

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
};

export default Watchlist;
