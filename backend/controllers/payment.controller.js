const asyncHandler = require('../utils/asyncHandler')
const { success, created, fail } = require('../utils/apiResponse')
const paymentService = require('../services/payment.service')
const config = require('../config')
const {
  verifyWebhookSignature
} = require('../integrations/razorpayClient')

// POST /api/payments/order
// Creates a Razorpay order for a resolution request and returns the
// public key + orderId so the frontend can launch Razorpay Checkout.
exports.createOrder = asyncHandler(async (req, res) => {
  const { resolutionRequestId } = req.body
  const result = await paymentService.createForResolution({
    resolutionRequestId,
    user: req.user
  })
  return created(res, result, 'Order created')
})

// POST /api/payments/verify
// Frontend calls this after Razorpay Checkout success.
exports.verify = asyncHandler(async (req, res) => {
  const { orderId, paymentId, signature } = req.body
  const payment = await paymentService.verifyAndMarkPaid({
    orderId,
    paymentId,
    signature,
    user: req.user
  })
  return success(res, { payment }, 'Payment verified')
})

// POST /api/payments/webhook
// Razorpay → server. Express must mount this route with raw body parser
// (see server.js) so we can validate the HMAC.
exports.webhook = asyncHandler(async (req, res) => {
  const sig = req.headers['x-razorpay-signature']
  const raw = req.rawBody // captured by raw body parser
  if (!verifyWebhookSignature(raw, sig)) {
    return fail(res, 'Invalid webhook signature', 400)
  }
  const result = await paymentService.handleWebhookEvent(req.body)
  return res.status(200).json({ received: true, ...result })
})

// GET /api/payments/me
exports.listMine = asyncHandler(async (req, res) => {
  const payments = await paymentService.listForUser(req.user._id)
  return success(res, { payments })
})

// GET /api/payments/config
// Public — gives the frontend the Razorpay key id to bootstrap Checkout.
exports.publicConfig = asyncHandler(async (_req, res) => {
  return success(res, {
    razorpayConfigured: config.razorpayConfigured,
    keyId: config.razorpay.keyId || null
  })
})
