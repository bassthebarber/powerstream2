// backend/config/mongo.js
// PowerStream MongoDB Connection Module
// ESM format with retry logic and auto-reconnect

import mongoose from "mongoose";

let isConnecting = false;

const connectDB = async () => {
  // Prevent multiple simultaneous connection attempts
  if (isConnecting) {
    console.log("⏳ MongoDB connection already in progress...");
    return;
  }

  // Check if already connected
  if (mongoose.connection.readyState === 1) {
    console.log("🟢 MongoDB already connected");
    return;
  }

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  
  if (!uri) {
    console.error("❌ ERROR: MONGO_URI is missing from .env");
    console.error("   Add: MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname");
    return;
  }

  isConnecting = true;
  let retries = 5;

  // Mongoose settings
  mongoose.set("strictQuery", true);

  while (retries) {
    try {
      console.log(`⏳ Connecting to MongoDB... (attempt ${6 - retries}/5)`);
      
      await mongoose.connect(uri, {
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4, // Use IPv4
        retryWrites: true,
        w: "majority",
      });

      console.log("✅ MongoDB Connected Successfully!");
      console.log(`   Host: ${mongoose.connection.host}`);
      console.log(`   Database: ${mongoose.connection.name}`);
      
      isConnecting = false;
      return mongoose.connection;

    } catch (err) {
      retries -= 1;
      console.error(`❌ MongoDB connection failed. Retries left: ${retries}`);
      console.error(`   Error: ${err.message}`);
      
      if (err.code) {
        console.error(`   Code: ${err.code}`);
      }

      if (retries === 0) {
        console.error("❌ All retries exhausted. Server will run without DB.");
        isConnecting = false;
        return null;
      }

      console.log("🔄 Retrying in 3 seconds...");
      await new Promise((res) => setTimeout(res, 3000));
    }
  }

  isConnecting = false;
};

// Connection event handlers
mongoose.connection.on("connected", () => {
  console.log("🟢 MongoDB connected");
});

mongoose.connection.on("error", (err) => {
  console.error("🔴 MongoDB error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected. Attempting to reconnect...");
  // Auto-reconnect after disconnect
  setTimeout(() => {
    if (mongoose.connection.readyState !== 1) {
      connectDB();
    }
  }, 5000);
});

mongoose.connection.on("reconnected", () => {
  console.log("🟡 MongoDB reconnected");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed through app termination");
    process.exit(0);
  } catch (err) {
    process.exit(1);
  }
});

export default connectDB;
