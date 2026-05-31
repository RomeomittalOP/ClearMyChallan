// Admin gate — must run AFTER `requireAuth`.
const { fail } = require('../utils/apiResponse')

function requireAdmin(req, res, next) {
  if (!req.user) return fail(res, 'Authentication required', 401)
  if (req.user.role !== 'admin') return fail(res, 'Admin access only', 403)
  next()
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return fail(res, 'Authentication required', 401)
    if (!roles.includes(req.user.role)) {
      return fail(res, 'Insufficient permissions', 403)
    }
    next()
  }
}

module.exports = { requireAdmin, requireRole }
