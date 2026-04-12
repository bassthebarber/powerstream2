// backend/routes/healthRoutes.js
// Health Check Routes - System status endpoints
import express from "express";
import mongoose from "mongoose";

const router = express.Router();

/**
 * GET /api/health
 * Basic health check
 */
router.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "powerstream-api",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * GET /api/health/detailed
 * Detailed health check with service status
 */
router.get("/detailed", async (_req, res) => {
  const mongoStatus = mongoose.connection.readyState;
  const mongoStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  const services = {
    api: { status: "ok" },
    mongodb: {
      status: mongoStatus === 1 ? "ok" : "degraded",
      state: mongoStates[mongoStatus] || "unknown",
    },
    stripe: {
      status: process.env.STRIPE_SECRET_KEY ? "configured" : "not_configured",
    },
    paypal: {
      status: process.env.PAYPAL_CLIENT_ID ? "configured" : "not_configured",
    },
    redis: {
      status: process.env.USE_REDIS === "true" ? "enabled" : "disabled",
    },
  };

  const allHealthy = 
    services.api.status === "ok" && 
    services.mongodb.status === "ok";

  res.status(allHealthy ? 200 : 503).json({
    ok: allHealthy,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: "MB",
    },
    services,
  });
});

/**
 * GET /api/health/ping
 * Simple ping endpoint
 */
router.get("/ping", (_req, res) => {
  res.send("pong");
});

/**
 * GET /api/health/ready
 * Kubernetes readiness probe
 */
router.get("/ready", (_req, res) => {
  const mongoReady = mongoose.connection.readyState === 1;
  
  if (mongoReady) {
    res.json({ ok: true, ready: true });
  } else {
    res.status(503).json({ ok: false, ready: false, reason: "MongoDB not connected" });
  }
});

/**
 * GET /api/health/live
 * Kubernetes liveness probe
 */
router.get("/live", (_req, res) => {
  res.json({ ok: true, live: true });
});

export default router;
