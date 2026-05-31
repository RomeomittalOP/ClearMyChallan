const router = require('express').Router()
const ctrl = require('../controllers/contact.controller')
const { validate } = require('../middleware/validate')
const v = require('../validators/contact.validator')

router.post('/', validate(v.create), ctrl.create)

module.exports = router
