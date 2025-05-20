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
    console.error("❌ Failed to fetch watchlist:", err.message);
    res.status(500).json({ error: "Failed to fetch watchlist from database" });
  }
});

// POST /watchlist/add — add one movie to watchlist
router.post("/add", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const movie = req.body;

  if (!movie?.title) {
    return res.status(400).json({ error: "Missing movie title" });
  }

  try {
    // Add movie if not already present (no duplicates due to $addToSet)
    const record = await UserWatchlist.findOneAndUpdate(
      { userId },
      { $addToSet: { movies: movie } },
      { upsert: true, new: true }
    );

    res.json(record.movies);
  } catch (err) {
    console.error("❌ Failed to add movie:", err.message);
    res.status(500).json({ error: "Failed to add movie to watchlist" });
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
    console.error("❌ Failed to remove movie:", err.message);
    res.status(500).json({ error: "Failed to remove movie from watchlist" });
  }
});

export default router;
