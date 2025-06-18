import { useLocation } from "react-router-dom";

const useBrowseParams = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search || "");

  return {
    query: params.get("query") || "__tmdb_popular__",
    genre: params.get("genre") || null,
    decade: params.get("decade") || null,
  };
};

export default useBrowseParams;
