// =====================================================================
// Auth middleware
// ---------------------------------------------------------------------
// `requireAuth`   — verifies JWT, attaches req.user (DB lookup).
// `optionalAuth`  — same as above but never blocks on missing token.
// =====================================================================

const { verifyToken } = require('../utils/jwt')
const { fail } = require('../utils/apiResponse')
const User = require('../models/User')

function extractToken(req) {
  const header = req.headers.authorization || ''
  if (header.startsWith('Bearer ')) return header.slice(7)
  return null
}

async function requireAuth(req, res, next) {
  try {
    const token = extractToken(req)
    if (!token) return fail(res, 'Authentication required', 401)

    const decoded = verifyToken(token)
    const user = await User.findById(decoded.sub)
    if (!user) return fail(res, 'Account not found', 401)

    req.user = user
    req.token = token
    next()
  } catch (err) {
    return fail(res, 'Invalid or expired session', 401)
  }
}

async function optionalAuth(req, _res, next) {
  try {
    const token = extractToken(req)
    if (!token) return next()
    const decoded = verifyToken(token)
    req.user = await User.findById(decoded.sub)
  } catch (_) {
    /* ignore */
  }
  next()
}

module.exports = { requireAuth, optionalAuth }
