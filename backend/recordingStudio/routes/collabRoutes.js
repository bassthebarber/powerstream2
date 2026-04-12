// backend/recordingStudio/routes/collabRoutes.js
// Collab Session Routes
import express from "express";
import CollabSession from "../models/CollabSession.js";

const router = express.Router();

// Create a new collab session
router.post("/", async (req, res, next) => {
  try {
    const session = await CollabSession.create(req.body);
    res.status(201).json({ ok: true, data: session });
  } catch (err) {
    next(err);
  }
});

// List all collab sessions
router.get("/", async (_req, res, next) => {
  try {
    const sessions = await CollabSession.find().sort({ createdAt: -1 });
    res.json({ ok: true, data: sessions });
  } catch (err) {
    next(err);
  }
});

// Get a single collab session
router.get("/:id", async (req, res, next) => {
  try {
    const session = await CollabSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ ok: false, message: "Session not found" });
    }
    res.json({ ok: true, data: session });
  } catch (err) {
    next(err);
  }
});

// Update a collab session
router.put("/:id", async (req, res, next) => {
  try {
    const session = await CollabSession.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!session) {
      return res.status(404).json({ ok: false, message: "Session not found" });
    }
    res.json({ ok: true, data: session });
  } catch (err) {
    next(err);
  }
});

// Delete a collab session
router.delete("/:id", async (req, res, next) => {
  try {
    const session = await CollabSession.findByIdAndDelete(req.params.id);
    if (!session) {
      return res.status(404).json({ ok: false, message: "Session not found" });
    }
    res.json({ ok: true, message: "Session deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
