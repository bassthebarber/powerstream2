// backend/recordingStudio/config/db.js
import mongoose from "mongoose";

// Build MongoDB URI with proper encoding
const buildMongoUri = () => {
  // Priority: MONGO_URI > STUDIO_MONGO_URI > build from components
  if (process.env.MONGO_URI) return process.env.MONGO_URI;
  if (process.env.STUDIO_MONGO_URI) return process.env.STUDIO_MONGO_URI;

  const username = process.env.MONGO_USER;
  const password = process.env.MONGO_PASS;
  const host = process.env.MONGO_HOST || "cluster0.ldmtan.mongodb.net";
  const db = process.env.STUDIO_MONGO_DB || process.env.MONGO_DB || "powerstream";
  const appName = process.env.MONGO_APP || "Cluster0";

  if (!username || !password) return null;

  // URL-encode username and password to handle special characters
  const encUser = encodeURIComponent(username);
  const encPass = encodeURIComponent(password);

  return `mongodb+srv://${encUser}:${encPass}@${host}/${db}?retryWrites=true&w=majority&appName=${encodeURIComponent(appName)}`;
};

// Retry configuration
const MAX_RETRIES = 10;
const RETRY_INTERVAL = 5000; // 5 seconds

let retryCount = 0;

export const connectDB = async () => {
  const uri = buildMongoUri();

  if (!uri) {
    throw new Error("MONGO_URI is missing. Set MONGO_URI, STUDIO_MONGO_URI, or MONGO_USER/MONGO_PASS");
  }

  mongoose.set("strictQuery", true);

  try {
    console.log("🟡 MongoDB: Connecting (Studio)...");
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log("🗄️  MongoDB connected (Studio)");
    retryCount = 0; // Reset retry count on successful connection
  } catch (err) {
    retryCount++;
    console.error(`❌ MongoDB connection failed (attempt ${retryCount}/${MAX_RETRIES}):`, err.message);

    if (retryCount < MAX_RETRIES) {
      console.log(`🔄 Retrying in ${RETRY_INTERVAL / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
      return connectDB(); // Recursive retry
    } else {
      throw new Error("Max MongoDB connection retries reached");
    }
  }
};

// Handle disconnection - auto reconnect
mongoose.connection.on("disconnected", () => {
  console.log("🔄 MongoDB disconnected. Attempting reconnection...");
  retryCount = 0; // Reset for reconnection attempts
  connectDB().catch((err) => {
    console.error("❌ Reconnection failed:", err.message);
  });
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err.message);
});

mongoose.connection.on("connected", () => {
  console.log("🟢 MongoDB connection established (Studio)");
});

mongoose.connection.on("reconnected", () => {
  console.log("🟢 MongoDB reconnected (Studio)");
});

export default connectDB;
