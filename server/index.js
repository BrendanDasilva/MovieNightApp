import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import tmdbRoute from "./tmdb.js";
import authRoutes from "./routes/auth.js";
import watchlistRoutes from "./routes/watchlist.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection (keep this in case you add saving later)
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/auth", authRoutes);
app.use("/tmdb", tmdbRoute);
app.use("/watchlist", watchlistRoutes);

// Start server
app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
