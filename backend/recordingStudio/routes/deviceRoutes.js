import express from "express";
import Device from "../models/Device.js";

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const d = await Device.create(req.body);
    res.status(201).json({ ok: true, data: d });
  } catch (err) {
    next(err);
  }
});

router.get("/", async (_req, res, next) => {
  try {
    const list = await Device.find().sort({ createdAt: -1 });
    res.json({ ok: true, data: list });
  } catch (err) {
    next(err);
  }
});

export default router;
