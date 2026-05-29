const router = require('express').Router()
const ctrl = require('../controllers/auth.controller')
const { validate } = require('../middleware/validate')
const v = require('../validators/auth.validator')
const { requireAuth } = require('../middleware/auth')
const { authLimiter } = require('../middleware/rateLimiter')

router.post('/signup', authLimiter, validate(v.signup), ctrl.signup)
router.post('/login', authLimiter, validate(v.login), ctrl.login)
router.get('/me', requireAuth, ctrl.me)
router.patch('/me', requireAuth, validate(v.updateProfile), ctrl.updateProfile)

module.exports = router
