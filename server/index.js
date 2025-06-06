import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import tmdbRoute from "./tmdb.js";
import authRoutes from "./routes/auth.js";
import watchlistRoutes from "./routes/watchlist.js";
import { router as logsRouter } from "./routes/logs.js";
import newsRouter from "./routes/news.js";

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === "production";

// ================= Environment Configuration =================
const allowedOrigins = [
  process.env.CLIENT_URL_DEV, // http://localhost:5173
  process.env.CLIENT_URL_PROD, // https://domain.com (future)
].filter(Boolean);

// ================= Security Middleware =================
app.use(
  cors({
    origin: isProduction ? process.env.CLIENT_URL_PROD : allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", ...allowedOrigins, "https://*.tmdb.org"],
        imgSrc: ["'self'", "data:", "https://image.tmdb.org"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ================= Rate Limiting =================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: "Too many login attempts, please try again later",
  skip: (req) => req.method === "OPTIONS",
});

const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000,
});

// ================= Database Connection =================
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ================= Application Middleware =================
app.use(express.json());

// ================= Routes =================
app.use("/auth", authLimiter, authRoutes);
app.use("/tmdb", apiLimiter, tmdbRoute); // TMDB API proxy
app.use("/api/tmdb", apiLimiter, tmdbRoute); // tending movies
app.use("/api/news", apiLimiter, newsRouter); // latest news
app.use("/watchlist", apiLimiter, watchlistRoutes);
app.use("/api/logs", apiLimiter, logsRouter);

// ================= Error Handling =================
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ================= Server Start =================
app.listen(3001, () => {
  console.log(
    `Server running in ${isProduction ? "production" : "development"} mode`
  );
  console.log(`   Listening on http://localhost:3001`);
});
