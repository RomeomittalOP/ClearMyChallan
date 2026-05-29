const asyncHandler = require('../utils/asyncHandler')
const { success, fail } = require('../utils/apiResponse')
const adminService = require('../services/admin.service')
const resolutionService = require('../services/resolution.service')
const contactService = require('../services/contact.service')
const User = require('../models/User')

exports.users = asyncHandler(async (req, res) => {
  const data = await adminService.listUsers({
    page: parseInt(req.query.page) || 1,
    limit: Math.min(parseInt(req.query.limit) || 50, 200),
    role: req.query.role
  })
  return success(res, data)
})

exports.requests = asyncHandler(async (req, res) => {
  const data = await adminService.listRequests({
    status: req.query.status,
    page: parseInt(req.query.page) || 1,
    limit: Math.min(parseInt(req.query.limit) || 50, 200)
  })
  return success(res, data)
})

exports.payments = asyncHandler(async (req, res) => {
  const data = await adminService.listPayments({
    status: req.query.status,
    page: parseInt(req.query.page) || 1,
    limit: Math.min(parseInt(req.query.limit) || 50, 200)
  })
  return success(res, data)
})

exports.summary = asyncHandler(async (req, res) => {
  const data = await adminService.analyticsSummary()
  return success(res, data)
})

exports.updateRequestStatus = asyncHandler(async (req, res) => {
  const updated = await resolutionService.updateStatus({
    id: req.params.id,
    status: req.body.status,
    note: req.body.note,
    actor: req.user
  })
  return success(res, { request: updated }, 'Status updated')
})

// GET /api/admin/advocates — list users who can be assigned to cases.
exports.advocates = asyncHandler(async (_req, res) => {
  const items = await User.find({ role: { $in: ['advocate', 'admin'] } })
    .select('name email phone role')
    .sort({ name: 1 })
  return success(res, { items })
})

// PATCH /api/admin/requests/:id/assign  { advocateId }
exports.assignAdvocate = asyncHandler(async (req, res) => {
  const advocate = await User.findById(req.body.advocateId)
  if (!advocate) return fail(res, 'Advocate not found', 404)
  if (!['advocate', 'admin'].includes(advocate.role)) {
    return fail(res, 'Selected user is not an advocate', 400)
  }
  const updated = await resolutionService.assignAdvocate({
    id: req.params.id,
    advocate,
    actor: req.user
  })
  return success(res, { request: updated }, 'Advocate assigned')
})

exports.contacts = asyncHandler(async (req, res) => {
  const items = await contactService.list({ status: req.query.status })
  return success(res, { items })
})

exports.updateContact = asyncHandler(async (req, res) => {
  const doc = await contactService.setStatus(
    req.params.id,
    req.body.status,
    req.user._id
  )
  return success(res, { contact: doc })
})
