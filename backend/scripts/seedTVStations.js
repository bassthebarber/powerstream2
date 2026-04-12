#!/usr/bin/env node
// backend/scripts/seedTVStations.js
// Standalone script to seed TV stations
// Run with: node scripts/seedTVStations.js

import 'dotenv/config';
import mongoose from 'mongoose';
import { seedTVStations } from '../seeders/tvStationSeeder.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/powerstream';

async function run() {
  console.log('🔌 Connecting to MongoDB...');
  console.log(`   URI: ${MONGO_URI.replace(/:([^:@]+)@/, ':****@')}`);
  
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    await seedTVStations();
    
    console.log('🏁 Seeding complete!');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

run();












