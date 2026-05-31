const router = require('express').Router()
const ctrl = require('../controllers/admin.controller')
const { requireAuth } = require('../middleware/auth')
const { requireAdmin } = require('../middleware/admin')
const { validate } = require('../middleware/validate')
const v = require('../validators/resolution.validator')
const caseV = require('../validators/case.validator')

router.use(requireAuth, requireAdmin)

router.get('/summary', ctrl.summary)
router.get('/users', ctrl.users)
router.get('/advocates', ctrl.advocates)

// Case submission management (manual upload flow)
router.get('/cases', ctrl.listCases)
router.get('/cases/:id', ctrl.getCase)
router.patch('/cases/:id', validate(caseV.update), ctrl.updateCase)

router.get('/requests', ctrl.requests)
router.patch(
  '/requests/:id/status',
  validate(v.updateStatus),
  ctrl.updateRequestStatus
)
router.patch(
  '/requests/:id/assign',
  validate(v.assignAdvocate),
  ctrl.assignAdvocate
)
router.get('/payments', ctrl.payments)
router.get('/contacts', ctrl.contacts)
router.patch('/contacts/:id', ctrl.updateContact)

module.exports = router
