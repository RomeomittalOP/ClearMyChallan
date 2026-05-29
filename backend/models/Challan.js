// =====================================================================
// Challan model
// =====================================================================
// Cached challans returned from the external provider. We persist them
// so the dashboard, payments and resolution requests can reference a
// stable internal _id even after the upstream API expires the record.
// =====================================================================

const mongoose = require('mongoose')

const challanSchema = new mongoose.Schema(
  {
    // External challan number from the source authority.
    externalId: { type: String, required: true, index: true },

    vehicleNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true
    },

    violation: { type: String, required: true },
    fineAmount: { type: Number, required: true, min: 0 },
    legalFee: { type: Number, required: true, min: 0 }, // = resolutionFee (kept for compat)

    // City-based resolution pricing (from services/pricingCalculator.js)
    city: { type: String, default: '' },
    region: { type: String, default: '' },
    resolutionFee: { type: Number, default: 0 },
    totalPayable: { type: Number, default: 0 },
    pricingType: {
      type: String,
      enum: ['flat_percent', 'fine_plus_fee', 'default_estimate', ''],
      default: ''
    },
    pricingDescription: { type: String, default: '' },
    savings: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ['Pending', 'Disputed', 'Resolved', 'Cancelled'],
      default: 'Pending'
    },
    date: { type: String }, // human-readable date from upstream
    issuedAt: { type: Date },
    location: { type: String, default: '' },
    authority: { type: String, default: '' },
    state: { type: String, default: '' },

    // Snapshot of the raw upstream payload for audit / debugging.
    rawPayload: { type: mongoose.Schema.Types.Mixed, select: false },

    // Optional link to the user who fetched / acted on this challan.
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }
  },
  { timestamps: true }
)

challanSchema.index({ externalId: 1, vehicleNumber: 1 }, { unique: true })

challanSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_, ret) {
    ret.id = ret._id
    delete ret._id
    delete ret.rawPayload
    return ret
  }
})

module.exports = mongoose.model('Challan', challanSchema)
