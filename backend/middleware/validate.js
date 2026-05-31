// =====================================================================
// Validation middleware
// ---------------------------------------------------------------------
// Wraps express-validator chains. Pass an array of validation chains;
// the middleware runs them and short-circuits with 422 on any failure.
// =====================================================================

const { validationResult } = require('express-validator')
const { fail } = require('../utils/apiResponse')

function validate(chains) {
  return async (req, res, next) => {
    for (const chain of chains) await chain.run(req)
    const errors = validationResult(req)
    if (errors.isEmpty()) return next()
    return fail(res, 'Validation failed', 422, errors.array())
  }
}

module.exports = { validate }
