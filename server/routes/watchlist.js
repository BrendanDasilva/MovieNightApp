import express from "express";
import puppeteer from "puppeteer";
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

// GET /watchlist/:username — scrape and save
router.get("/:username", authMiddleware, async (req, res) => {
  const { username } = req.params;
  const userId = req.user.id;
  const baseUrl = `https://letterboxd.com/${username}/watchlist/by/release/`;

  const movies = [];
  let page = 1;
  let hasNextPage = true;

  try {
    const browser = await puppeteer.launch({ headless: "new" });
    const pageInstance = await browser.newPage();

    while (hasNextPage) {
      const url = `${baseUrl}/page/${page}/`;
      await pageInstance.goto(url, { waitUntil: "networkidle2" });

      // Wait for poster-container divs to be visible
      const frameTitles = await pageInstance.$$eval(
        "li.poster-container span.frame-title",
        (nodes) => nodes.map((el) => el.textContent.trim())
      );

      if (frameTitles.length === 0) {
        hasNextPage = false;
        break;
      }

      for (const raw of frameTitles) {
        const match = raw.match(/^(.+?)\s+\((\d{4})\)$/);
        if (match) {
          movies.push({ title: match[1], year: match[2] });
        } else {
          movies.push({ title: raw, year: null });
        }
      }

      page++;
    }

    await browser.close();
    console.log(`✅ Scraped ${movies.length} movies`);

    await UserWatchlist.findOneAndUpdate(
      { userId },
      { movies },
      { upsert: true }
    );

    res.json(movies);
  } catch (err) {
    console.error("❌ Puppeteer scrape failed:", err.message);
    res.status(500).json({ error: "Failed to scrape watchlist" });
  }
});

export default router;
