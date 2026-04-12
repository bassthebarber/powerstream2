// Unified platform listing + stream manifest for PowerStream web app
import Station from "../models/Station.js";

function buildHlsUrl(station) {
  if (!station) return null;
  if (station.playbackUrl) return station.playbackUrl;
  if (station.streamKey) {
    return `http://localhost:8000/live/${station.streamKey}/index.m3u8`;
  }
  return null;
}

function normalizeStation(doc) {
  const hlsUrl = buildHlsUrl(doc);
  const streamUrl = doc.streamUrl || hlsUrl || null;
  const slug =
    doc.slug ||
    (doc._id ? String(doc._id) : "");

  let kind = "tv";
  if (doc.type === "radio") kind = "radio";
  else if (doc.type === "artist" || doc.type === "stream") kind = "artist";

  return {
    id: doc._id,
    name: doc.name,
    slug,
    logoUrl: doc.logoUrl || doc.logo || null,
    streamUrl,
    hlsUrl,
    isLive: !!doc.isLive,
    type: doc.type,
    kind,
    description: doc.description || "",
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    status: doc.status,
  };
}

/**
 * GET /api/stations
 * Query: kind=tv|artist|radio|all (default all)
 */
export async function listUnifiedStations(req, res) {
  try {
    const kind = (req.query.kind || "all").toLowerCase();
    const q = { status: { $ne: "inactive" } };

    if (kind === "tv") {
      q.type = "tv";
    } else if (kind === "artist") {
      q.$or = [{ type: "artist" }, { type: "stream" }];
    } else if (kind === "radio") {
      q.type = "radio";
    }

    const stations = await Station.find(q).sort({ isLive: -1, name: 1 }).lean();
    const mapped = stations.map(normalizeStation);
    return res.json({ ok: true, stations: mapped });
  } catch (e) {
    console.error("[platformStations] list error:", e);
    return res.status(500).json({ ok: false, error: e.message, stations: [] });
  }
}

/**
 * GET /api/streams/:slug
 * Returns playback URLs for the live player (HLS preferred).
 */
export async function getStreamPlayback(req, res) {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({ ok: false, message: "slug required" });
    }

    const station = await Station.findOne({ slug }).lean();
    if (!station) {
      return res.status(404).json({ ok: false, message: "Station not found", slug });
    }

    const hlsUrl = buildHlsUrl(station);
    const streamUrl = station.streamUrl || hlsUrl;

    return res.json({
      ok: true,
      slug: station.slug,
      name: station.name,
      isLive: !!station.isLive,
      hlsUrl,
      streamUrl,
      type: station.type,
      posterUrl: station.banner || station.logoUrl || station.logo || null,
    });
  } catch (e) {
    console.error("[platformStations] stream error:", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
}
