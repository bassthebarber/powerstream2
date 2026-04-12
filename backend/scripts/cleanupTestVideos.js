// backend/scripts/cleanupTestVideos.js
// Removes ALL test videos from ALL stations
// Run with: node scripts/cleanupTestVideos.js

import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function cleanupTestVideos() {
  console.log("🧹 [Cleanup] Starting video cleanup...");
  
  if (!MONGO_URI) {
    console.error("❌ MONGO_URI not set");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get Station model
    const Station = mongoose.model("Station", new mongoose.Schema({
      slug: String,
      videos: Array,
    }));

    // Find all stations
    const stations = await Station.find({});
    console.log(`📺 Found ${stations.length} stations`);

    let totalRemoved = 0;

    for (const station of stations) {
      const videoCount = station.videos?.length || 0;
      
      if (videoCount > 0) {
        console.log(`   🗑️  Clearing ${videoCount} videos from: ${station.slug}`);
        
        // Clear all videos
        station.videos = [];
        await station.save();
        
        totalRemoved += videoCount;
      }
    }

    console.log(`\n✅ [Cleanup] Complete!`);
    console.log(`   Removed ${totalRemoved} videos from ${stations.length} stations`);
    console.log(`   "Lock Test" and "Persistence Test" videos are now gone.`);

  } catch (err) {
    console.error("❌ Cleanup failed:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
    process.exit(0);
  }
}

cleanupTestVideos();












