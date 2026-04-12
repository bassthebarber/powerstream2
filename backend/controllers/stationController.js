import Station from "../models/Station.js";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const buildPlaybackUrl = (streamKey) => `http://localhost:8000/live/${streamKey}/index.m3u8`;

export async function buildTVStation(req, res) {
  try {
    const { ownerId, stationName, layout = "powerfeed:auto" } = req.body || {};
    const owner = ownerId && mongoose.isValidObjectId(ownerId) ? ownerId : req.user?._id;
    if (!owner || !stationName) return res.status(400).json({ ok: false, error: "ownerId and stationName are required" });

    const exists = await Station.findOne({ owner, name: stationName });
    if (exists) return res.status(409).json({ ok: false, error: "Station name already exists for this owner" });

    const streamKey = uuidv4();
    const station = await Station.create({
      owner,
      name: stationName,
      layout,
      streamKey,
      playbackUrl: buildPlaybackUrl(streamKey),
      isLive: false,
      playlist: [],
      status: "ready",
    });

    req.app.get("io")?.emit("station:created", { id: station._id, name: station.name });
    return res.json({ ok: true, station });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}

export async function listStations(req, res) {
  try {
    const q = {};
    if (!req.user?.isAdmin) q.owner = req.user._id;
    const stations = await Station.find(q).sort({ createdAt: -1 });
    return res.json({ ok: true, stations });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}

export async function startLive(req, res) {
  try {
    const { id } = req.params;
    const s = await Station.findById(id);
    if (!s) return res.status(404).json({ ok: false, error: "Station not found" });
    if (!req.user?.isAdmin && s.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ ok: false, error: "Forbidden" });

    s.isLive = true;
    s.status = "live";
    await s.save();
    req.app.get("io")?.emit("station:live", { id: s._id });
    return res.json({ ok: true, station: s });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}

export async function stopLive(req, res) {
  try {
    const { id } = req.params;
    const s = await Station.findById(id);
    if (!s) return res.status(404).json({ ok: false, error: "Station not found" });
    if (!req.user?.isAdmin && s.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ ok: false, error: "Forbidden" });

    s.isLive = false;
    s.status = "ready";
    await s.save();
    req.app.get("io")?.emit("station:offline", { id: s._id });
    return res.json({ ok: true, station: s });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}

// ============================================================
// Required endpoints for TV streaming system
// ============================================================

/**
 * POST /api/stations/create
 * Body: { name }
 */
export async function createStation(req, res) {
  try {
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ ok: false, error: "name is required" });

    const streamKey = uuidv4();
    const station = await Station.create({
      name,
      streamKey,
      playbackUrl: buildPlaybackUrl(streamKey),
      isLive: false,
    });

    return res.json({ ok: true, station });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}

/**
 * POST /api/stations/start
 * Body: { id }
 */
export async function startStation(req, res) {
  try {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ ok: false, error: "id is required" });

    const station = await Station.findById(id);
    if (!station) return res.status(404).json({ ok: false, error: "Station not found" });

    station.isLive = true;
    station.playbackUrl = station.playbackUrl || buildPlaybackUrl(station.streamKey);
    await station.save();

    req.app.get("io")?.of("/stations")?.to(`station:${station._id}`)?.emit("station:update", { stationId: station._id, isLive: true });
    return res.json({ ok: true, station });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}

/**
 * POST /api/stations/stop
 * Body: { id }
 */
export async function stopStation(req, res) {
  try {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ ok: false, error: "id is required" });

    const station = await Station.findById(id);
    if (!station) return res.status(404).json({ ok: false, error: "Station not found" });

    station.isLive = false;
    await station.save();

    req.app.get("io")?.of("/stations")?.to(`station:${station._id}`)?.emit("station:update", { stationId: station._id, isLive: false });
    return res.json({ ok: true, station });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}

/**
 * GET /api/stations/:id
 * Works with either Mongo ObjectId or a legacy slug.
 */
export async function getStation(req, res) {
  try {
    const { id } = req.params;
    const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };
    const station = await Station.findOne(query);
    if (!station) return res.status(404).json({ ok: false, error: "Station not found" });
    return res.json({ ok: true, station });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}

/**
 * GET /api/stations/:id/live
 */
export async function getStationLive(req, res) {
  try {
    const { id } = req.params;
    const query = mongoose.isValidObjectId(id) ? { _id: id } : { slug: id };
    const station = await Station.findOne(query).select("name streamKey isLive playbackUrl");
    if (!station) return res.status(404).json({ ok: false, error: "Station not found" });
    const playbackUrl = station.playbackUrl || buildPlaybackUrl(station.streamKey);
    return res.json({
      ok: true,
      stationId: station._id,
      name: station.name,
      isLive: !!station.isLive,
      playbackUrl,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}

// Legacy endpoints referenced by existing router (kept as non-breaking stubs)
export async function getStationVideos(_req, res) {
  return res.json({ ok: true, videos: [] });
}

export async function uploadStationVideo(_req, res) {
  return res.status(501).json({ ok: false, error: "Not implemented" });
}

export async function updateStation(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    const station = await Station.findById(id);
    if (!station) return res.status(404).json({ ok: false, error: "Station not found" });

    const allowed = ["name", "description", "type", "streamUrl", "playbackUrl", "logo", "banner", "tags", "status"];
    for (const key of allowed) {
      if (updates[key] !== undefined) station[key] = updates[key];
    }
    await station.save();
    return res.json({ ok: true, station });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}

export async function deleteStation(req, res) {
  try {
    const { id } = req.params;
    const station = await Station.findById(id);
    if (!station) return res.status(404).json({ ok: false, error: "Station not found" });
    await station.deleteOne();
    return res.json({ ok: true, deleted: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
