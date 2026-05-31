const ContactRequest = require('../models/ContactRequest')

async function create(payload) {
  return ContactRequest.create(payload)
}

async function list({ status } = {}) {
  const q = {}
  if (status) q.status = status
  return ContactRequest.find(q).sort({ createdAt: -1 })
}

async function setStatus(id, status, handlerId) {
  return ContactRequest.findByIdAndUpdate(
    id,
    { status, handledBy: handlerId },
    { new: true }
  )
}

module.exports = { create, list, setStatus }
