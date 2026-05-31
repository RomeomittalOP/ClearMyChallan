const asyncHandler = require('../utils/asyncHandler')
const { success } = require('../utils/apiResponse')
const challanService = require('../services/challan.service')

// POST /api/challans/lookup
// Public route (optionalAuth) so the homepage hero can fetch challans
// before sign-up. If a user is logged in we tag the cached docs to them.
exports.lookup = asyncHandler(async (req, res) => {
  const { vehicleNumber } = req.body
  const userId = req.user?._id || null
  const result = await challanService.lookup(vehicleNumber, userId)
  return success(res, result, 'Challans fetched')
})

exports.byId = asyncHandler(async (req, res) => {
  const c = await challanService.getById(req.params.id)
  if (!c) return res.status(404).json({ success: false, message: 'Not found' })
  return success(res, { challan: c.toJSON() })
})
