const asyncHandler = require('../utils/asyncHandler')
const { success, created } = require('../utils/apiResponse')
const authService = require('../services/auth.service')

exports.signup = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body
  const result = await authService.signup({ name, email, password, phone })
  return created(res, result, 'Account created')
})

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const result = await authService.login({ email, password })
  return success(res, result, 'Logged in')
})

exports.me = asyncHandler(async (req, res) => {
  return success(res, { user: req.user.toJSON() })
})

exports.updateProfile = asyncHandler(async (req, res) => {
  const updated = await authService.updateProfile(req.user._id, req.body)
  return success(res, { user: updated.toJSON() }, 'Profile updated')
})
