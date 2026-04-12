// backend/middleware/logger.js
// PowerStream Request Logger Middleware

/**
 * Simple request logger middleware
 * Logs: method, URL, status, duration
 */
export default function logger(req, res, next) {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  // Log request
  console.log(`📥 [${timestamp}] ${req.method} ${req.originalUrl}`);

  // Capture response
  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? "❌" : res.statusCode >= 300 ? "🔄" : "✅";
    console.log(`${statusColor} [${timestamp}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });

  next();
}










