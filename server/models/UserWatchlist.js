import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
  title: String,
  link: String,
});

const userWatchlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  movies: [movieSchema],
});

export default mongoose.model("UserWatchlist", userWatchlistSchema);
