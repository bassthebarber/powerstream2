import express from "express";
import ContestWinner from "../models/ContestWinner.js";

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const w = await ContestWinner.create(req.body);
    res.status(201).json({ ok: true, data: w });
  } catch (err) {
    next(err);
  }
});

router.get("/", async (_req, res, next) => {
  try {
    const list = await ContestWinner.find().sort({ createdAt: -1 });
    res.json({ ok: true, data: list });
  } catch (err) {
    next(err);
  }
});

export default router;
