const router = require('express').Router()
const rateLimit = require('express-rate-limit')
const ctrl = require('../controllers/case.controller')
const { validate } = require('../middleware/validate')
const { optionalAuth } = require('../middleware/auth')
const { caseDocs, uploadErrorHandler } = require('../middleware/upload')
const v = require('../validators/case.validator')

// Tighter throttle on the public submission to deter spam uploads.
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many submissions. Please try again in an hour.'
  }
})

const trackLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false
})

router.post(
  '/submit',
  submitLimiter,
  optionalAuth,
  caseDocs,
  uploadErrorHandler,
  validate(v.submit),
  ctrl.submit
)

router.get('/track', trackLimiter, validate(v.track), ctrl.track)

// UPI direct-QR payment (primary)
router.get('/upi-config', ctrl.upiConfig)
router.post(
  '/:id/payment-proof',
  trackLimiter,
  validate(v.paymentProof),
  ctrl.submitPaymentProof
)

// Razorpay (optional / backup gateway)
router.post('/:id/pay', trackLimiter, validate(v.payCreate), ctrl.createPayment)
router.post('/:id/verify', trackLimiter, validate(v.payVerify), ctrl.verifyPayment)

module.exports = router
