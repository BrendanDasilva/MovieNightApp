import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import UserWatchlist from "../models/UserWatchlist.js";

const router = express.Router();

// GET /watchlist/me — fetch from DB
router.get("/me", authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const record = await UserWatchlist.findOne({ userId });
    res.json(record?.movies || []);
  } catch (err) {
    console.error("Failed to fetch watchlist:", err.message);
    res.status(500).json({ error: "Failed to fetch watchlist from database" });
  }
});

// POST /watchlist/add — add one movie to watchlist
router.post("/add", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Missing movie title" });
  }
  try {
    // Fetch full movie info from TMDB
    const tmdbRes = await fetch(
      `http://localhost:3001/tmdb?title=${encodeURIComponent(title)}`
    );

    const data = await tmdbRes.json();
    if (
      !data ||
      !data.title ||
      !data.release_date ||
      !data.id ||
      !data.poster_path
    ) {
      return res
        .status(400)
        .json({ error: "TMDB data incomplete or not found" });
    }

    const enrichedMovie = {
      id: data.id,
      title: data.title,
      release_date: data.release_date,
      genre: data.genre,
      runtime: data.runtime,
      rating: data.rating,
      poster_path: data.poster_path,
    };

    // Save movie if not already in watchlist
    const record = await UserWatchlist.findOneAndUpdate(
      { userId },
      { $addToSet: { movies: enrichedMovie } },
      { upsert: true, new: true }
    );

    res.json(record.movies);
  } catch (err) {
    console.error("Failed to enrich and add movie:", err.message);
    res.status(500).json({ error: "Failed to enrich or add movie" });
  }
});

// DELETE /watchlist/remove — remove one movie from watchlist by title
router.delete("/remove", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Missing movie title" });
  }

  try {
    // Remove the movie with a matching title from the user's watchlist
    const record = await UserWatchlist.findOneAndUpdate(
      { userId },
      { $pull: { movies: { title } } },
      { new: true }
    );
    res.json(record.movies);
  } catch (err) {
    console.error("Failed to remove movie:", err.message);
    res.status(500).json({ error: "Failed to remove movie from watchlist" });
  }
});

export default router;
