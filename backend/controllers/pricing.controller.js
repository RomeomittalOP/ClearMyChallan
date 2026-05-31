const asyncHandler = require('../utils/asyncHandler')
const { success } = require('../utils/apiResponse')
const {
  calculateResolutionFee,
  getPricingTable,
  getSupportedCities
} = require('../services/pricingCalculator')

// POST /api/pricing/calculate  { city, challanAmount }
exports.calculate = asyncHandler(async (req, res) => {
  const { city, challanAmount } = req.body
  const result = calculateResolutionFee(city, challanAmount)
  return success(res, result, 'Pricing calculated')
})

// GET /api/pricing  → full table + supported cities
exports.table = asyncHandler(async (_req, res) => {
  return success(res, {
    table: getPricingTable(),
    cities: getSupportedCities()
  })
})
