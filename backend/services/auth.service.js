// =====================================================================
// Auth service
// =====================================================================
// Business logic for signup / login / token issuance.
// Controllers stay thin — they just translate HTTP to/from these calls.
// =====================================================================

const User = require('../models/User')
const { signToken } = require('../utils/jwt')
const { ApiError } = require('../utils/apiResponse')

async function signup({ name, email, password, phone }) {
  const exists = await User.findOne({ email })
  if (exists) throw new ApiError('Email already registered', 409)

  const user = new User({ name, email, phone })
  await user.setPassword(password)
  await user.save()

  return issueAuth(user)
}

async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash')
  if (!user) throw new ApiError('Invalid email or password', 401)

  const ok = await user.comparePassword(password)
  if (!ok) throw new ApiError('Invalid email or password', 401)

  user.lastLoginAt = new Date()
  await user.save()

  return issueAuth(user)
}

function issueAuth(user) {
  const token = signToken({ sub: user._id.toString(), role: user.role })
  return { token, user: user.toJSON() }
}

async function updateProfile(userId, patch) {
  const update = {}
  if (patch.name !== undefined) update.name = patch.name
  if (patch.phone !== undefined) update.phone = patch.phone
  if (patch.vehicles !== undefined) update.vehicles = patch.vehicles

  const user = await User.findByIdAndUpdate(userId, update, { new: true })
  if (!user) throw new ApiError('User not found', 404)
  return user
}

module.exports = { signup, login, updateProfile }
