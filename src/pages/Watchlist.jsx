import React, { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import LoadingDots from "../components/LoadingDots";
import SearchBox from "../components/SearchBox";
import MoviePoster from "../components/MoviePoster";
import WatchlistFilters from "../components/WatchlistFilters";
import PageWrapper from "../components/PageWrapper";
import Footer from "../components/Footer";

// Number of movies to load at a time for infinite scroll
const CHUNK_SIZE = 20;

// Watchlist page: shows saved movies, allows filtering/sorting/searching
const Watchlist = ({
  // Movie and UI state
  selectedPosters,
  setSelectedPosters,
  posterMap,
  setPosterMap,
  handleAddPoster,
  handleRemovePoster,
  setSelectedMovie,
  handleAddToWatchlist,
  handleRemoveFromWatchlist,
  isDrawerOpen,
}) => {
  const [allMovies, setAllMovies] = useState([]); // full watchlist
  const [visibleMovies, setVisibleMovies] = useState([]); // chunked view for infinite scroll
  const [isLoading, setIsLoading] = useState(false); // initial fetch state
  const [isAppending, setIsAppending] = useState(false); // loading additional chunks
  const [posterErrors, setPosterErrors] = useState({}); // poster load errors
  const [searchQuery, setSearchQuery] = useState(""); // search input
  const [selectedDecade, setSelectedDecade] = useState("All"); // decade filter
  const [selectedGenre, setSelectedGenre] = useState("All"); // genre filter
  const [sortBy, setSortBy] = useState("createdDesc"); // sorting criteria
  const [genres, setGenres] = useState([]); // available genres

  const fetchCache = useRef({}); // avoids duplicate poster fetches
  const loadMoreRef = useRef(null); // trigger element for infinite scroll

  // Fetch available genres on mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await axios.get("/api/tmdb/genres");
        const genreNames = res.data.map((g) => g.name);
        setGenres(genreNames);
      } catch (err) {
        console.error("Failed to fetch genres", err);
      }
    };
    fetchGenres();
  }, []);

  // Derived movie list based on search, filter, and sort criteria
  const filteredMovies = useMemo(() => {
    let filtered = allMovies.filter((movie) => {
      const titleMatch = movie.title
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

      const genreMatch =
        selectedGenre === "All" || (movie.genre || "").includes(selectedGenre);

      const year = parseInt(movie.release_date?.slice(0, 4), 10);
      let decadeMatch = true;
      if (selectedDecade !== "All") {
        if (selectedDecade === "Earlier") {
          decadeMatch = year < 1950;
        } else {
          const decade = parseInt(selectedDecade.slice(0, 4), 10);
          decadeMatch = year >= decade && year < decade + 10;
        }
      }

      return titleMatch && genreMatch && decadeMatch;
    });

    // Sorting logic
    filtered.sort((a, b) => {
      const runtimeA = parseInt(a.runtime, 10) || 0;
      const runtimeB = parseInt(b.runtime, 10) || 0;
      const dateA = new Date(a.release_date);
      const dateB = new Date(b.release_date);

      switch (sortBy) {
        case "createdAsc":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "createdDesc":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "yearAsc":
          return dateA - dateB;
        case "yearDesc":
          return dateB - dateA;
        case "title":
          return a.title.localeCompare(b.title);
        case "runtimeAsc":
          return runtimeA - runtimeB;
        case "runtimeDesc":
          return runtimeB - runtimeA;
        case "ratingAsc":
          return (a.rating || 0) - (b.rating || 0);
        case "ratingDesc":
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [allMovies, searchQuery, selectedDecade, selectedGenre, sortBy]);

  // Initial fetch of user's watchlist from backend
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

  // Load additional posters when scrolled to bottom
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

  // Fetch poster from TMDB if not already cached
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

  // Trigger initial fetch
  useEffect(() => {
    fetchWatchlist();
  }, []);

  // Fetch posters for currently visible movies
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

  // Ensure selected posters are fetched
  useEffect(() => {
    const fetchSelectedPosters = async () => {
      const toFetch = selectedPosters.filter(
        (title) => title && !posterMap[title] && !fetchCache.current[title]
      );
      await Promise.allSettled(toFetch.map((title) => fetchPoster(title)));
    };
    fetchSelectedPosters();
  }, [selectedPosters]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && visibleMovies.length < filteredMovies.length)
        loadMore();
    });
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [visibleMovies, filteredMovies]);

  // Reset chunked list when filters change
  useEffect(() => {
    setVisibleMovies(filteredMovies.slice(0, CHUNK_SIZE));
  }, [filteredMovies]);

  return (
    <div className="min-h-screen flex flex-col">
      <PageWrapper isDrawerOpen={isDrawerOpen}>
        {/* Outer content container */}
        <div className="w-full mx-auto mb-10 bg-[#202830] text-white rounded shadow">
          {/* Page heading and search input */}
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-4">Your Watchlist</h2>
            <SearchBox
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>

          {/* Filter and sort controls */}
          <WatchlistFilters
            selectedGenre={selectedGenre}
            setSelectedGenre={setSelectedGenre}
            selectedDecade={selectedDecade}
            setSelectedDecade={setSelectedDecade}
            sortBy={sortBy}
            setSortBy={setSortBy}
            genres={genres}
          />

          {/* Results summary */}
          {filteredMovies.length > 0 && (
            <h3 className=" text-lg font-medium text-center">
              {filteredMovies.length} movies found
            </h3>
          )}

          {/* Loading state */}
          {isLoading && <LoadingDots />}

          {/* Poster grid */}
          {!isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-10 mb-10">
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

          {/* Appending spinner */}
          {!isLoading && isAppending && <LoadingDots />}
          <div ref={loadMoreRef} className="h-10 mt-10" />
        </div>
      </PageWrapper>
      <Footer />
    </div>
  );
};

export default Watchlist;
