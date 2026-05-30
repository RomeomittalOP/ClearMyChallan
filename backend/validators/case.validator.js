const { body, param, query } = require('express-validator')
const CaseSubmission = require('../models/CaseSubmission')

const submit = [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Name is required'),
  body('mobile')
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Valid 10-digit Indian mobile number required'),
  body('email')
    .isEmail()
    .withMessage('Valid email address required')
    .normalizeEmail()
]

const track = [
  query('mobile').optional().trim().matches(/^[6-9]\d{9}$/),
  query('caseId').optional().trim().isLength({ min: 4, max: 40 })
]

const update = [
  param('id').isMongoId(),
  body('status')
    .optional()
    .isIn(CaseSubmission.STATUS)
    .withMessage(`Status must be one of: ${CaseSubmission.STATUS.join(', ')}`),
  body('quotedPrice').optional().isFloat({ min: 0 }),
  body('note').optional().isString().isLength({ max: 2000 }),
  body('assignedAdvocate').optional({ checkFalsy: true }).isMongoId()
]

const payCreate = [param('id').isMongoId()]

const payVerify = [
  param('id').isMongoId(),
  body('orderId').isString().notEmpty(),
  body('paymentId').isString().notEmpty(),
  body('signature').isString().notEmpty()
]

module.exports = { submit, track, update, payCreate, payVerify }
