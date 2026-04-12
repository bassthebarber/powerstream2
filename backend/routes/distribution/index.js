// backend/routes/distribution/index.js
// Distribution Routes Index - Mounts all distribution sub-routes
import express from "express";
import marketplaceRoutes from "./marketplaceRoutes.js";
import healthRoutes from "./health.js";

const router = express.Router();

// Mount health check
router.use("/health", healthRoutes);

// Mount marketplace routes
router.use("/marketplace", marketplaceRoutes);

export default router;










