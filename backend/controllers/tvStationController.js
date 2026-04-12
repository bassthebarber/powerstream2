// backend/controllers/tvStationController.js
// PowerStream TV Station Controller
import Station from "../models/Station.js";

/**
 * Get all TV stations
 */
export const getAllStations = async (req, res) => {
  try {
    const stations = await Station.find({ type: "tv", status: { $ne: "inactive" } })
      .sort({ isLive: -1, updatedAt: -1 })
      .lean();
    res.json({ ok: true, stations });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message, stations: [] });
  }
};

/**
 * Get station by ID
 */
export const getStationById = async (req, res) => {
  try {
    const { id } = req.params;
    const station = await Station.findById(id).lean();
    if (!station) return res.status(404).json({ ok: false, error: "Station not found" });
    res.json({ ok: true, station });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

/**
 * Create new station
 */
export const createStation = async (req, res) => {
  try {
    const created = await Station.create(req.body || {});
    res.status(201).json({ ok: true, station: created });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

/**
 * Update station
 */
export const updateStation = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Station.findByIdAndUpdate(id, { $set: req.body || {} }, { new: true }).lean();
    if (!updated) return res.status(404).json({ ok: false, error: "Station not found" });
    res.json({ ok: true, station: updated });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

/**
 * Delete station
 */
export const deleteStation = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Station.findByIdAndDelete(id).lean();
    if (!deleted) return res.status(404).json({ ok: false, error: "Station not found" });
    res.json({ ok: true, message: `Station ${id} deleted` });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

/**
 * Get station schedule
 */
export const getSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const station = await Station.findById(id).select("schedule").populate("schedule").lean();
    if (!station) return res.status(404).json({ ok: false, error: "Station not found", schedule: [] });
    res.json({ ok: true, schedule: station.schedule || [], stationId: id });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

/**
 * Aliases used by legacy routes
 */
export const getStations = getAllStations;

export const getStationBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const station = await Station.findOne({ slug }).lean();
    if (!station) return res.status(404).json({ ok: false, error: "Station not found", slug });
    res.json({ ok: true, station });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

export const getSouthernPowerStations = async (_req, res) => {
  try {
    const stations = await Station.find({
      $or: [{ category: /southern/i }, { name: /southern/i }],
      status: { $ne: "inactive" },
    })
      .sort({ isLive: -1, updatedAt: -1 })
      .lean();
    res.json({ ok: true, stations });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message, stations: [] });
  }
};

export const getWorldwideStations = async (_req, res) => {
  try {
    const stations = await Station.find({
      $or: [{ category: /world|global/i }, { name: /world|global/i }],
      status: { $ne: "inactive" },
    })
      .sort({ isLive: -1, updatedAt: -1 })
      .lean();
    res.json({ ok: true, stations });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message, stations: [] });
  }
};

export default {
  getAllStations,
  getStations,
  getStationById,
  getStationBySlug,
  getSouthernPowerStations,
  getWorldwideStations,
  createStation,
  updateStation,
  deleteStation,
  getSchedule,
};










