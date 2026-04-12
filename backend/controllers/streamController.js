import Stream from "../models/StreamModel.js";
import Station from "../models/Station.js";

export async function listStreams(req, res, next) {
  try {
    const { station, isLive } = req.query;
    const q = {};
    if (station) q.station = station;
    if (typeof isLive !== "undefined") q.isLive = isLive === "true";
    const items = await Stream.find(q).sort({ createdAt: -1 }).lean();
    res.json({ ok: true, streams: items, total: items.length });
  } catch (err) {
    next(err);
  }
}

export async function getStream(req, res, next) {
  try {
    const item = await Stream.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ ok: false, error: "Stream not found" });
    res.json({ ok: true, stream: item });
  } catch (err) {
    next(err);
  }
}

export async function createStream(req, res, next) {
  try {
    const { station, title, ingestUrl, playbackUrl, streamKey, stationSlug } = req.body;
    if (station) {
      const s = await Station.findById(station).lean();
      if (!s) return res.status(400).json({ ok: false, error: "Invalid station" });
    }
    const created = await Stream.create({
      station,
      stationSlug,
      title,
      ingestUrl,
      playbackUrl,
      streamKey,
      isLive: false,
    });
    res.status(201).json({ ok: true, stream: created });
  } catch (err) {
    next(err);
  }
}

export async function updateStream(req, res, next) {
  try {
    const updated = await Stream.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!updated) return res.status(404).json({ ok: false, error: "Stream not found" });
    res.json({ ok: true, stream: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteStream(req, res, next) {
  try {
    const deleted = await Stream.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ ok: false, error: "Stream not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function startStream(req, res, next) {
  try {
    const streamId = req.body?.id || req.body?.streamId || req.params?.id;
    if (!streamId) return res.status(400).json({ ok: false, error: "stream id is required" });
    const updated = await Stream.findByIdAndUpdate(
      streamId,
      { $set: { isLive: true, startedAt: new Date(), endedAt: null } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ ok: false, error: "Stream not found" });
    res.json({ ok: true, stream: updated });
  } catch (err) {
    next(err);
  }
}

export async function stopStream(req, res, next) {
  try {
    const streamId = req.body?.id || req.body?.streamId || req.params?.id;
    if (!streamId) return res.status(400).json({ ok: false, error: "stream id is required" });
    const updated = await Stream.findByIdAndUpdate(
      streamId,
      { $set: { isLive: false, endedAt: new Date() } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ ok: false, error: "Stream not found" });
    res.json({ ok: true, stream: updated });
  } catch (err) {
    next(err);
  }
}

export async function getCurrentStreamForStation(req, res, next) {
  try {
    const { slug } = req.params;
    const item = await Stream.findOne({ stationSlug: slug, isLive: true })
      .sort({ startedAt: -1, createdAt: -1 })
      .lean();
    if (!item) return res.status(404).json({ ok: false, error: "No live stream", station: slug });
    return res.json({ ok: true, stream: item });
  } catch (err) {
    return next(err);
  }
}

export async function getAllLiveStreams(_req, res, next) {
  try {
    const streams = await Stream.find({ isLive: true }).sort({ startedAt: -1 }).lean();
    return res.json({ ok: true, streams, total: streams.length });
  } catch (err) {
    return next(err);
  }
}

export async function getStreamHistory(req, res, next) {
  try {
    const { slug } = req.params;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const streams = await Stream.find({ stationSlug: slug })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return res.json({ ok: true, streams, total: streams.length, station: slug });
  } catch (err) {
    return next(err);
  }
}

export default {
  listStreams,
  getStream,
  createStream,
  updateStream,
  deleteStream,
  startStream,
  stopStream,
  getCurrentStreamForStation,
  getAllLiveStreams,
  getStreamHistory,
};
