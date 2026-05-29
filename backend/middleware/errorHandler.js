// =====================================================================
// Central error middleware
// ---------------------------------------------------------------------
// Mounted last in `server.js`. Converts thrown errors / rejected
// promises (via asyncHandler) into the standard JSON envelope.
// =====================================================================

const logger = require('../utils/logger')
const { ApiError } = require('../utils/apiResponse')

function notFound(req, res) {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  })
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  if (err instanceof ApiError) {
    return res
      .status(err.status)
      .json({ success: false, message: err.message, error: err.error })
  }

  // Mongoose validation
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      success: false,
      message: 'Validation error',
      error: Object.values(err.errors).map((e) => e.message)
    })
  }

  // Mongo duplicate key
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate value',
      error: err.keyValue
    })
  }

  logger.error(err.stack || err.message)
  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  })
}

module.exports = { notFound, errorHandler }
