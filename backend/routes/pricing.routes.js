const router = require('express').Router()
const ctrl = require('../controllers/pricing.controller')
const { validate } = require('../middleware/validate')
const v = require('../validators/pricing.validator')

// Public — pricing is marketing content.
router.get('/', ctrl.table)
router.post('/calculate', validate(v.calculate), ctrl.calculate)

module.exports = router
