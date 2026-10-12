/**
 * server/src/middleware/errorHandler.js
 *
 * Centralized error handler and response formatting.
 */

export function errorHandler(err, _req, res, _next) {
  console.error('[API Error]:', err);

  const statusCode = err.statusCode || (err.message.includes('not found') ? 404 : 400);

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || (statusCode === 404 ? 'NOT_FOUND' : 'BAD_REQUEST'),
      message: err.message || 'An unexpected error occurred',
      details: err.details || null,
    },
  });
}
