/**
 * Global error handler middleware
 */
export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Handle specific error types
  if (err.message && err.message.includes('not found')) {
    return res.status(404).json({
      success: false,
      error: err.message
    });
  }

  if (err.status === 400 || err.message.includes('validation')) {
    return res.status(400).json({
      success: false,
      error: err.message || 'Validation error'
    });
  }

  if (err.status === 401 || err.message.includes('API key')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or missing API key'
    });
  }

  if (err.status === 429 || err.message.includes('rate limit')) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
}

export default errorHandler;
