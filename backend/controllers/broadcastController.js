// backend/controllers/broadcastController.js
import Station from "../models/Station.js";

const toEvent = (event = {}) => ({
  id: String(event._id || event.id || `evt_${Date.now()}`),
  title: event.title || "Untitled",
  description: event.description || "",
  type: event.type || "program",
  videoUrl: event.videoUrl || event.url || "",
  thumbnailUrl: event.thumbnailUrl || event.thumbnail || "",
  startsAt: event.startsAt || null,
  endsAt: event.endsAt || null,
  isFeatured: !!event.isFeatured,
  status: event.status || "scheduled",
});

export const getAllBroadcasts = async (_req, res) => {
  try {
    res.json({ ok: true, broadcasts: [] });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message, broadcasts: [] });
  }
};

export const getBroadcastById = async (req, res) => {
  try {
    res.json({ ok: true, broadcast: { _id: req.params.id } });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

export const createBroadcast = async (req, res) => {
  try {
    res.status(201).json({ ok: true, broadcast: req.body || {} });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

export const updateBroadcast = async (req, res) => {
  try {
    res.json({ ok: true, broadcast: { _id: req.params.id, ...(req.body || {}) } });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

export const deleteBroadcast = async (_req, res) => {
  try {
    res.json({ ok: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// Route compatibility exports used by backend/routes/broadcastRoutes.js
export const getStationSchedule = async (req, res) => {
  try {
    const station = await Station.findOne({ slug: req.params.slug }).select("name slug schedule").lean();
    if (!station) return res.status(404).json({ ok: false, error: "Station not found" });
    const events = Array.isArray(station.schedule) ? station.schedule.map(toEvent) : [];
    return res.json({ ok: true, station: { slug: station.slug, name: station.name }, events });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message, events: [] });
  }
};

export const createBroadcastEvent = async (req, res) => {
  try {
    const station = await Station.findOne({ slug: req.params.slug });
    if (!station) return res.status(404).json({ ok: false, error: "Station not found" });
    const event = toEvent({ ...req.body, _id: undefined });
    station.schedule = Array.isArray(station.schedule) ? station.schedule : [];
    station.schedule.push(event);
    await station.save();
    return res.status(201).json({ ok: true, event, total: station.schedule.length });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
};

export const updateBroadcastEvent = async (req, res) => {
  try {
    const station = await Station.findOne({ "schedule._id": req.params.id });
    if (!station) return res.status(404).json({ ok: false, error: "Broadcast event not found" });
    const idx = (station.schedule || []).findIndex((s) => String(s._id) === String(req.params.id));
    if (idx < 0) return res.status(404).json({ ok: false, error: "Broadcast event not found" });
    station.schedule[idx] = { ...station.schedule[idx].toObject(), ...(req.body || {}) };
    await station.save();
    return res.json({ ok: true, event: toEvent(station.schedule[idx]) });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
};

export const deleteBroadcastEvent = async (req, res) => {
  try {
    const station = await Station.findOne({ "schedule._id": req.params.id });
    if (!station) return res.status(404).json({ ok: false, error: "Broadcast event not found" });
    station.schedule = (station.schedule || []).filter((s) => String(s._id) !== String(req.params.id));
    await station.save();
    return res.json({ ok: true, message: "Broadcast event deleted" });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
};

export const getLiveStatus = async (req, res) => {
  try {
    const station = await Station.findOne({ slug: req.params.slug }).select("name slug isLive").lean();
    if (!station) return res.status(404).json({ ok: false, error: "Station not found" });
    return res.json({
      ok: true,
      station: { slug: station.slug, name: station.name },
      isLive: !!station.isLive,
      liveEvent: null,
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
};

export const setLiveOverride = async (req, res) => {
  try {
    const station = await Station.findOneAndUpdate(
      { slug: req.params.slug },
      { $set: { isLive: !!req.body?.active } },
      { new: true }
    ).select("name slug isLive").lean();
    if (!station) return res.status(404).json({ ok: false, error: "Station not found" });
    return res.json({ ok: true, station, override: { active: !!req.body?.active, eventId: req.body?.eventId || null } });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
};

export default {
  getAllBroadcasts,
  getBroadcastById,
  createBroadcast,
  updateBroadcast,
  deleteBroadcast,
  getStationSchedule,
  createBroadcastEvent,
  updateBroadcastEvent,
  deleteBroadcastEvent,
  getLiveStatus,
  setLiveOverride,
};










