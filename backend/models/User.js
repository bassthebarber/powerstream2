// backend/models/User.js
// @deprecated for profile fields — source of truth: Supabase `profiles` (see docs/MIGRATION_SUPABASE_PRIMARY.md).
// Kept for auth/password until migrated.
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  avatar: String,
  bio: String,
  role: { type: String, enum: ["user", "creator", "admin", "moderator"], default: "user" },
  isAdmin: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  coinBalance: { type: Number, default: 0 },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  lastActive: Date,
  settings: {
    notifications: { type: Boolean, default: true },
    privacy: { type: String, default: "public" },
  },
}, { timestamps: true });

// Hash password before save
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);










