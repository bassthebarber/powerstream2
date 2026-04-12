import express from "express";
import Recording from "../models/Recording.js";

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const rec = await Recording.create(req.body);
    res.status(201).json({ ok: true, data: rec });
  } catch (err) {
    next(err);
  }
});

router.get("/", async (_req, res, next) => {
  try {
    const list = await Recording.find().sort({ createdAt: -1 });
    res.json({ ok: true, data: list });
  } catch (err) {
    next(err);
  }
});

export default router;
