import express from "express";
import Beat from "../models/Beat.js";

const router = express.Router();

// Create beat
router.post("/", async (req, res, next) => {
  try {
    const beat = await Beat.create(req.body);
    res.status(201).json({ ok: true, data: beat });
  } catch (err) {
    next(err);
  }
});

// List beats
router.get("/", async (_req, res, next) => {
  try {
    const beats = await Beat.find().sort({ createdAt: -1 });
    res.json({ ok: true, data: beats });
  } catch (err) {
    next(err);
  }
});

export default router;
