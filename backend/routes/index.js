// Aggregates all sub-routers under one /api router.
const router = require('express').Router()

router.use('/auth', require('./auth.routes'))
router.use('/challans', require('./challan.routes'))
router.use('/pricing', require('./pricing.routes'))
router.use('/resolutions', require('./resolution.routes'))
router.use('/payments', require('./payment.routes'))
router.use('/contact', require('./contact.routes'))
router.use('/admin', require('./admin.routes'))

// Health check used by Render / uptime monitors. Reports DB connectivity.
const mongoose = require('mongoose')
const DB_STATES = ['disconnected', 'connected', 'connecting', 'disconnecting']
router.get('/health', (_req, res) => {
  const state = mongoose.connection.readyState // 0..3
  const dbUp = state === 1
  res.status(dbUp ? 200 : 503).json({
    success: dbUp,
    message: dbUp ? 'ok' : 'degraded',
    db: DB_STATES[state] || 'unknown',
    uptime: Math.round(process.uptime())
  })
})

module.exports = router
