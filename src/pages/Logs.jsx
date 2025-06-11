import React from "react";
import LoadingDots from "../components/LoadingDots";
import PageWrapper from "../components/PageWrapper";
import Footer from "../components/Footer";
import useFetchLogs from "../components/hooks/useFetchLogs";

// Logs page: displays history of previously submitted movie selections
const Logs = ({ isDrawerOpen }) => {
  const { logs, loading, error } = useFetchLogs();

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
        <div className="p-10 text-red-500 text-center">
          Error loading logs: {error}
        </div>
      </PageWrapper>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PageWrapper isDrawerOpen={isDrawerOpen}>
        {/* Page title */}
        <h1 className="w-full max-w-[1600px] mb-10 p-10 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] rounded-2xl ring-1 ring-white/5 text-center text-white text-2xl">
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
              className="w-full max-w-[1600px] mb-10 p-10 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] rounded-2xl ring-1 ring-white/5 text-white"
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
      <Footer />
    </div>
  );
};

export default Logs;
