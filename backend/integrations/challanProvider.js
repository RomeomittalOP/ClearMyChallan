// =====================================================================
// Challan Provider Integration
// =====================================================================
// SINGLE EXPORT: fetchChallans(vehicleNumber)
//
// This module is provider-agnostic. To switch to a real provider:
//   1. Set CHALLAN_API_URL  in .env
//   2. Set CHALLAN_API_KEY  in .env
//   3. (optional) Set CHALLAN_API_PROVIDER=surepass | signzy | gridlines | custom
//   4. Edit `mapResponse()` to map the upstream payload to our shape.
//
// While the env vars are blank, this falls back to deterministic mock
// data so the rest of the app (UI, payments, admin) keeps working end
// to end during development.
// =====================================================================

const axios = require('axios')
const config = require('../config')
const logger = require('../utils/logger')
const {
  calculateResolutionFee,
  getSupportedCities
} = require('../services/pricingCalculator')

// Try to infer a supported city from free-text location/authority fields.
const SUPPORTED_CITIES = getSupportedCities()
function detectCity(...fields) {
  const haystack = fields.filter(Boolean).join(' ').toUpperCase()
  // Longer names first so "GHAZIABAD" isn't shadowed by a shorter match.
  for (const city of [...SUPPORTED_CITIES].sort((a, b) => b.length - a.length)) {
    if (haystack.includes(city)) return city
  }
  return ''
}

// Attach city + resolution pricing to a canonical challan object.
function withPricing(challan, fallbackCity = 'DELHI') {
  const city =
    challan.city ||
    detectCity(challan.location, challan.authority, challan.state) ||
    fallbackCity
  const pricing = calculateResolutionFee(city, challan.fineAmount)
  return {
    ...challan,
    city: pricing.city,
    region: pricing.region,
    legalFee: pricing.fee, // kept for backward compatibility
    resolutionFee: pricing.fee,
    totalPayable: pricing.totalPayable,
    pricingType: pricing.pricingType,
    pricingDescription: pricing.description,
    savings: pricing.savings
  }
}

// ---- Internal canonical shape ---------------------------------------
// Every provider mapping must produce objects with these fields:
//   externalId, vehicleNumber, violation, fineAmount, status,
//   date, issuedAt, city, location, authority, state
// Pricing fields (legalFee, totalPayable, pricingType, …) are added
// centrally by `withPricing()` so the calculator stays the single
// source of truth.
// ---------------------------------------------------------------------

// ---- MOCK DATA -------------------------------------------------------
function mockChallans(vehicleNumber) {
  const v = vehicleNumber.toUpperCase()
  const today = new Date()
  const fmt = (d) =>
    d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })

  // Varied cities so the city-based pricing is visible in the demo.
  const samples = [
    {
      violation: 'Over-speeding',
      fineAmount: 1000,
      city: 'Delhi',
      location: 'Outer Ring Road, Delhi',
      authority: 'Delhi Traffic Police',
      state: 'DL',
      offsetDays: 5
    },
    {
      violation: 'Signal Jump',
      fineAmount: 6000,
      city: 'Gurugram',
      location: 'NH-48, Gurugram',
      authority: 'Gurugram Traffic Police',
      state: 'HR',
      offsetDays: 21
    },
    {
      violation: 'No Parking Zone',
      fineAmount: 2000,
      city: 'Noida',
      location: 'Sector 18, Noida',
      authority: 'Noida Traffic Police',
      state: 'UP',
      offsetDays: 60
    },
    {
      violation: 'Without Helmet',
      fineAmount: 1500,
      city: 'Ghaziabad',
      location: 'Vaishali, Ghaziabad',
      authority: 'Ghaziabad Traffic Police',
      state: 'UP',
      offsetDays: 95
    }
  ]

  return samples.map((s, i) => {
    const issuedAt = new Date(today.getTime() - s.offsetDays * 86400000)
    return {
      externalId: `MOCK-${v}-${1000 + i}`,
      vehicleNumber: v,
      violation: s.violation,
      fineAmount: s.fineAmount,
      status: i === 2 ? 'Disputed' : 'Pending',
      date: fmt(issuedAt),
      issuedAt,
      city: s.city,
      location: s.location,
      authority: s.authority,
      state: s.state
    }
  })
}

// ---- REAL PROVIDER MAPPING ------------------------------------------
//
// Most Indian aggregators return a list under `data.challans` (Surepass,
// Gridlines) or `result.challanDetails` (Signzy). Adapt this function
// to whatever you actually use. The `mapItem` callback should return
// the canonical shape above.
//
function mapResponse(payload, vehicleNumber) {
  const items =
    payload?.data?.challans ||
    payload?.data?.Challan ||
    payload?.result?.challanDetails ||
    payload?.challans ||
    []

  return items.map((c) => {
    const fineAmount = Number(c.amount || c.fineAmount || c.challan_amount || 0)
    return {
      externalId: String(
        c.challanNumber || c.challan_no || c.id || c.referenceNo || ''
      ),
      vehicleNumber: vehicleNumber.toUpperCase(),
      violation:
        c.offence || c.violation || c.offenceName || c.description || 'Traffic violation',
      fineAmount,
      status: c.status || c.challanStatus || 'Pending',
      date: c.date || c.challanDate || c.issuedAt || '',
      issuedAt: c.issuedAt ? new Date(c.issuedAt) : null,
      city: c.city || '',
      location: c.location || c.area || '',
      authority: c.authority || c.issuingAuthority || '',
      state: c.state || ''
    }
  })
}

// ---- Public API ------------------------------------------------------
async function fetchChallans(vehicleNumber) {
  if (!vehicleNumber) {
    throw new Error('vehicleNumber is required')
  }

  // No provider configured → return mock data
  if (!config.challanProviderConfigured) {
    logger.warn(
      'Challan provider not configured (CHALLAN_API_URL / CHALLAN_API_KEY). ' +
        'Returning mock data.'
    )
    return {
      source: 'mock',
      items: mockChallans(vehicleNumber).map((c) => withPricing(c))
    }
  }

  try {
    const res = await axios.get(config.challan.apiUrl, {
      headers: {
        Authorization: `Bearer ${config.challan.apiKey}`,
        'x-api-key': config.challan.apiKey,
        'Content-Type': 'application/json'
      },
      params: { vehicle_number: vehicleNumber },
      timeout: 12000
    })

    const items = mapResponse(res.data, vehicleNumber).map((c) => withPricing(c))
    return { source: config.challan.provider, items }
  } catch (err) {
    logger.error(
      'Challan provider error:',
      err.response?.data || err.message
    )
    // Graceful fallback — never let the UI break on a partner outage.
    return {
      source: 'mock-fallback',
      items: mockChallans(vehicleNumber).map((c) => withPricing(c)),
      providerError: err.response?.data?.message || err.message
    }
  }
}

module.exports = { fetchChallans }
