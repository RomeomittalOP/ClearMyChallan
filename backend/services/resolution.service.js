// =====================================================================
// Resolution Request service
// =====================================================================
// Encapsulates the lifecycle of a resolution case.
// =====================================================================

const ResolutionRequest = require('../models/ResolutionRequest')
const Challan = require('../models/Challan')
const { ApiError } = require('../utils/apiResponse')

async function create({ user, vehicleNumber, challanIds }) {
  const challans = await Challan.find({ _id: { $in: challanIds } })
  if (challans.length === 0) {
    throw new ApiError('No valid challans selected', 400)
  }

  const totalFine = challans.reduce((s, c) => s + (c.fineAmount || 0), 0)
  const totalLegalFee = challans.reduce((s, c) => s + (c.legalFee || 0), 0)
  // totalPayable is the real charge; fall back to legalFee for older docs.
  const totalPayable = challans.reduce(
    (s, c) => s + (c.totalPayable || c.legalFee || 0),
    0
  )

  const req = await ResolutionRequest.create({
    user: user._id,
    vehicleNumber: vehicleNumber.toUpperCase(),
    challans: challans.map((c) => c._id),
    totalFine,
    totalLegalFee,
    totalPayable,
    status: 'pending',
    statusHistory: [{ status: 'pending', by: user._id }]
  })

  return req.populate('challans')
}

async function listForUser(userId) {
  return ResolutionRequest.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate('challans')
    .populate('payment')
}

async function getById(id, { userId, asAdmin = false } = {}) {
  const q = ResolutionRequest.findById(id)
    .populate('challans')
    .populate('payment')
    .populate('assignedAdvocate', 'name email phone role')
  const doc = await q
  if (!doc) throw new ApiError('Resolution request not found', 404)
  if (!asAdmin && doc.user.toString() !== userId.toString()) {
    throw new ApiError('Not allowed', 403)
  }
  return doc
}

async function updateStatus({ id, status, note, actor }) {
  const req = await ResolutionRequest.findById(id)
  if (!req) throw new ApiError('Resolution request not found', 404)

  if (!ResolutionRequest.STATUS.includes(status)) {
    throw new ApiError('Invalid status', 400)
  }

  req.status = status
  req.statusHistory.push({ status, by: actor?._id })
  if (note) {
    req.notes.push({ author: actor?._id, message: note })
  }
  await req.save()
  return req
}

async function addNote({ id, message, actor }) {
  const req = await ResolutionRequest.findById(id)
  if (!req) throw new ApiError('Resolution request not found', 404)
  req.notes.push({ author: actor._id, message })
  await req.save()
  return req
}

async function setPayment(reqId, paymentId) {
  return ResolutionRequest.findByIdAndUpdate(
    reqId,
    { payment: paymentId },
    { new: true }
  )
}

// Assign (or reassign) a verified advocate to a request. The target must
// hold the 'advocate' (or 'admin') role.
async function assignAdvocate({ id, advocate, actor }) {
  const req = await ResolutionRequest.findById(id)
  if (!req) throw new ApiError('Resolution request not found', 404)

  req.assignedAdvocate = advocate._id
  // Moving into the queue → processing, unless already further along.
  if (['pending', 'in_review'].includes(req.status)) {
    req.status = 'processing'
    req.statusHistory.push({ status: 'processing', by: actor?._id })
  }
  req.notes.push({
    author: actor?._id,
    message: `Assigned to advocate ${advocate.name}.`
  })
  await req.save()
  return req.populate('assignedAdvocate', 'name email phone role')
}

// Cases assigned to a given advocate.
async function listForAdvocate(advocateId) {
  return ResolutionRequest.find({ assignedAdvocate: advocateId })
    .sort({ createdAt: -1 })
    .populate('challans')
    .populate('payment')
    .populate('user', 'name email phone')
}

module.exports = {
  create,
  listForUser,
  getById,
  updateStatus,
  addNote,
  setPayment,
  assignAdvocate,
  listForAdvocate
}
