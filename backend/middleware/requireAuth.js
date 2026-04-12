// backend/middleware/requireAuth.js
// Unified Authentication Middleware for PowerStream
// Supports JWT tokens from Authorization: Bearer <token>

import jwt from "jsonwebtoken";

// Get JWT secret from env
const getJwtSecret = () => {
  return process.env.JWT_SECRET || "powerstream-dev-secret-change-in-production";
};

/**
 * Extract token from request
 */
function extractToken(req) {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // Check query parameter (for WebSocket or special cases)
  if (req.query && req.query.token) {
    return req.query.token;
  }

  // Check cookies
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  return null;
}

/**
 * Verify JWT token and return decoded payload
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (error) {
    return null;
  }
}

/**
 * requireAuth - Hard require authentication
 * Returns 401 if no valid token
 */
export function requireAuth(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    // In dev mode, allow through with a warning
    if (process.env.NODE_ENV !== "production" && process.env.ALLOW_DEV_AUTH === "true") {
      console.warn("⚠️ [DEV MODE] Auth bypassed - no token provided");
      req.user = { id: "dev-user", email: "dev@powerstream.local", role: "admin" };
      return next();
    }

    return res.status(401).json({
      ok: false,
      error: "Authentication required",
      message: "No token provided",
    });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      ok: false,
      error: "Invalid token",
      message: "Token is invalid or expired",
    });
  }

  // Attach user to request
  req.user = {
    id: decoded.id || decoded.userId || decoded.sub,
    _id: decoded.id || decoded.userId || decoded.sub,
    email: decoded.email,
    role: decoded.role,
    roles: decoded.roles || [decoded.role].filter(Boolean),
    isAdmin: decoded.isAdmin || decoded.role === "admin",
  };

  next();
}

/**
 * authOptional - Attach user if token present, but don't fail
 * Good for routes that work for both authenticated and anonymous users
 */
export function authOptional(req, res, next) {
  const token = extractToken(req);

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = {
        id: decoded.id || decoded.userId || decoded.sub,
        _id: decoded.id || decoded.userId || decoded.sub,
        email: decoded.email,
        role: decoded.role,
        roles: decoded.roles || [decoded.role].filter(Boolean),
        isAdmin: decoded.isAdmin || decoded.role === "admin",
      };
    }
  }

  next();
}

/**
 * authRequired - Alias for requireAuth
 * For backwards compatibility
 */
export const authRequired = requireAuth;

/**
 * requireAdmin - Require admin role
 */
export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (!req.user?.isAdmin && req.user?.role !== "admin") {
      return res.status(403).json({
        ok: false,
        error: "Forbidden",
        message: "Admin access required",
      });
    }
    next();
  });
}

/**
 * requireRole - Require specific role(s)
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    requireAuth(req, res, () => {
      const userRole = req.user?.role;
      const userRoles = req.user?.roles || [];

      const hasRole = allowedRoles.some(
        (role) => userRole === role || userRoles.includes(role)
      );

      if (!hasRole) {
        return res.status(403).json({
          ok: false,
          error: "Forbidden",
          message: `Required role: ${allowedRoles.join(" or ")}`,
        });
      }

      next();
    });
  };
}

// Default export for CommonJS compatibility
export default {
  requireAuth,
  authOptional,
  authRequired,
  requireAdmin,
  requireRole,
};
