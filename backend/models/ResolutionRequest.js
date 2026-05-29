// =====================================================================
// ResolutionRequest model
// =====================================================================
// Created when a user clicks "Proceed With Resolution" for one or more
// challans. Drives the admin/advocate workflow.
// =====================================================================

const mongoose = require('mongoose')

const STATUS = ['pending', 'in_review', 'processing', 'resolved', 'rejected']

const resolutionRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    vehicleNumber: { type: String, required: true, uppercase: true, trim: true },

    challans: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Challan', required: true }
    ],

    // Pricing snapshot at the moment of request (so later edits to
    // upstream challans don't change billed amount).
    totalFine: { type: Number, required: true, min: 0 },
    totalLegalFee: { type: Number, required: true, min: 0 },
    // What the user actually pays us (sum of each challan's totalPayable).
    totalPayable: { type: Number, required: true, min: 0, default: 0 },

    status: {
      type: String,
      enum: STATUS,
      default: 'pending',
      index: true
    },

    // Linked payment, if any.
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null
    },

    assignedAdvocate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    notes: [
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: { type: String, required: true },
        at: { type: Date, default: Date.now }
      }
    ],

    statusHistory: [
      {
        status: { type: String, enum: STATUS },
        at: { type: Date, default: Date.now },
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      }
    ]
  },
  { timestamps: true }
)

resolutionRequestSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_, ret) {
    ret.id = ret._id
    delete ret._id
    return ret
  }
})

resolutionRequestSchema.statics.STATUS = STATUS

module.exports = mongoose.model('ResolutionRequest', resolutionRequestSchema)
