import { useEffect, useState } from "react";
import axios from "axios";

const useGenreMovies = (selectedGenre) => {
  const [genreMovies, setGenreMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGenreMovies = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/tmdb/genre/${selectedGenre.id}`);
        setGenreMovies(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (selectedGenre?.id) fetchGenreMovies();
  }, [selectedGenre]);

  return { genreMovies, loading, error };
};

export default useGenreMovies;
