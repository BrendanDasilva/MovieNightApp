import React, { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import NavBar from "../components/NavBar";
import LoadingDots from "../components/LoadingDots";
import SearchBox from "../components/SearchBox";
import MoviePoster from "../components/MoviePoster";
import WatchlistFilters from "../components/WatchlistFilters";

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
  const [selectedDecade, setSelectedDecade] = useState("All");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState("yearDesc");
  const [genres, setGenres] = useState([]);

  const fetchCache = useRef({});
  const loadMoreRef = useRef(null);

  // Fetch genres from TMDB to match genre spotlight list
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

  // Filter and sort logic
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
        default:
          return 0;
      }
    });

    return filtered;
  }, [allMovies, searchQuery, selectedDecade, selectedGenre, sortBy]);

  // Load user's saved watchlist
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

  // Load more posters on scroll
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

  // Get posters by title
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

  // Initial load of watchlist
  useEffect(() => {
    fetchWatchlist();
  }, []);

  // Fetch missing posters for visible movies
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

  // Fetch missing posters for selected movies
  useEffect(() => {
    const fetchSelectedPosters = async () => {
      const toFetch = selectedPosters.filter(
        (title) => title && !posterMap[title] && !fetchCache.current[title]
      );
      await Promise.allSettled(toFetch.map((title) => fetchPoster(title)));
    };
    fetchSelectedPosters();
  }, [selectedPosters]);

  // Trigger loadMore when scrolled to bottom
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && visibleMovies.length < filteredMovies.length)
        loadMore();
    });
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [visibleMovies, filteredMovies]);

  // Reset visible chunk when filters/search change
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

        {/* Filters Section */}
        <WatchlistFilters
          selectedGenre={selectedGenre}
          setSelectedGenre={setSelectedGenre}
          selectedDecade={selectedDecade}
          setSelectedDecade={setSelectedDecade}
          sortBy={sortBy}
          setSortBy={setSortBy}
          genres={genres}
        />

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
