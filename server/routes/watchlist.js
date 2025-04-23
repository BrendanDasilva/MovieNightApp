import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:username", authMiddleware, async (req, res) => {
  const { username } = req.params;
  const baseUrl = `https://letterboxd.com/${username}/watchlist/by/release/`;

  let page = 1;
  let hasNextPage = true;
  const movies = [];

  try {
    while (hasNextPage) {
      const url = `${baseUrl}/page/${page}/`;
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      const posters = $("div[data-film-slug]"); // match the updated poster structure
      if (!posters.length) {
        hasNextPage = false;
        break;
      }

      posters.each((_, el) => {
        const title = $(el).find("img").attr("alt")?.trim();
        const slug = $(el).attr("data-film-slug");
        const link = slug ? `https://letterboxd.com/film/${slug}/` : null;

        if (title && link) {
          movies.push({ title, link });
        }
      });

      page++;
    }

    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: "Scrape failed" });
  }
});

export default router;
