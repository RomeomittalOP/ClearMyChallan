const { body, param } = require('express-validator')
const { VEHICLE_REGEX } = require('./auth.validator')

const lookup = [
  body('vehicleNumber')
    .trim()
    .toUpperCase()
    .matches(VEHICLE_REGEX)
    .withMessage('Invalid vehicle number (e.g. DL10CA1234)'),
  body('chassis').optional().isString().isLength({ max: 25 })
]

const byId = [param('id').isMongoId().withMessage('Invalid challan id')]

module.exports = { lookup, byId }
