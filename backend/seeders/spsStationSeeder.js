// backend/seeders/spsStationSeeder.js
import Station from "../models/Station.js";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

export async function seedSPSStations() {
  try {
    const stations = [
      {
        owner: new mongoose.Types.ObjectId(), // Placeholder - should use actual owner ID
        name: "Southern Power Network",
        slug: "southern-power-network",
        logoUrl: "/logos/southernpowernetworklogo.png",
        description: "The flagship station of Southern Power Syndicate, featuring music videos, local programming, and community content.",
        category: "Music & Entertainment",
        network: "Southern Power Syndicate",
        region: "US",
        country: "US",
        isPublic: true,
        isLive: false,
        status: "ready",
      },
      {
        owner: new mongoose.Types.ObjectId(),
        name: "No Limit East Houston",
        slug: "NoLimitEastHouston",
        logoUrl: "/logos/nolimiteasthoustonlogo.png",
        description: "Music videos & local shows celebrating the culture and talent of East Houston.",
        category: "Music & Culture",
        network: "Southern Power Syndicate",
        region: "US",
        country: "US",
        isPublic: true,
        isLive: false,
        status: "ready",
      },
      {
        owner: new mongoose.Types.ObjectId(),
        name: "Texas Got Talent",
        slug: "texas-got-talent",
        logoUrl: "/logos/texasgottalentlogo.png",
        description: "Live talent competition & voting - discover the best talent Texas has to offer.",
        category: "Talent Competition",
        network: "Southern Power Syndicate",
        region: "US",
        country: "US",
        isPublic: true,
        isLive: false,
        status: "ready",
      },
      {
        owner: new mongoose.Types.ObjectId(),
        name: "Civic Connect",
        slug: "civic-connect",
        logoUrl: "/logos/civicconnectlogo.png",
        description: "Community news & civic engagement programming.",
        category: "News & Community",
        network: "Southern Power Syndicate",
        region: "US",
        country: "US",
        isPublic: true,
        isLive: false,
        status: "ready",
      },
      {
        owner: new mongoose.Types.ObjectId(),
        name: "Lynny Redd TV",
        slug: "lynny-redd-tv",
        type: "tv",
        description:
          "Independent culture, music, and exclusive content from Lynny Redd.",
        logoUrl: "/logos/tv/lynny-redd-tv.png",
        logo: "/logos/tv/lynny-redd-tv.png",
        tags: ["Live", "VOD", "Upload"],
        category: "music",
        streamKey: uuidv4(),
        isPublic: true,
        isLive: false,
        status: "active",
      },
      {
        owner: new mongoose.Types.ObjectId(),
        name: "Gas God TV",
        slug: "gas-god-tv",
        type: "tv",
        description:
          "High-energy street culture, music, and original content from Gas God.",
        logoUrl: "/logos/tv/gas-god-tv.png",
        logo: "/logos/tv/gas-god-tv.png",
        tags: ["Live", "VOD", "Upload"],
        category: "music",
        streamKey: uuidv4(),
        isPublic: true,
        isLive: false,
        status: "active",
      },
    ];

    // Upsert stations by slug - only set fields if station doesn't exist
    for (const station of stations) {
      const existing = await Station.findOne({ slug: station.slug });
      if (!existing) {
        await Station.create(station);
      } else {
        // Only update if missing critical fields, preserve existing data
        const updates = {};
        if (!existing.logoUrl && station.logoUrl) updates.logoUrl = station.logoUrl;
        if (!existing.logo && station.logo) updates.logo = station.logo;
        if (!existing.network && station.network) updates.network = station.network;
        if (!existing.description && station.description) updates.description = station.description;
        if ((!existing.tags || !existing.tags.length) && station.tags?.length) {
          updates.tags = station.tags;
        }
        if (Object.keys(updates).length > 0) {
          await Station.findOneAndUpdate({ slug: station.slug }, { $set: updates });
        }
      }
    }

    console.log("✅ SPS Stations seeded successfully");
    return { ok: true, message: "Stations seeded" };
  } catch (err) {
    console.error("❌ Error seeding SPS stations:", err);
    throw err;
  }
}

