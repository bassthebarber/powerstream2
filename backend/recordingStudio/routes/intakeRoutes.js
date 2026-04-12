import express from "express";
import ArtistIntake from "../models/ArtistIntake.js";

const router = express.Router();

// Create intake
router.post("/", async (req, res, next) => {
  try {
    const intake = await ArtistIntake.create(req.body);
    res.status(201).json({ ok: true, data: intake });
  } catch (err) {
    next(err);
  }
});

// List
router.get("/", async (_req, res, next) => {
  try {
    const list = await ArtistIntake.find().sort({ createdAt: -1 });
    res.json({ ok: true, data: list });
  } catch (err) {
    next(err);
  }
});

export default router;
