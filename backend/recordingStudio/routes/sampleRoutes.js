import express from "express";
import Sample from "../models/Sample.js";

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const sample = await Sample.create(req.body);
    res.status(201).json({ ok: true, data: sample });
  } catch (err) {
    next(err);
  }
});

router.get("/", async (_req, res, next) => {
  try {
    const list = await Sample.find().sort({ createdAt: -1 });
    res.json({ ok: true, data: list });
  } catch (err) {
    next(err);
  }
});

export default router;
