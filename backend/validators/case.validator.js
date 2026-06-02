const { body, param, query } = require('express-validator')
const CaseSubmission = require('../models/CaseSubmission')

const submit = [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Name is required'),
  body('mobile').trim().matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit Indian mobile number required'),
  body('email').isEmail().withMessage('Valid email address required').normalizeEmail(),
  body('vehicleNumber').optional({ checkFalsy: true }).trim().isLength({ max: 20 }),
  body('challanNumber').optional({ checkFalsy: true }).trim().isLength({ max: 40 })
]

const track = [
  query('mobile').optional().trim().matches(/^[6-9]\d{9}$/),
  query('caseId').optional().trim().isLength({ min: 4, max: 40 })
]

const update = [
  param('id').isMongoId(),
  body('status').optional().isIn(CaseSubmission.STATUS).withMessage(`Status must be one of: ${CaseSubmission.STATUS.join(', ')}`),
  body('quotedPrice').optional().isFloat({ min: 0 }),
  body('note').optional().isString().isLength({ max: 2000 }),
  body('assignedAdvocate').optional({ checkFalsy: true }).isMongoId()
]

// Accept either a Mongo _id or the human caseId (CMC-YYYY-NNNNNN).
const caseIdParam = param('id')
  .isString()
  .custom((v) => /^[0-9a-fA-F]{24}$/.test(v) || /^CMC-\d{4}-\d{6}$/i.test(v))
  .withMessage('Invalid case identifier')

const payCreate = [caseIdParam]

const payVerify = [
  caseIdParam,
  body('orderId').isString().notEmpty(),
  body('paymentId').isString().notEmpty(),
  body('signature').isString().notEmpty()
]

// UPI manual payment proof — customer submits UTR after scanning the QR.
const paymentProof = [
  caseIdParam,
  body('utr')
    .isString()
    .trim()
    .matches(/^\d{6,22}$/)
    .withMessage('UTR must be a 6–22 digit number'),
  body('note').optional({ checkFalsy: true }).isString().isLength({ max: 500 })
]

module.exports = { submit, track, update, payCreate, payVerify, paymentProof }
