import express from "express";
import auth from "../middleware/authMiddleware.js";
import MovieLog from "../models/MovieLog.js";

const router = express.Router();

// Save a new movie log (array of 3 movies from a selection round)
router.post("/", auth, async (req, res) => {
  try {
    const log = new MovieLog({
      userId: req.user.id,
      movies: req.body.movies,
    });
    await log.save();
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all movie logs for the authenticated user, sorted by date (latest first)
router.get("/", auth, async (req, res) => {
  try {
    const logs = await MovieLog.find({ userId: req.user.id }).sort({
      date: -1,
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get only the most recent log for the user
router.get("/latest", auth, async (req, res) => {
  try {
    const log = await MovieLog.findOne({ userId: req.user.id })
      .sort({ date: -1 })
      .limit(1);
    res.json(log || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export { router };
