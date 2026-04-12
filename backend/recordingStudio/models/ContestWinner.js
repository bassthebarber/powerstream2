import mongoose from "mongoose";

const contestWinnerSchema = new mongoose.Schema(
  {
    contestName: String,
    winnerName: String,
    prize: String,
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model("ContestWinner", contestWinnerSchema);
