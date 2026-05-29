// =====================================================================
// Challan service
// =====================================================================
// Talks to the provider integration, persists results in Mongo, and
// returns a clean canonical list to the controller.
// =====================================================================

const mongoose = require('mongoose')
const Challan = require('../models/Challan')
const { fetchChallans } = require('../integrations/challanProvider')
const { ApiError } = require('../utils/apiResponse')

/**
 * Lookup challans for a vehicle. Upserts each challan so subsequent
 * calls reuse stable internal _ids (used by resolution requests).
 */
async function lookup(vehicleNumber, userId = null) {
  // We must persist to hand back stable ids — fail clearly if the DB is down.
  if (mongoose.connection.readyState !== 1) {
    throw new ApiError(
      'Service temporarily unavailable — database not connected',
      503
    )
  }

  const v = vehicleNumber.toUpperCase()
  const { source, items, providerError } = await fetchChallans(v)

  // Upsert into Mongo. Each (externalId, vehicleNumber) is unique.
  const saved = await Promise.all(
    items.map(async (c) => {
      const doc = await Challan.findOneAndUpdate(
        { externalId: c.externalId, vehicleNumber: c.vehicleNumber },
        {
          ...c,
          ...(userId ? { user: userId } : {}),
          rawPayload: c
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
      return doc
    })
  )

  return {
    source,
    providerError: providerError || null,
    vehicleNumber: v,
    count: saved.length,
    challans: saved.map((d) => d.toJSON())
  }
}

async function getById(id) {
  return Challan.findById(id)
}

async function findManyByIds(ids) {
  return Challan.find({ _id: { $in: ids } })
}

module.exports = { lookup, getById, findManyByIds }
