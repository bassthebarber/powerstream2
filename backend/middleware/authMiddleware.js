// backend/middleware/requireAuth.js
import jwt from "jsonwebtoken";
import { logger } from "../src/config/logger.js";

const JWT_SECRET = process.env.JWT_SECRET || "powerstream-dev-secret-key";

/**
 * Require authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const requireAuth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("[auth] missing bearer token", { path: req.originalUrl, method: req.method });
      return res.status(401).json({
        ok: false,
        error: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attach user info to request
    req.user = decoded;
    req.userId = decoded.id || decoded._id || decoded.userId;
    logger.info("[auth] authenticated", { userId: req.userId, path: req.originalUrl });

    next();
  } catch (error) {
    logger.warn("[auth] authentication failed", { path: req.originalUrl, message: error.message });
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        ok: false,
        error: "Token expired. Please login again.",
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        ok: false,
        error: "Invalid token.",
      });
    }
    return res.status(500).json({
      ok: false,
      error: "Authentication failed.",
    });
  }
};

/**
 * Optional auth - doesn't fail if no token
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      req.userId = decoded.id || decoded._id || decoded.userId;
    }
  } catch (error) {
    // Ignore errors for optional auth
  }
  next();
};

/**
 * Require admin role
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ ok: false, error: "Authentication required" });
  }
  
  if (!req.user.isAdmin && req.user.role !== "admin") {
    return res.status(403).json({ ok: false, error: "Admin access required" });
  }
  
  next();
};

/**
 * Require one of the provided roles.
 * Supports requireRole("admin", "editor") or requireRole(["admin","editor"]).
 */
export const requireRole = (...rolesInput) => {
  const roles = Array.isArray(rolesInput[0]) ? rolesInput[0] : rolesInput;
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: "Authentication required" });
    }
    const userRoles = [
      req.user.role,
      ...(Array.isArray(req.user.roles) ? req.user.roles : []),
    ].filter(Boolean);
    const allowed = roles.some((r) => userRoles.includes(r));
    if (!allowed) {
      return res.status(403).json({ ok: false, error: "Insufficient permissions" });
    }
    next();
  };
};

export default requireAuth;

