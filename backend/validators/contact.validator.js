const { body } = require('express-validator')

const create = [
  body('name').trim().isLength({ min: 2, max: 80 }),
  body('phone').isMobilePhone('en-IN').withMessage('Valid Indian phone required'),
  body('email').optional({ checkFalsy: true }).isEmail().normalizeEmail(),
  body('message').isString().trim().isLength({ min: 5, max: 1000 }),
  body('channel').optional().isIn(['whatsapp', 'call', 'email', 'web'])
]

module.exports = { create }
