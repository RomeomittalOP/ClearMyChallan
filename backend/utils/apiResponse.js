// =====================================================================
// Standard API response helpers
// ---------------------------------------------------------------------
// All controllers return JSON shaped as:
//   { success: boolean, message: string, data?: any, error?: any }
// This keeps the frontend client predictable.
// =====================================================================

function success(res, data = null, message = 'OK', status = 200) {
  return res.status(status).json({ success: true, message, data })
}

function created(res, data = null, message = 'Created') {
  return success(res, data, message, 201)
}

function fail(res, message = 'Bad request', status = 400, error = null) {
  return res.status(status).json({ success: false, message, error })
}

class ApiError extends Error {
  constructor(message, status = 400, error = null) {
    super(message)
    this.status = status
    this.error = error
  }
}

module.exports = { success, created, fail, ApiError }
