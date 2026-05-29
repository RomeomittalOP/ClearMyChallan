const asyncHandler = require('../utils/asyncHandler')
const { success, created } = require('../utils/apiResponse')
const resolutionService = require('../services/resolution.service')

exports.create = asyncHandler(async (req, res) => {
  const { vehicleNumber, challanIds } = req.body
  const doc = await resolutionService.create({
    user: req.user,
    vehicleNumber,
    challanIds
  })
  return created(res, { request: doc }, 'Resolution request created')
})

exports.listMine = asyncHandler(async (req, res) => {
  const items = await resolutionService.listForUser(req.user._id)
  return success(res, { requests: items })
})

exports.getById = asyncHandler(async (req, res) => {
  const doc = await resolutionService.getById(req.params.id, {
    userId: req.user._id,
    asAdmin: req.user.role === 'admin'
  })
  return success(res, { request: doc })
})

exports.addNote = asyncHandler(async (req, res) => {
  const doc = await resolutionService.addNote({
    id: req.params.id,
    message: req.body.message,
    actor: req.user
  })
  return success(res, { request: doc }, 'Note added')
})

// GET /api/resolutions/assigned — advocate's own caseload.
exports.listAssigned = asyncHandler(async (req, res) => {
  const items = await resolutionService.listForAdvocate(req.user._id)
  return success(res, { requests: items })
})

// PATCH /api/resolutions/:id/status — advocate/admin updates case status.
exports.updateStatus = asyncHandler(async (req, res) => {
  const doc = await resolutionService.updateStatus({
    id: req.params.id,
    status: req.body.status,
    note: req.body.note,
    actor: req.user
  })
  return success(res, { request: doc }, 'Status updated')
})
