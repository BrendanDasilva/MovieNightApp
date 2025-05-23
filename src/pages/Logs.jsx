import React, { useEffect, useState } from "react";
import axios from "axios";
import LoadingDots from "../components/LoadingDots";
import PageWrapper from "../components/PageWrapper";

// Logs page: displays history of previously submitted movie selections
const Logs = ({ isDrawerOpen }) => {
  const [logs, setLogs] = useState([]); // array of selection history entries
  const [loading, setLoading] = useState(true); // loading state while fetching logs
  const [error, setError] = useState(null); // error state for failed API request

  // Fetch logs from backend on component mount
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get("/api/logs", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setLogs(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Show loading spinner while fetching logs
  if (loading) {
    return (
      <PageWrapper isDrawerOpen={isDrawerOpen}>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingDots />
        </div>
      </PageWrapper>
    );
  }

  // Show error message if fetching logs fails
  if (error) {
    return (
      <PageWrapper isDrawerOpen={isDrawerOpen}>
        <div className="p-8 text-red-500 text-center">
          Error loading logs: {error}
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper isDrawerOpen={isDrawerOpen}>
      {/* Page title */}
      <h1 className="text-2xl font-bold mb-8 p-4 text-white text-center bg-[#202830] rounded shadow">
        Movie Selection History
      </h1>

      {/* Fallback if user has no log history */}
      {logs.length === 0 ? (
        <div className="text-gray-500 text-center">
          No selection history found
        </div>
      ) : (
        logs.map((log, idx) => (
          <div
            key={idx}
            className="mb-8 p-4 bg-[#202830] text-white rounded shadow"
          >
            {/* Human-readable log date */}
            <h3 className="text-lg font-semibold mb-4">
              {new Date(log.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h3>

            {/* Grid of posters within each log */}
            <div className="grid grid-cols-3 gap-4">
              {log.movies.map((movie, i) => (
                <div
                  key={i}
                  className={`relative h-64 rounded-lg overflow-hidden ${
                    !movie.isSelected ? "grayscale" : ""
                  }`}
                >
                  {/* Poster image or fallback */}
                  {movie.poster ? (
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      {movie.title || "No poster available"}
                    </div>
                  )}

                  {/* Footer with movie title and selected checkmark */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                    <div className="flex justify-between items-center">
                      <span className="truncate">{movie.title}</span>
                      {movie.isSelected && (
                        <span className="ml-2 text-green-400">✓</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </PageWrapper>
  );
};

export default Logs;
