import express from "express";
import Employee from "../models/Employee.js";

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const emp = await Employee.create(req.body);
    res.status(201).json({ ok: true, data: emp });
  } catch (err) {
    next(err);
  }
});

router.get("/", async (_req, res, next) => {
  try {
    const list = await Employee.find().sort({ createdAt: -1 });
    res.json({ ok: true, data: list });
  } catch (err) {
    next(err);
  }
});

export default router;
