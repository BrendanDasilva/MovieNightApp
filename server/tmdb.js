import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const tmdbKey = process.env.TMDB_API_KEY;

// GET /tmdb — fetch movie details by title (and optional year)
router.get("/", async (req, res) => {
  const movieIdParam = req.query.id;

  // If `id` is present, fetch directly by TMDB ID
  if (movieIdParam) {
    try {
      const movieUrl = `https://api.themoviedb.org/3/movie/${movieIdParam}?api_key=${tmdbKey}&append_to_response=credits`;
      const movieResponse = await axios.get(movieUrl);
      const data = movieResponse.data;

      return res.json({
        id: data.id,
        title: data.title,
        year: data.release_date?.split("-")[0],
        release_date: data.release_date,
        rating: data.vote_average,
        released: data.release_date
          ? new Date(data.release_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "Release date not available",
        tagline: data.tagline,
        poster: data.poster_path
          ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
          : null,
        poster_path: data.poster_path ?? null,
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
      console.error("TMDB fetch by ID error:", err.message);
      return res
        .status(500)
        .json({ error: "Failed to fetch movie by ID from TMDB" });
    }
  }

  // If no `id`, fallback to search by title/year
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

    let matched = results[0];
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
      id: data.id,
      title: data.title,
      year: data.release_date?.split("-")[0],
      release_date: data.release_date,
      rating: data.vote_average,
      released: data.release_date
        ? new Date(data.release_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "Release date not available",
      tagline: data.tagline,
      poster: data.poster_path
        ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
        : null,
      poster_path: data.poster_path ?? null,
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
    console.error("TMDB API error:", err.message);
    res.status(500).json({ error: "Failed to fetch movie data" });
  }
});

// GET /tmdb/trending — fetch trending movies for the week
router.get("/trending", async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const response = await axios.get(
      `https://api.themoviedb.org/3/trending/movie/week?api_key=${process.env.TMDB_API_KEY}&page=${page}`
    );
    res.json(response.data.results.slice(0, 8));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /tmdb/genre/:genreId — fetch popular movies for a given genre
router.get("/genre/:genreId", async (req, res) => {
  try {
    const { genreId } = req.params;
    const { page = 1 } = req.query;

    const response = await axios.get(
      `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API_KEY}` +
        `&with_genres=${genreId}&sort_by=popularity.desc&page=${page}`
    );

    res.json(response.data.results.slice(0, 8));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /tmdb/search — perform a title search
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;
    const response = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${
        process.env.TMDB_API_KEY
      }&query=${encodeURIComponent(query)}`
    );

    const simplifiedResults = response.data.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      overview: movie.overview,
      vote_average: movie.vote_average,
    }));

    res.json(simplifiedResults);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /tmdb/genres — fetch list of movie genres
router.get("/genres", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/genre/movie/list?api_key=${tmdbKey}`
    );
    res.json(response.data.genres);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
