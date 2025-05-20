import mongoose from "mongoose";

const UserWatchlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  movies: [
    {
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
    },
  ],
});

export default mongoose.model("UserWatchlist", UserWatchlistSchema);
