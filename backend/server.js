/**
 * Legacy entrypoint kept for compatibility.
 *
 * The real backend now lives under `backend/src/` (see `src/server.js`).
 * This file simply ensures a sane default PORT and boots the new server.
 *
 * Notifications REST + Socket: POST/GET/PUT under /api/notifications (mounted from src/app.js).
 */

const PORT = process.env.PORT || 8080;
process.env.PORT = String(PORT);

// Boot the real server (ESM dynamic import so PORT is set first)
await import("./src/server.js");