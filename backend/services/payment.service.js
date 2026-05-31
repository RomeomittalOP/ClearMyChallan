// =====================================================================
// Payment service — Razorpay
// =====================================================================
// Creates orders, verifies signatures and updates DB rows.
// =====================================================================

const Payment = require('../models/Payment')
const ResolutionRequest = require('../models/ResolutionRequest')
const config = require('../config')
const {
  createOrder,
  verifyPaymentSignature
} = require('../integrations/razorpayClient')
const { ApiError } = require('../utils/apiResponse')
const { setPayment } = require('./resolution.service')

/**
 * Create a Razorpay order tied to a resolution request.
 * Amount = totalLegalFee (advocate fee). Fines are paid to authorities
 * separately by the assigned advocate.
 */
async function createForResolution({ resolutionRequestId, user }) {
  if (!config.razorpayConfigured) {
    throw new ApiError('Payments are not configured on the server', 503)
  }

  const reqDoc = await ResolutionRequest.findById(resolutionRequestId)
  if (!reqDoc) throw new ApiError('Resolution request not found', 404)
  if (reqDoc.user.toString() !== user._id.toString()) {
    throw new ApiError('Not allowed', 403)
  }
  // Charge totalPayable (correct for both flat-percent and fine+fee challans);
  // fall back to totalLegalFee for requests created before this field existed.
  const chargeRupees = reqDoc.totalPayable || reqDoc.totalLegalFee
  if (chargeRupees <= 0) {
    throw new ApiError('Nothing to pay for this request', 400)
  }

  const amountPaise = Math.round(chargeRupees * 100)
  const receipt = `cr_${reqDoc._id.toString().slice(-10)}`

  const order = await createOrder({
    amount: amountPaise,
    currency: 'INR',
    receipt,
    notes: {
      resolutionRequestId: reqDoc._id.toString(),
      vehicle: reqDoc.vehicleNumber,
      userId: user._id.toString()
    }
  })

  const payment = await Payment.create({
    user: user._id,
    resolutionRequest: reqDoc._id,
    amount: amountPaise,
    currency: 'INR',
    orderId: order.id,
    status: 'created'
  })

  await setPayment(reqDoc._id, payment._id)

  return {
    payment,
    razorpay: {
      keyId: config.razorpay.keyId,
      orderId: order.id,
      amount: amountPaise,
      currency: 'INR'
    }
  }
}

/**
 * Confirm a payment from the frontend after Razorpay Checkout success.
 * Verifies the signature and marks the payment paid.
 */
async function verifyAndMarkPaid({ orderId, paymentId, signature, user }) {
  const ok = verifyPaymentSignature({ orderId, paymentId, signature })
  if (!ok) throw new ApiError('Payment signature mismatch', 400)

  const payment = await Payment.findOne({ orderId })
  if (!payment) throw new ApiError('Payment not found', 404)
  if (payment.user.toString() !== user._id.toString()) {
    throw new ApiError('Not allowed', 403)
  }

  payment.paymentId = paymentId
  payment.signature = signature
  payment.status = 'paid'
  await payment.save()

  // Auto-advance the linked resolution request to "in_review".
  await ResolutionRequest.findByIdAndUpdate(payment.resolutionRequest, {
    $set: { status: 'in_review' },
    $push: {
      statusHistory: { status: 'in_review', by: user._id, at: new Date() }
    }
  })

  return payment
}

/**
 * Webhook payload handler. The raw body is verified upstream; we only
 * persist state transitions here.
 */
async function handleWebhookEvent(event) {
  const type = event?.event
  const payload = event?.payload?.payment?.entity
  if (!payload) return { ignored: true }

  const payment = await Payment.findOne({ orderId: payload.order_id })
  if (!payment) return { ignored: true }

  if (type === 'payment.captured' || type === 'payment.authorized') {
    payment.status = 'paid'
    payment.paymentId = payload.id
    payment.method = payload.method
  } else if (type === 'payment.failed') {
    payment.status = 'failed'
  }
  payment.raw = event
  await payment.save()
  return { ok: true, status: payment.status }
}

async function listForUser(userId) {
  return Payment.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate('resolutionRequest')
}

module.exports = {
  createForResolution,
  verifyAndMarkPaid,
  handleWebhookEvent,
  listForUser
}
