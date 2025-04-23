import { useState, useEffect, useRef } from "react";
import axios from "axios";
import MovieModal from "./components/MovieModal";

const CHUNK_SIZE = 20;

const MainApp = ({ onLogout }) => {
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

  const fetchWatchlist = async () => {
    setIsLoading(true);
    setAllMovies([]);
    setVisibleMovies([]);
    setPosterMap({});
    setCount(0);

    try {
      const res = await axios.get(
        `http://localhost:3001/watchlist/${username}`
      );
      setAllMovies(res.data);
      setVisibleMovies(res.data.slice(0, CHUNK_SIZE));
      setCount(res.data.length);
    } catch (err) {
      console.error("Failed to fetch watchlist");
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
      const toFetch = visibleMovies.filter((m) => !posterMap[m.title]);

      for (const movie of toFetch) {
        try {
          const res = await axios.get(
            `http://localhost:3001/tmdb?title=${encodeURIComponent(
              movie.title
            )}${movie.year ? `&year=${movie.year}` : ""}`
          );
          const { poster } = res.data;

          setPosterMap((prev) => ({
            ...prev,
            [movie.title]: poster || null,
          }));
        } catch {
          setPosterMap((prev) => ({
            ...prev,
            [movie.title]: null,
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

  const LoadingDots = () => (
    <div className="flex justify-center my-6">
      <div className="flex flex-row gap-2">
        <div className="w-4 h-4 rounded-full bg-red-500 animate-bounce"></div>
        <div className="w-4 h-4 rounded-full bg-red-500 animate-bounce [animation-delay:-.3s]"></div>
        <div className="w-4 h-4 rounded-full bg-red-500 animate-bounce [animation-delay:-.5s]"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <nav className="w-full bg-blue-700 text-white py-4 shadow-md fixed top-0 left-0 z-10">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">🎬 Movie Night App</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-75">
              Powered by Letterboxd + TMDB
            </span>
            <button className="text-sm underline hover:text-white">
              Account
            </button>
            <button
              onClick={onLogout}
              className="text-sm underline hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="w-full max-w-5xl mt-20 px-4 py-10 bg-white rounded shadow">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-4">
            Letterboxd Watchlist Viewer
          </h2>

          <div className="flex justify-center gap-4">
            <input
              className="border border-gray-300 px-4 py-2 rounded w-64"
              placeholder="Enter Letterboxd username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button
              onClick={fetchWatchlist}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Fetch
            </button>
            <button
              onClick={() => setIsPosterView(!isPosterView)}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Toggle View
            </button>
          </div>

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
              {visibleMovies.map((movie, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-100">
                  <td className="p-3">
                    <a
                      href={movie.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {movie.title}
                    </a>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => setSelectedMovie(movie)}
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
            {visibleMovies.map((movie, idx) => {
              const poster = posterMap[movie.title];
              if (!poster) return null;

              return (
                <img
                  key={idx}
                  src={poster}
                  alt={movie.title}
                  onClick={() => setSelectedMovie(movie)}
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

export default MainApp;
