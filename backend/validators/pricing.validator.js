const { body } = require('express-validator')

const calculate = [
  body('city').isString().trim().notEmpty().withMessage('City is required'),
  body('challanAmount')
    .isFloat({ min: 0 })
    .withMessage('challanAmount must be a positive number')
]

module.exports = { calculate }
