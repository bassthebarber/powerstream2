import express from "express";
import MixJob from "../models/MixJob.js";

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const job = await MixJob.create(req.body);
    res.status(201).json({ ok: true, data: job });
  } catch (err) {
    next(err);
  }
});

router.get("/", async (_req, res, next) => {
  try {
    const jobs = await MixJob.find().sort({ createdAt: -1 });
    res.json({ ok: true, data: jobs });
  } catch (err) {
    next(err);
  }
});

export default router;
