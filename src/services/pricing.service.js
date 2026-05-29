import api from './api.js'

// Full pricing table + supported cities (for the Pricing section).
export async function getPricingTable() {
  const { data } = await api.get('/pricing')
  return data.data
}

// Calculate resolution fee for a single { city, challanAmount }.
export async function calculatePricing(city, challanAmount) {
  const { data } = await api.post('/pricing/calculate', { city, challanAmount })
  return data.data
}
