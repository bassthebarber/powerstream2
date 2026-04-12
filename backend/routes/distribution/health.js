// backend/routes/distribution/health.js
// Distribution Health Check Route
import express from "express";

const router = express.Router();

/**
 * GET /api/distribution/health
 * Health check for distribution service
 */
router.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "distribution",
    status: "online",
    timestamp: new Date().toISOString(),
  });
});

export default router;










