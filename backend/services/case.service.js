// =====================================================================
// Case service — document-upload (manual) flow.
// =====================================================================

const mongoose = require('mongoose')
const CaseSubmission = require('../models/CaseSubmission')
const Counter = require('../models/Counter')
const Payment = require('../models/Payment')
const { ApiError } = require('../utils/apiResponse')
const { uploadBuffer, destroy } = require('../integrations/cloudinaryClient')
const { notifyNewCase, notifyStatusChange } = require('./notifications.service')

// ---- Case ID generator ----------------------------------------------
// Format: CMC-YYYY-NNNNNN  (e.g. CMC-2026-000123).
async function nextCaseId() {
  const year = new Date().getFullYear()
  const seq = await Counter.next(`case-${year}`)
  return `CMC-${year}-${String(seq).padStart(6, '0')}`
}

// ---- Submit (public) ------------------------------------------------
async function submit({ name, mobile, email, rcFile, challanFile, user = null }) {
  if (!rcFile || !challanFile) {
    throw new ApiError('Both RC and Challan files are required', 400)
  }
  if (mongoose.connection.readyState !== 1) {
    throw new ApiError('Service temporarily unavailable — database not connected', 503)
  }

  // Reserve a case id BEFORE uploading so the Cloudinary folder is scoped.
  const caseId = await nextCaseId()

  let rcUploaded, challanUploaded
  try {
    ;[rcUploaded, challanUploaded] = await Promise.all([
      uploadBuffer(rcFile.buffer, {
        filename: rcFile.originalname,
        mimetype: rcFile.mimetype,
        folder: caseId,
        tag: 'rc'
      }),
      uploadBuffer(challanFile.buffer, {
        filename: challanFile.originalname,
        mimetype: challanFile.mimetype,
        folder: caseId,
        tag: 'challan'
      })
    ])

    const doc = await CaseSubmission.create({
      caseId,
      name,
      mobile,
      email,
      user: user?._id || null,
      rc: rcUploaded,
      challan: challanUploaded,
      status: 'Pending Review',
      statusHistory: [{ status: 'Pending Review', by: user?._id || null }]
    })

    // Fire-and-forget notifications (non-blocking on the request)
    notifyNewCase(doc).catch(() => {})

    return doc
  } catch (err) {
    // Roll back any successful uploads if the DB insert failed.
    if (rcUploaded) destroy(rcUploaded.publicId, rcUploaded.resourceType)
    if (challanUploaded) destroy(challanUploaded.publicId, challanUploaded.resourceType)
    throw err
  }
}

// ---- Track (public) -------------------------------------------------
async function track({ mobile, caseId }) {
  if (!mobile && !caseId) {
    throw new ApiError('Provide mobile number or case ID', 400)
  }

  const q = caseId ? { caseId } : { mobile }
  // For mobile lookups (one number can have multiple cases) we return the latest.
  const doc = await CaseSubmission.findOne(q)
    .sort({ createdAt: -1 })
    .populate('assignedAdvocate', 'name')

  if (!doc) throw new ApiError('No case found for the provided details', 404)

  // Hand back a slimmed, public-safe view (no file URLs, no payment internals).
  const latestNote = doc.advocateNotes[doc.advocateNotes.length - 1] || null
  return {
    caseId: doc.caseId,
    name: doc.name,
    mobile: doc.mobile,
    status: doc.status,
    quotedPrice: doc.quotedPrice || 0,
    latestNote: latestNote
      ? { message: latestNote.message, author: latestNote.authorName, at: latestNote.at }
      : null,
    statusHistory: doc.statusHistory.map((s) => ({ status: s.status, at: s.at })),
    assignedAdvocate: doc.assignedAdvocate?.name || null,
    paidAt: doc.paidAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  }
}

// ---- Admin: list with search ---------------------------------------
async function adminList({ search, status, page = 1, limit = 25 } = {}) {
  const q = {}
  if (status) q.status = status
  if (search) {
    const s = String(search).trim()
    const regex = new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    q.$or = [{ caseId: regex }, { mobile: regex }, { name: regex }, { email: regex }]
  }

  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    CaseSubmission.find(q)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-rc.publicId -challan.publicId')
      .populate('assignedAdvocate', 'name email'),
    CaseSubmission.countDocuments(q)
  ])
  return { items, total, page, limit }
}

async function adminGetById(id) {
  const doc = await CaseSubmission.findById(id)
    .populate('assignedAdvocate', 'name email phone')
    .populate('payment')
  if (!doc) throw new ApiError('Case not found', 404)
  return doc
}

async function adminUpdate({ id, patch, actor }) {
  const doc = await CaseSubmission.findById(id)
  if (!doc) throw new ApiError('Case not found', 404)

  const prevStatus = doc.status
  let statusChanged = false

  if (patch.status && CaseSubmission.STATUS.includes(patch.status)) {
    if (patch.status !== doc.status) {
      doc.status = patch.status
      doc.statusHistory.push({ status: patch.status, by: actor?._id })
      statusChanged = true
    }
  }
  if (patch.quotedPrice !== undefined && patch.quotedPrice !== null) {
    doc.quotedPrice = Math.max(0, Math.round(Number(patch.quotedPrice) || 0))
  }
  if (patch.note && patch.note.trim()) {
    doc.advocateNotes.push({
      author: actor?._id,
      authorName: actor?.name || 'Admin',
      message: patch.note.trim()
    })
  }
  if (patch.assignedAdvocate) {
    doc.assignedAdvocate = patch.assignedAdvocate
  }
  if (patch.notifiedAdmin !== undefined) {
    doc.notifiedAdmin = !!patch.notifiedAdmin
  }

  await doc.save()

  if (statusChanged) {
    notifyStatusChange(doc, prevStatus).catch(() => {})
  }
  return doc
}

async function markPaid({ id, payment }) {
  return CaseSubmission.findByIdAndUpdate(
    id,
    {
      $set: {
        payment: payment._id,
        status: 'Payment Received',
        paidAt: new Date()
      },
      $push: {
        statusHistory: { status: 'Payment Received', at: new Date() }
      }
    },
    { new: true }
  )
}

// ---- Admin: dashboard summary --------------------------------------
async function adminSummary() {
  const [total, statusAgg, revenueAgg, unread, latest] = await Promise.all([
    CaseSubmission.countDocuments(),
    CaseSubmission.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, totalPaise: { $sum: '$amount' } } }
    ]),
    CaseSubmission.countDocuments({ notifiedAdmin: false }),
    CaseSubmission.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('caseId name mobile status createdAt quotedPrice')
  ])

  const byStatus = statusAgg.reduce((acc, r) => {
    acc[r._id] = r.count
    return acc
  }, {})
  const revenueRupees = (revenueAgg[0]?.totalPaise || 0) / 100

  return {
    total,
    byStatus,
    pendingReview: byStatus['Pending Review'] || 0,
    underReview: byStatus['Under Review'] || 0,
    priceQuoted: byStatus['Price Quoted'] || 0,
    paymentReceived: byStatus['Payment Received'] || 0,
    caseProcessing: byStatus['Case Processing'] || 0,
    completed: byStatus['Completed'] || 0,
    cancelled: byStatus['Cancelled'] || 0,
    unread,
    revenue: revenueRupees,
    latest
  }
}

module.exports = {
  submit,
  track,
  adminList,
  adminGetById,
  adminUpdate,
  adminSummary,
  markPaid,
  nextCaseId
}
