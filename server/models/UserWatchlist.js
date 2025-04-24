import mongoose from "mongoose";

const UserWatchlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  movies: [String],
});

export default mongoose.model("UserWatchlist", UserWatchlistSchema);
