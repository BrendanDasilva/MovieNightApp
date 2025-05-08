import React, { useEffect, useState } from "react";
import axios from "axios";
import LoadingDots from "../components/LoadingDots";

const Home = () => {
  const [latestLog, setLatestLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestSelection = async () => {
      try {
        const res = await axios.get("/api/logs/latest", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setLatestLog(res.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestSelection();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="w-full max-w-5xl mt-28 mb-8 px-4 py-10 bg-[#202830] text-white rounded shadow">
        <h2 className="text-3xl font-bold mb-4 text-center">Welcome back,</h2>
        <p className="text-center text-white text-lg mb-8">
          Here’s what you chose between last time…
        </p>

        {loading ? (
          <div className="flex justify-center">
            <LoadingDots />
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : latestLog?.movies ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {latestLog.movies.map((movie, i) => (
              <div
                key={i}
                className={`w-full aspect-[2/3] rounded-lg shadow-inner overflow-hidden relative ${
                  !movie.isSelected ? "grayscale" : ""
                }`}
              >
                {movie.poster ? (
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                    {movie.title || `Poster ${i + 1}`}
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
                  {movie.title}
                  {movie.isSelected && (
                    <span className="ml-2 text-green-400">✓ Selected</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-full aspect-[2/3] bg-gray-200 rounded-lg shadow-inner flex items-center justify-center text-gray-500 text-lg"
              >
                Poster {i} (placeholder)
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
