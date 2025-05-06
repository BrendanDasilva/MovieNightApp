import mongoose from "mongoose";

const movieLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  movies: [
    {
      title: String,
      poster: String,
      isSelected: Boolean,
    },
  ],
});

// Proper ES Modules export
const MovieLog = mongoose.model("MovieLog", movieLogSchema);
export default MovieLog;
