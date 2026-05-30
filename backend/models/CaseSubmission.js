// =====================================================================
// CaseSubmission model — the document-upload (manual review) flow.
// =====================================================================
// Created when a visitor uploads their RC + Challan with name/mobile/email.
// Drives the admin's review → quote → payment → process → resolve loop.
// =====================================================================

const mongoose = require('mongoose')

const STATUS = [
  'Pending Review',
  'Under Review',
  'Price Quoted',
  'Payment Received',
  'Case Processing',
  'Completed',
  'Cancelled'
]

const fileSubSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    resourceType: { type: String, default: 'image' }, // 'image' or 'raw' (for PDF)
    mimeType: { type: String, default: '' },
    bytes: { type: Number, default: 0 },
    originalName: { type: String, default: '' },
    uploadedAt: { type: Date, default: Date.now }
  },
  { _id: false }
)

const noteSubSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authorName: { type: String, default: '' }, // snapshot for display
    message: { type: String, required: true, maxlength: 2000 },
    at: { type: Date, default: Date.now }
  },
  { _id: true }
)

const statusEntrySchema = new mongoose.Schema(
  {
    status: { type: String, enum: STATUS },
    at: { type: Date, default: Date.now },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { _id: false }
)

const caseSubmissionSchema = new mongoose.Schema(
  {
    // Public-facing identifier (e.g. "CMC-2026-000123")
    caseId: { type: String, required: true, unique: true, index: true },

    // Submitter
    name: { type: String, required: true, trim: true, maxlength: 120 },
    mobile: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },

    // Documents
    rc: { type: fileSubSchema, required: true },
    challan: { type: fileSubSchema, required: true },

    // Workflow
    status: { type: String, enum: STATUS, default: 'Pending Review', index: true },
    quotedPrice: { type: Number, default: 0, min: 0 }, // rupees (whole)
    advocateNotes: { type: [noteSubSchema], default: [] },
    statusHistory: { type: [statusEntrySchema], default: [] },

    assignedAdvocate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    // Linked payment (when status reaches "Payment Received")
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null },
    paidAt: { type: Date, default: null },

    // Notification bookkeeping (in-app "new" indicator for admins)
    notifiedAdmin: { type: Boolean, default: false },

    // Optional user link (if a registered user submits while logged in)
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
)

caseSubmissionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_, ret) {
    ret.id = ret._id
    delete ret._id
    return ret
  }
})

caseSubmissionSchema.statics.STATUS = STATUS

module.exports = mongoose.model('CaseSubmission', caseSubmissionSchema)
