const { body, param } = require('express-validator')
const ResolutionRequest = require('../models/ResolutionRequest')

const create = [
  body('vehicleNumber').trim().toUpperCase().notEmpty(),
  body('challanIds')
    .isArray({ min: 1 })
    .withMessage('At least one challan is required'),
  body('challanIds.*').isMongoId().withMessage('Invalid challan id')
]

const updateStatus = [
  param('id').isMongoId(),
  body('status')
    .isIn(ResolutionRequest.STATUS)
    .withMessage(
      `Status must be one of: ${ResolutionRequest.STATUS.join(', ')}`
    ),
  body('note').optional().isString().isLength({ max: 500 })
]

const addNote = [
  param('id').isMongoId(),
  body('message').isString().trim().isLength({ min: 1, max: 500 })
]

const assignAdvocate = [
  param('id').isMongoId(),
  body('advocateId').isMongoId().withMessage('Valid advocate id required')
]

module.exports = { create, updateStatus, addNote, assignAdvocate }
