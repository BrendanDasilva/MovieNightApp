import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const tmdbKey = process.env.TMDB_API_KEY;

router.get("/", async (req, res) => {
  const title = req.query.title;
  const year = req.query.year;

  if (!title) return res.status(400).json({ error: "Title is required" });

  try {
    let searchUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
      title
    )}&api_key=${tmdbKey}`;
    if (year) searchUrl += `&year=${year}`;

    const searchResponse = await axios.get(searchUrl);
    const results = searchResponse.data.results;

    if (!results || results.length === 0) {
      return res.status(404).json({ error: "Movie not found on TMDB" });
    }

    // if year provided, trust results[0]
    let matched = results[0];

    // fallback: try to match exact title + year
    if (year) {
      const exact = results.find(
        (r) =>
          r.release_date?.startsWith(year) &&
          r.title.toLowerCase() === title.toLowerCase()
      );
      if (exact) matched = exact;
    }

    const movieId = matched.id;

    const movieUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${tmdbKey}&append_to_response=credits`;
    const movieResponse = await axios.get(movieUrl);
    const data = movieResponse.data;

    res.json({
      title: data.title,
      year: data.release_date?.split("-")[0],
      released: data.release_date,
      poster: data.poster_path
        ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
        : null,
      genre: data.genres.map((g) => g.name).join(", "),
      director:
        data.credits.crew.find((p) => p.job === "Director")?.name || "N/A",
      runtime: `${data.runtime} min`,
      plot: data.overview,
      actors: data.credits.cast
        .slice(0, 6)
        .map((a) => a.name)
        .join(", "),
      language: data.original_language,
      country: data.production_countries.map((c) => c.name).join(", "),
    });
  } catch (err) {
    console.error("TMDB API error:");
    res.status(500).json({ error: "Failed to fetch movie data" });
  }
});

// endpoint for trending movies
router.get("/trending", async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const response = await axios.get(
      `https://api.themoviedb.org/3/trending/movie/week?api_key=${process.env.TMDB_API_KEY}&page=${page}`
    );
    res.json(response.data.results.slice(0, 8)); // Get first 8 trending movies
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
