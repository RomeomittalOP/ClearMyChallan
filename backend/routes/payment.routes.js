const router = require('express').Router()
const ctrl = require('../controllers/payment.controller')
const { requireAuth } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const v = require('../validators/payment.validator')
const { paymentLimiter } = require('../middleware/rateLimiter')

// Public — frontend reads keyId here.
router.get('/config', ctrl.publicConfig)

// Webhook (mounted with raw body in server.js — see /api/payments/webhook).

// Authenticated user routes
router.use(requireAuth)
router.post(
  '/order',
  paymentLimiter,
  validate(v.createOrder),
  ctrl.createOrder
)
router.post('/verify', paymentLimiter, validate(v.verify), ctrl.verify)
router.get('/me', ctrl.listMine)

module.exports = router
