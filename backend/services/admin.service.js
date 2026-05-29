// Admin dashboard helpers — aggregations + bulk reads.
const User = require('../models/User')
const ResolutionRequest = require('../models/ResolutionRequest')
const Payment = require('../models/Payment')
const ContactRequest = require('../models/ContactRequest')

async function listUsers({ page = 1, limit = 50, role } = {}) {
  const q = role ? { role } : {}
  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    User.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(q)
  ])
  return { items, total, page, limit }
}

async function listRequests({ status, page = 1, limit = 50 } = {}) {
  const q = status ? { status } : {}
  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    ResolutionRequest.find(q)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email phone')
      .populate('challans')
      .populate('payment'),
    ResolutionRequest.countDocuments(q)
  ])
  return { items, total, page, limit }
}

async function listPayments({ status, page = 1, limit = 50 } = {}) {
  const q = status ? { status } : {}
  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    Payment.find(q)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email phone')
      .populate('resolutionRequest'),
    Payment.countDocuments(q)
  ])
  return { items, total, page, limit }
}

async function analyticsSummary() {
  const [
    userCount,
    requestCount,
    paidPayments,
    revenueAgg,
    statusAgg,
    contactCount
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    ResolutionRequest.countDocuments(),
    Payment.countDocuments({ status: 'paid' }),
    Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    ResolutionRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    ContactRequest.countDocuments()
  ])

  const revenuePaise = revenueAgg[0]?.total || 0
  return {
    userCount,
    requestCount,
    paidPayments,
    revenue: revenuePaise / 100, // in rupees
    contactCount,
    requestsByStatus: statusAgg.reduce((acc, r) => {
      acc[r._id] = r.count
      return acc
    }, {})
  }
}

module.exports = {
  listUsers,
  listRequests,
  listPayments,
  analyticsSummary
}
