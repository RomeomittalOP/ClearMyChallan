const asyncHandler = require('../utils/asyncHandler')
const { success, created } = require('../utils/apiResponse')
const contactService = require('../services/contact.service')

exports.create = asyncHandler(async (req, res) => {
  const doc = await contactService.create({
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,
    message: req.body.message,
    channel: req.body.channel || 'web'
  })
  return created(res, { contact: doc }, "We'll reach out shortly")
})
