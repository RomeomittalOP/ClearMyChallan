// =====================================================================
// Razorpay client integration
// =====================================================================
// Wraps the Razorpay Node SDK with our own helpers. Verifies payment
// signatures using HMAC-SHA256 (no SDK call needed for that).
//
// Env vars used:
//   RAZORPAY_KEY_ID
//   RAZORPAY_KEY_SECRET
//   RAZORPAY_WEBHOOK_SECRET
//
// Until keys are provided the helpers throw a clear error so the
// frontend can show "Payments not configured" instead of crashing.
// =====================================================================

const crypto = require('crypto')
const Razorpay = require('razorpay')
const config = require('../config')
const logger = require('../utils/logger')

let _client = null

function getClient() {
  if (!config.razorpayConfigured) {
    throw new Error(
      'Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env'
    )
  }
  if (!_client) {
    _client = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret
    })
    logger.info('💳 Razorpay client initialized')
  }
  return _client
}

/**
 * Create a Razorpay order.
 * @param {Object} opts
 * @param {Number} opts.amount     Amount in paise (₹1 = 100 paise).
 * @param {String} [opts.currency] Default 'INR'.
 * @param {String} [opts.receipt]  Internal receipt id (max 40 chars).
 * @param {Object} [opts.notes]    Free-form metadata stored on the order.
 */
async function createOrder({ amount, currency = 'INR', receipt, notes = {} }) {
  const client = getClient()
  return client.orders.create({
    amount,
    currency,
    receipt: receipt?.slice(0, 40),
    payment_capture: 1,
    notes
  })
}

/**
 * Verify a payment signature returned by Razorpay Checkout.
 * Returns true on match.
 */
function verifyPaymentSignature({ orderId, paymentId, signature }) {
  if (!config.razorpay.keySecret) return false
  const body = `${orderId}|${paymentId}`
  const expected = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(body)
    .digest('hex')
  return safeEqual(expected, signature)
}

/**
 * Verify a webhook signature using RAZORPAY_WEBHOOK_SECRET.
 * The webhook handler must read the raw body (Buffer) for this to work.
 */
function verifyWebhookSignature(rawBody, signature) {
  if (!config.razorpay.webhookSecret) return false
  const expected = crypto
    .createHmac('sha256', config.razorpay.webhookSecret)
    .update(rawBody)
    .digest('hex')
  return safeEqual(expected, signature)
}

function safeEqual(a, b) {
  if (!a || !b) return false
  const ab = Buffer.from(String(a))
  const bb = Buffer.from(String(b))
  if (ab.length !== bb.length) return false
  return crypto.timingSafeEqual(ab, bb)
}

module.exports = {
  getClient,
  createOrder,
  verifyPaymentSignature,
  verifyWebhookSignature
}
