import express from "express";
import Payroll from "../models/Payroll.js";

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const payroll = await Payroll.create(req.body);
    res.status(201).json({ ok: true, data: payroll });
  } catch (err) {
    next(err);
  }
});

router.get("/", async (_req, res, next) => {
  try {
    const list = await Payroll.find()
      .populate("employee")
      .sort({ createdAt: -1 });
    res.json({ ok: true, data: list });
  } catch (err) {
    next(err);
  }
});

export default router;
