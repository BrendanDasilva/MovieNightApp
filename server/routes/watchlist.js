import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import authMiddleware from "../middleware/authMiddleware.js";
import UserWatchlist from "../models/UserWatchlist.js";

const router = express.Router();

// GET /watchlist/me — fetch from DB if exists
router.get("/me", authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const record = await UserWatchlist.findOne({ userId });
    if (record && record.movies.length > 0) {
      return res.json(record.movies);
    } else {
      return res.json([]); // Empty list fallback
    }
  } catch (err) {
    console.error("❌ Failed to fetch saved watchlist:", err.message);
    res.status(500).json({ error: "Failed to fetch watchlist from database" });
  }
});

// GET /watchlist/:username — scrape and save
router.get("/:username", authMiddleware, async (req, res) => {
  const { username } = req.params;
  const userId = req.user.id;
  const baseUrl = `https://letterboxd.com/${username}/watchlist/by/release/`;

  let page = 1;
  let hasNextPage = true;
  const titles = [];

  try {
    while (hasNextPage) {
      const url = `${baseUrl}/page/${page}/`;
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      const posters = $(".poster-container");
      if (posters.length === 0) {
        hasNextPage = false;
        break;
      }

      posters.each((_, el) => {
        const title = $(el).find("img").attr("alt")?.trim();
        if (title) {
          titles.push(title);
        }
      });

      page++;
    }

    await UserWatchlist.findOneAndUpdate(
      { userId },
      { movies: titles },
      { upsert: true }
    );

    console.log("✅ Scraped & saved titles:", titles.slice(0, 5));
    res.json(titles);
  } catch (err) {
    console.error("❌ Scrape failed:", err.message);
    res.status(500).json({ error: "Failed to scrape watchlist" });
  }
});

export default router;
