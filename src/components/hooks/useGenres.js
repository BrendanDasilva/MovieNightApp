import { useState, useEffect } from "react";

// Custom hook to fetch TMDB genres as objects with id and name
const useGenres = () => {
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch("/api/tmdb/genres");
        const data = await res.json();
        setGenres(data); // returns [{ id, name }, ...]
      } catch (err) {
        console.error("Failed to fetch genres", err);
      }
    };

    fetchGenres();
  }, []);

  return genres;
};

export default useGenres;
