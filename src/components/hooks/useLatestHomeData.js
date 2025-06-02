import { useEffect, useState } from "react";
import axios from "axios";

const useLatestHomeData = () => {
  const [latestLog, setLatestLog] = useState(null);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState({
    history: true,
    trending: true,
    genres: true,
    news: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logRes, trendingRes, genresRes, newsRes] = await Promise.all([
          axios.get("/api/logs/latest", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          axios.get("/api/tmdb/trending"),
          axios.get("/api/tmdb/genres"),
          axios.get("/api/news"),
        ]);
        setLatestLog(logRes.data);
        setTrendingMovies(trendingRes.data);
        setGenres(genresRes.data);
        setNews(newsRes.data);
      } catch (err) {
        setErrors((prev) => ({ ...prev, general: err.message }));
      } finally {
        setLoading({
          history: false,
          trending: false,
          genres: false,
          news: false,
        });
      }
    };
    fetchData();
  }, []);

  return { latestLog, trendingMovies, genres, news, loading, errors };
};

export default useLatestHomeData;
