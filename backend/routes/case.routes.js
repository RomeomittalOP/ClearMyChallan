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

// ---- Public ---------------------------------------------------------

// Submission accepts multipart form data, then validates the text fields.
router.post(
  '/submit',
  submitLimiter,
  optionalAuth, // attach user if a logged-in user is submitting
  caseDocs,
  uploadErrorHandler,
  validate(v.submit),
  ctrl.submit
)

// Track by mobile or caseId (no auth needed; rate-limited to deter scraping).
router.get('/track', trackLimiter, validate(v.track), ctrl.track)

// Payment (initiated from the track page after admin quotes a price).
router.post(
  '/:id/pay',
  trackLimiter,
  validate(v.payCreate),
  ctrl.createPayment
)
router.post(
  '/:id/verify',
  trackLimiter,
  validate(v.payVerify),
  ctrl.verifyPayment
)

module.exports = router
