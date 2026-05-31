const { body, param } = require('express-validator')

const createOrder = [
  body('resolutionRequestId')
    .isMongoId()
    .withMessage('Valid resolution request id required')
]

const verify = [
  body('orderId').isString().notEmpty(),
  body('paymentId').isString().notEmpty(),
  body('signature').isString().notEmpty()
]

const byId = [param('id').isMongoId()]

module.exports = { createOrder, verify, byId }
