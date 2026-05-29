// Auth route validators (express-validator chains).
const { body } = require('express-validator')

const VEHICLE_REGEX = /^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{1,4}$/i

const signup = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('phone')
    .optional({ checkFalsy: true })
    .isMobilePhone('en-IN')
    .withMessage('Valid Indian phone number required')
]

const login = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isString().notEmpty().withMessage('Password required')
]

const updateProfile = [
  body('name').optional().trim().isLength({ min: 2, max: 80 }),
  body('phone').optional({ checkFalsy: true }).isMobilePhone('en-IN'),
  body('vehicles').optional().isArray(),
  body('vehicles.*.number')
    .optional()
    .trim()
    .matches(VEHICLE_REGEX)
    .withMessage('Invalid vehicle number')
]

module.exports = { signup, login, updateProfile, VEHICLE_REGEX }
