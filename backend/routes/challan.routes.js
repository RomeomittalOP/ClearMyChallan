const router = require('express').Router()
const ctrl = require('../controllers/challan.controller')
const { validate } = require('../middleware/validate')
const v = require('../validators/challan.validator')
const { optionalAuth } = require('../middleware/auth')

// Public lookup (anonymous-friendly). When the user is logged in we
// optionally tag cached challans with their user id.
router.post('/lookup', optionalAuth, validate(v.lookup), ctrl.lookup)

router.get('/:id', validate(v.byId), ctrl.byId)

module.exports = router
