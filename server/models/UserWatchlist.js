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
      year: {
        type: String,
        required: false,
      },
    },
  ],
});

export default mongoose.model("UserWatchlist", UserWatchlistSchema);
