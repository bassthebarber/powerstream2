// backend/scripts/testMongo.js
// MongoDB Connection Test Script
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env files (same order as server)
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const uri = process.env.MONGO_URI;

console.log("🔍 Testing MongoDB Connection...");
console.log("📋 URI pattern:", uri ? uri.replace(/:[^:@]+@/, ":****@") : "NOT SET");

if (!uri) {
  console.error("❌ MONGO_URI is not set in .env or .env.local");
  process.exit(1);
}

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 10000,
})
  .then(() => {
    console.log("✅ TEST: MongoDB connection successful");
    console.log("📊 Database:", mongoose.connection.db.databaseName);
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ TEST: MongoDB connection failed");
    console.error("   Error:", err.message);
    
    if (err.message.includes("Authentication failed")) {
      console.error("\n🔑 HINT: Check username/password in MongoDB Atlas > Database Access");
    } else if (err.message.includes("ENOTFOUND") || err.message.includes("getaddrinfo")) {
      console.error("\n🌐 HINT: Check cluster hostname in the URI");
    } else if (err.message.includes("timed out")) {
      console.error("\n⏰ HINT: Check network access in MongoDB Atlas > Network Access");
      console.error("         Make sure your IP is whitelisted (or add 0.0.0.0/0 for all IPs)");
    }
    
    process.exit(1);
  });












