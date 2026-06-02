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

const fileSubSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  resourceType: { type: String, default: 'image' },
  mimeType: { type: String, default: '' },
  bytes: { type: Number, default: 0 },
  originalName: { type: String, default: '' },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false })

const noteSubSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: { type: String, default: '' },
  message: { type: String, required: true, maxlength: 2000 },
  at: { type: Date, default: Date.now }
}, { _id: true })

const statusEntrySchema = new mongoose.Schema({
  status: { type: String, enum: STATUS },
  at: { type: Date, default: Date.now },
  by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { _id: false })

const caseSubmissionSchema = new mongoose.Schema({
  caseId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  mobile: { type: String, required: true, trim: true, index: true },
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  // Optional context fields — help admin search/identify faster.
  vehicleNumber: { type: String, default: '', uppercase: true, trim: true, index: true },
  challanNumber: { type: String, default: '', trim: true, index: true },
  rc: { type: fileSubSchema, required: true },
  // Challan is optional — many users submit RC + details upfront, advocate
  // collects challan separately via WhatsApp or sees it on Parivahan.
  challan: { type: fileSubSchema, default: null },
  status: { type: String, enum: STATUS, default: 'Pending Review', index: true },
  quotedPrice: { type: Number, default: 0, min: 0 },
  advocateNotes: { type: [noteSubSchema], default: [] },
  statusHistory: { type: [statusEntrySchema], default: [] },
  assignedAdvocate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null },
  paidAt: { type: Date, default: null },
  // UPI manual payment — customer submits UTR after scanning the QR
  paymentReference: { type: String, default: '', trim: true, index: true },
  paymentNote: { type: String, default: '', trim: true, maxlength: 500 },
  paymentSubmittedAt: { type: Date, default: null },
  notifiedAdmin: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true })

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
