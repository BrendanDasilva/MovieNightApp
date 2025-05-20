import express from "express";
import axios from "axios";
const router = express.Router();

// GET /api/news — fetch latest movie-related news articles
router.get("/", async (req, res) => {
  try {
    const response = await axios.get(
      `https://newsapi.org/v2/everything?q=movie&language=en&sortBy=publishedAt&apiKey=${process.env.NEWS_API_KEY}`
    );

    // Filter and format top 5 movie-related articles
    const articles = response.data.articles
      .filter((article) => article.title.toLowerCase().includes("movie"))
      .slice(0, 5)
      .map((article) => ({
        title: article.title,
        excerpt: article.description,
        date: new Date(article.publishedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        url: article.url,
        source: article.source.name,
      }));

    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

export default router;
