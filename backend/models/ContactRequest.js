// =====================================================================
// ContactRequest model
// =====================================================================
// Submissions from the "Talk to an Advocate" / contact widget.
// =====================================================================

const mongoose = require('mongoose')

const contactRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    channel: {
      type: String,
      enum: ['whatsapp', 'call', 'email', 'web'],
      default: 'web'
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'closed'],
      default: 'new',
      index: true
    },
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
)

contactRequestSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(_, ret) {
    ret.id = ret._id
    delete ret._id
    return ret
  }
})

module.exports = mongoose.model('ContactRequest', contactRequestSchema)
