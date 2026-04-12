import jwt from "jsonwebtoken";
import env from "../config/env.js";
import { logger } from "../config/logger.js";

/**
 * Authenticated namespace; clients join room user:<userId> for targeted pushes.
 */
export default function attachNotificationsSocket(io) {
  const nsp = io.of("/notifications");

  nsp.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token ||
        (socket.handshake.headers?.authorization || "").replace(/^Bearer\s+/i, "");
      if (!token) return next(new Error("auth required"));
      const decoded = jwt.verify(token, env.JWT_SECRET);
      const userId = String(decoded.id || decoded._id || decoded.userId || "");
      if (!userId) return next(new Error("invalid token"));
      socket.userId = userId;
      next();
    } catch (e) {
      logger.warn("[notifications socket] auth:", e.message);
      next(new Error("invalid token"));
    }
  });

  nsp.on("connection", (socket) => {
    const room = `user:${socket.userId}`;
    socket.join(room);
    logger.debug(`[notifications] ${socket.userId} joined ${room}`);
    socket.emit("notification:ready", { userId: socket.userId });
    socket.on("disconnect", () => {
      socket.leave(room);
    });
  });
}
