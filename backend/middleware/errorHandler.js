// backend/middleware/errorHandler.js
// PowerStream Error Handler Middleware

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req, res, _next) {
  res.status(404).json({
    ok: false,
    error: "Not found",
    path: req.originalUrl,
  });
}

/**
 * Global error handler
 */
export default function errorHandler(err, req, res, _next) {
  console.error("❌ Error:", err.message);
  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || err.status || 500;
  
  res.status(statusCode).json({
    ok: false,
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
}










