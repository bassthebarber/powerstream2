import { Router } from "express";
import Station from "../models/Station.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true, service: "ps-tv" });
});

router.get("/stations", async (_req, res) => {
  try {
    const stations = await Station.find({ type: "tv", status: { $ne: "inactive" } })
      .sort({ isLive: -1, updatedAt: -1 })
      .lean();
    res.json({ ok: true, stations });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message, stations: [] });
  }
});

router.get("/stations/:stationId", async (req, res) => {
  try {
    const { stationId } = req.params;
    const station = await Station.findOne({
      $or: [{ _id: stationId }, { slug: stationId }],
    }).lean();
    if (!station) return res.status(404).json({ ok: false, error: "Station not found" });
    res.json({ ok: true, station });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

export default router;
 