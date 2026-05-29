import api from './api.js'

/**
 * Lookup challans for a vehicle.
 * Returns: { source, providerError, vehicleNumber, count, challans: [...] }
 */
export async function lookupChallans(vehicleNumber, chassis) {
  const { data } = await api.post('/challans/lookup', {
    vehicleNumber,
    chassis
  })
  return data.data
}
