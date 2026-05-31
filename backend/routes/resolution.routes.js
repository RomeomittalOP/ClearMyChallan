const router = require('express').Router()
const ctrl = require('../controllers/resolution.controller')
const { requireAuth } = require('../middleware/auth')
const { requireRole } = require('../middleware/admin')
const { validate } = require('../middleware/validate')
const v = require('../validators/resolution.validator')

router.use(requireAuth)

router.post('/', validate(v.create), ctrl.create)
router.get('/me', ctrl.listMine)

// Advocate workspace — must be declared BEFORE '/:id' so "assigned"
// isn't parsed as an id.
router.get('/assigned', requireRole('advocate', 'admin'), ctrl.listAssigned)
router.patch(
  '/:id/status',
  requireRole('advocate', 'admin'),
  validate(v.updateStatus),
  ctrl.updateStatus
)

router.get('/:id', ctrl.getById)
router.post('/:id/notes', validate(v.addNote), ctrl.addNote)

module.exports = router
