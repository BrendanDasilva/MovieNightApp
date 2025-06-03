import { useState, useEffect } from "react";

const useGenres = () => {
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch("/api/tmdb/genres");
        const data = await res.json();
        setGenres(data.map((g) => g.name));
      } catch (err) {
        console.error("Failed to fetch genres", err);
      }
    };
    fetchGenres();
  }, []);

  return genres;
};

export default useGenres;
