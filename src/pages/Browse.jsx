import React, { useState, useEffect } from "react";
import axios from "axios";
import SearchBox from "../components/SearchBox";
import LoadingDots from "../components/LoadingDots";
import Footer from "../components/Footer";

const Browse = ({
  selectedPosters,
  posterMap,
  handleAddPoster,
  handleRemovePoster,
  setSelectedMovie,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch movies based on search query
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

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow px-8 mt-20">
        <div className="max-w-6xl mx-auto">
          {/* Search Box */}
          <div className="w-full max-w-5xl mx-auto px-4 py-10 bg-[#202830] text-white rounded shadow mt-8 mb-12">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold mt-4">Browse Movies</h1>
              <div className="max-w-3xl text-black mx-auto">
                <SearchBox
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              </div>
              {loading && <LoadingDots />}
            </div>
          </div>

          {/* Results Grid */}
          {results.length > 0 && (
            <div className="mt-8 bg-[#202830] rounded-lg shadow">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
                {results.map((movie) => (
                  <div
                    key={movie.id}
                    onClick={() =>
                      setSelectedMovie({
                        title: movie.title,
                        poster: movie.poster_path
                          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                          : null,
                      })
                    }
                    className="group relative aspect-[2/3] rounded overflow-hidden shadow-inner cursor-pointer
                     transform transition-transform duration-200 hover:scale-105"
                  >
                    <img
                      src={
                        movie.poster_path
                          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                          : "/placeholder-poster.jpg"
                      }
                      alt={movie.title}
                      className="w-full h-full object-cover rounded"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                      <h3 className="text-white font-medium text-sm truncate px-2">
                        {movie.title}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Browse;
