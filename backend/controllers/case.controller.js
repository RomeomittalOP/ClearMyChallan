const asyncHandler = require('../utils/asyncHandler')
const { success, created, fail, ApiError } = require('../utils/apiResponse')
const caseService = require('../services/case.service')
const config = require('../config')
const {
  createOrder,
  verifyPaymentSignature
} = require('../integrations/razorpayClient')
const Payment = require('../models/Payment')

// POST /api/cases/submit  (multipart: rc + challan + name/mobile/email)
exports.submit = asyncHandler(async (req, res) => {
  const rcFile = req.files?.rc?.[0]
  const challanFile = req.files?.challan?.[0] // optional
  if (!rcFile) return fail(res, 'RC document is required', 400)

  const doc = await caseService.submit({
    name: req.body.name,
    mobile: req.body.mobile,
    email: req.body.email,
    vehicleNumber: req.body.vehicleNumber || '',
    challanNumber: req.body.challanNumber || '',
    rcFile,
    challanFile,
    user: req.user || null
  })

  return created(
    res,
    {
      caseId: doc.caseId,
      status: doc.status,
      createdAt: doc.createdAt,
      message:
        'Documents received successfully. Our advocate will review your case and contact you within 24 hours.'
    },
    'Submission received'
  )
})

// GET /api/cases/track?mobile=... or ?caseId=...
exports.track = asyncHandler(async (req, res) => {
  const data = await caseService.track({
    mobile: req.query.mobile,
    caseId: req.query.caseId
  })
  return success(res, data, 'Case found')
})

// GET /api/cases/upi-config — public; the track page reads this to render the QR.
exports.upiConfig = asyncHandler(async (_req, res) => {
  return success(res, {
    configured: !!config.upi.id,
    upiId: config.upi.id || '',
    payeeName: config.upi.payeeName || 'ClearMyChallan'
  })
})

// POST /api/cases/:id/payment-proof  { utr, note? }
// Customer-side: after scanning the QR and paying, they paste UTR here.
exports.submitPaymentProof = asyncHandler(async (req, res) => {
  const doc = await caseService.submitPaymentProof({
    idOrCaseId: req.params.id,
    utr: req.body.utr,
    note: req.body.note
  })
  return success(
    res,
    {
      caseId: doc.caseId,
      status: doc.status,
      paymentReference: doc.paymentReference,
      paymentSubmittedAt: doc.paymentSubmittedAt
    },
    'Payment details submitted. Our advocate will verify and confirm shortly.'
  )
})

// POST /api/cases/:id/pay  →  Razorpay order
// :id can be a Mongo _id or the human caseId (CMC-YYYY-NNNNNN).
exports.createPayment = asyncHandler(async (req, res) => {
  if (!config.razorpayConfigured) {
    return fail(res, 'Payments are not configured on the server', 503)
  }
  const doc = await caseService.findByIdOrCaseId(req.params.id)
  if (!doc.quotedPrice || doc.quotedPrice <= 0) {
    return fail(res, 'No quoted price yet on this case', 400)
  }
  if (doc.status === 'Payment Received' || doc.status === 'Completed') {
    return fail(res, 'This case is already paid for', 409)
  }

  const amountPaise = Math.round(doc.quotedPrice * 100)
  const order = await createOrder({
    amount: amountPaise,
    currency: 'INR',
    receipt: `case_${doc.caseId}`.slice(0, 40),
    notes: { caseId: doc.caseId, mobile: doc.mobile, email: doc.email }
  })

  const payment = await Payment.create({
    user: doc.user || null,
    case: doc._id,
    amount: amountPaise,
    currency: 'INR',
    orderId: order.id,
    status: 'created'
  })

  return created(res, {
    payment,
    razorpay: {
      keyId: config.razorpay.keyId,
      orderId: order.id,
      amount: amountPaise,
      currency: 'INR'
    },
    prefill: { name: doc.name, contact: doc.mobile, email: doc.email }
  })
})

// POST /api/cases/:id/verify  →  HMAC check + mark paid
exports.verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentId, signature } = req.body
  if (!verifyPaymentSignature({ orderId, paymentId, signature })) {
    throw new ApiError('Payment signature mismatch', 400)
  }

  const payment = await Payment.findOne({ orderId })
  if (!payment) throw new ApiError('Payment not found', 404)

  payment.paymentId = paymentId
  payment.signature = signature
  payment.status = 'paid'
  await payment.save()

  // Verify endpoint also accepts either Mongo _id or caseId → resolve first.
  const target = await caseService.findByIdOrCaseId(req.params.id)
  const updated = await caseService.markPaid({ id: target._id, payment })
  return success(res, { payment, case: updated }, 'Payment verified')
})
