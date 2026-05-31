// =====================================================================
// Payment model — Razorpay-backed transactions
// =====================================================================
// Stores the lifecycle of a single payment attempt for a resolution
// request. Webhook + verification endpoints update `status`.
// =====================================================================

const mongoose = require('mongoose')

const PAYMENT_STATUS = ['created', 'attempted', 'paid', 'failed', 'refunded']

const paymentSchema = new mongoose.Schema(
  {
    // Anonymous case-flow payments don't have a registered user, so this
    // is optional now. (Legacy advocate-flow still sets it.)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    // Legacy advocate-flow link (kept for backward compat).
    resolutionRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResolutionRequest',
      default: null,
      index: true
    },
    // New manual-upload flow link.
    case: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CaseSubmission',
      default: null,
      index: true
    },

    // Stored in paise (Razorpay native unit).
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },

    // Razorpay identifiers
    orderId: { type: String, index: true }, // order_xxx
    paymentId: { type: String, index: true }, // pay_xxx
    signature: { type: String },
    method: { type: String, default: 'upi' }, // upi / card / netbanking

    status: {
      type: String,
      enum: PAYMENT_STATUS,
      default: 'created',
      index: true
    },

    // Raw webhook payload for audit (never returned to client).
    raw: { type: mongoose.Schema.Types.Mixed, select: false }
  },
  { timestamps: true }
)

paymentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_, ret) {
    ret.id = ret._id
    delete ret._id
    delete ret.raw
    delete ret.signature
    return ret
  }
})

paymentSchema.statics.STATUS = PAYMENT_STATUS

module.exports = mongoose.model('Payment', paymentSchema)
