import crypto from 'crypto';

/**
 * Structured Logging Middleware — JSON format for production.
 *
 * Emits structured log lines with:
 * - requestId (for tracing)
 * - method, path, statusCode
 * - duration (ms)
 * - userAgent, ip
 * - userId (if authenticated)
 *
 * No external dependency — just well-structured console output.
 */
export function requestLogger(req, res, next) {
  const requestId = crypto.randomUUID().slice(0, 8);
  const startTime = Date.now();

  // Attach requestId to request for downstream use
  req.requestId = requestId;

  // Capture the original end method
  const originalEnd = res.end;
  res.end = function (...args) {
    const duration = Date.now() - startTime;

    const logEntry = {
      timestamp: new Date().toISOString(),
      requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.userId || null,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('user-agent')?.slice(0, 80),
    };

    // Color-code by status for dev readability
    const status = res.statusCode;
    if (status >= 500) {
      console.error(JSON.stringify({ level: 'ERROR', ...logEntry }));
    } else if (status >= 400) {
      console.warn(JSON.stringify({ level: 'WARN', ...logEntry }));
    } else {
      console.log(JSON.stringify({ level: 'INFO', ...logEntry }));
    }

    originalEnd.apply(res, args);
  };

  next();
}

/**
 * Error Handler Middleware — catches unhandled errors and returns structured JSON.
 * Must be registered AFTER all routes.
 */
export function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  console.error(JSON.stringify({
    level: 'ERROR',
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  }));

  res.status(statusCode).json({
    error: message,
    requestId: req.requestId,
  });
}
