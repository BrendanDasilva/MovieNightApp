import mongoose from "mongoose";

// Schema for storing a user's movie selection log
const movieLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    movies: [
      {
        title: {
          type: String,
          required: [true, "Movie title is required"],
          trim: true,
        },
        poster: {
          type: String,
          required: [true, "Poster URL is required"],
          validate: {
            validator: (value) => value.startsWith("http"),
            message: "Invalid poster URL format",
          },
        },
        isSelected: {
          type: Boolean,
          required: [true, "Selection status is required"],
          default: false,
        },
      },
    ],
  },
  {
    // Automatically track creation time as "date"
    timestamps: {
      createdAt: "date",
      updatedAt: false,
    },
  }
);

// Index for quick retrieval of the latest log entry
movieLogSchema.index({ date: -1 });

const MovieLog = mongoose.model("MovieLog", movieLogSchema);
export default MovieLog;
