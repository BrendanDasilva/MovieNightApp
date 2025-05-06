import mongoose from "mongoose";

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
    timestamps: {
      createdAt: "date",
      updatedAt: false,
    },
  }
);

// Add index for faster querying by date
movieLogSchema.index({ date: -1 });

const MovieLog = mongoose.model("MovieLog", movieLogSchema);
export default MovieLog;
