import mongoose from "mongoose";

const UserWatchlistSchema = new mongoose.Schema({
  // Reference to the user who owns this watchlist
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  // Array of movies added by the user
  movies: [
    {
      id: {
        type: Number,
        required: true,
      },
      title: {
        type: String,
        required: true,
        trim: true,
      },
      release_date: {
        type: String,
        required: true,
      },
      genre: {
        type: String,
        required: true,
      },
      runtime: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      poster_path: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

export default mongoose.model("UserWatchlist", UserWatchlistSchema);
