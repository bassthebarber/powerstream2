// backend/test-mongo-connection.js
// Quick MongoDB connection test

import mongoose from "mongoose";

const uri = "mongodb+srv://Poweruser:Chinamomasally@cluster0.ldmtan.mongodb.net/powerstream?retryWrites=true&w=majority";

console.log("🔄 Testing MongoDB connection...");
console.log("   URI:", uri.replace(/:[^:@]+@/, ":****@")); // Hide password

async function testConnection() {
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log("✅ MongoDB Connected Successfully!");
    console.log("   Host:", mongoose.connection.host);
    console.log("   Database:", mongoose.connection.name);
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("   Collections:", collections.length);
    
    await mongoose.disconnect();
    console.log("🔌 Disconnected successfully");
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Connection failed!");
    console.error("   Error:", error.message);
    if (error.code) console.error("   Code:", error.code);
    process.exit(1);
  }
}

testConnection();










