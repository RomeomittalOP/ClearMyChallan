// Atomic counter (used to generate sequential, year-prefixed case IDs).
const mongoose = require('mongoose')

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g. "case-2026"
  seq: { type: Number, default: 0 }
})

counterSchema.statics.next = async function (key) {
  const doc = await this.findByIdAndUpdate(
    key,
    { $inc: { seq: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )
  return doc.seq
}

module.exports = mongoose.model('Counter', counterSchema)
