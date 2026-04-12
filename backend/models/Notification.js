import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
