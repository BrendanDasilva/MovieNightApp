import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import authMiddleware from "../middleware/authMiddleware.js";
import UserWatchlist from "../models/UserWatchlist.js";

const router = express.Router();

router.get("/:username", authMiddleware, async (req, res) => {
  const { username } = req.params;
  const userId = req.user.id;

  try {
    let existing = await UserWatchlist.findOne({ userId });

    // If exists, return from DB
    if (existing) {
      return res.json(existing.movies);
    }

    // Otherwise, scrape from Letterboxd
    const baseUrl = `https://letterboxd.com/${username}/watchlist/by/release/`;
    let page = 1;
    let hasNextPage = true;
    const movies = [];

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
        const title = $(el).find("img").attr("alt");
        const href = $(el).find("a.film-poster").attr("href");
        const link = `https://letterboxd.com${href}`;
        if (title && href) {
          movies.push({ title, link });
        }
      });

      page++;
    }

    // Save to DB
    const watchlist = new UserWatchlist({ userId, movies });
    await watchlist.save();

    res.json(movies);
  } catch (err) {
    console.error("Watchlist error:", err.message);
    res.status(500).json({ error: "Failed to fetch watchlist" });
  }
});

router.get("/:username/refresh", authMiddleware, async (req, res) => {
  const { username } = req.params;
  const userId = req.user.id;

  try {
    const baseUrl = `https://letterboxd.com/${username}/watchlist/by/release/`;
    let page = 1;
    let hasNextPage = true;
    const movies = [];

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
        const img = $(el).find("img");
        const title = img.attr("alt");

        const anchor = $(el).find("a.film-poster").first();
        const href = anchor.attr("href");
        const link = href ? `https://letterboxd.com${href}` : null;

        if (title && link) {
          movies.push({ title, link });
        }
      });

      page++;
    }

    await UserWatchlist.findOneAndUpdate(
      { userId },
      { movies },
      { upsert: true }
    );

    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: "Failed to refresh watchlist" });
  }
});

export default router;
