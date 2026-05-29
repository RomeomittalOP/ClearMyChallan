// =====================================================================
// Pricing Calculator
// =====================================================================
// SINGLE SOURCE OF TRUTH for how much a user pays to resolve a challan.
//
//   calculateResolutionFee(city, challanAmount)
//
// Returns:
//   {
//     city,              normalized city name
//     region,            display group the city belongs to
//     challanAmount,     original fine (number)
//     pricingType,       'flat_percent' | 'fine_plus_fee' | 'default_estimate'
//     percent,           number | null   (for flat_percent)
//     serviceFee,        number | null   (for fine_plus_fee)
//     fee,               our charge component
//     totalPayable,      what the user pays us (rounded ₹)
//     savings,           challanAmount - totalPayable (can be negative)
//     description,       human-readable rule
//     matched            boolean — false when we fell back to default
//   }
//
// PRICING RULES (per client brief)
// ---------------------------------------------------------------------
//   DELHI                         → flat 60%
//   FARIDABAD/PALWAL/GURUGRAM      → < ₹2000: fine + ₹500
//                                    > ₹5000: flat 80%
//                                    (₹2000–₹5000 gap → fine + ₹500*, see NOTE)
//   NOIDA                         → flat 50%
//   GHAZIABAD                     → flat 50%
//   MATHURA/AGRA/ALIGARH          → < ₹2000: fine + ₹500 ; ≥ ₹2000: flat 70%
//   BULANDSHAHR/SHAMLI/MEERUT     → < ₹2000: fine + ₹500 ; ≥ ₹2000: flat 65%
//   LUCKNOW/KANPUR                → < ₹2000: fine + ₹500 ; ≥ ₹2000: flat 65%
//
// * NOTE: the brief only specified "below 2000" and "above 5000" for the
//   Faridabad group. The ₹2000–₹5000 band is therefore not defined by the
//   client. We conservatively apply "fine + ₹500" in that band so we never
//   undercharge. To change it, edit the FARIDABAD tiers below (one place).
// =====================================================================

// A tier matches when challanAmount < `upTo` (tiers are tried in order;
// the final tier usually has no `upTo` and acts as the catch-all).
const flatPercent = (percent, upTo) => ({ type: 'flat_percent', percent, upTo })
const finePlusFee = (fee, upTo) => ({ type: 'fine_plus_fee', fee, upTo })

const REGIONS = [
  {
    region: 'Delhi',
    cities: ['DELHI'],
    tiers: [flatPercent(60)]
  },
  {
    region: 'Faridabad / Palwal / Gurugram',
    cities: ['FARIDABAD', 'PALWAL', 'GURUGRAM', 'GURGAON'],
    tiers: [
      finePlusFee(500, 2000), // below ₹2000
      finePlusFee(500, 5000), // ₹2000–₹5000 (see NOTE above)
      flatPercent(80) // above ₹5000
    ]
  },
  {
    region: 'Noida',
    cities: ['NOIDA', 'GAUTAM BUDDHA NAGAR'],
    tiers: [flatPercent(50)]
  },
  {
    region: 'Ghaziabad',
    cities: ['GHAZIABAD'],
    tiers: [flatPercent(50)]
  },
  {
    region: 'Mathura / Agra / Aligarh',
    cities: ['MATHURA', 'AGRA', 'ALIGARH'],
    tiers: [finePlusFee(500, 2000), flatPercent(70)]
  },
  {
    region: 'Bulandshahr / Shamli / Meerut',
    cities: ['BULANDSHAHR', 'SHAMLI', 'MEERUT'],
    tiers: [finePlusFee(500, 2000), flatPercent(65)]
  },
  {
    region: 'Lucknow / Kanpur',
    cities: ['LUCKNOW', 'KANPUR'],
    tiers: [finePlusFee(500, 2000), flatPercent(65)]
  }
]

// Fallback when a city isn't in our list yet (e.g. new partner state).
// We use a conservative flat 60% estimate and flag matched=false.
const DEFAULT_REGION = {
  region: 'Other',
  tiers: [flatPercent(60)],
  isDefault: true
}

// Build a fast lookup: CITY -> region definition.
const CITY_INDEX = REGIONS.reduce((idx, r) => {
  r.cities.forEach((c) => {
    idx[c] = r
  })
  return idx
}, {})

function normalizeCity(city) {
  return String(city || '')
    .trim()
    .toUpperCase()
}

function pickTier(tiers, amount) {
  for (const t of tiers) {
    if (t.upTo === undefined) return t
    if (amount < t.upTo) return t
  }
  return tiers[tiers.length - 1]
}

/**
 * Calculate the resolution fee for a single challan.
 * @param {string} city
 * @param {number} challanAmount  Original fine in rupees.
 */
function calculateResolutionFee(city, challanAmount) {
  const amount = Math.max(0, Math.round(Number(challanAmount) || 0))
  const key = normalizeCity(city)
  const region = CITY_INDEX[key] || DEFAULT_REGION
  const matched = !region.isDefault

  const tier = pickTier(region.tiers, amount)

  let totalPayable
  let fee
  let description
  const result = {
    city: key || 'UNKNOWN',
    region: region.region,
    challanAmount: amount,
    pricingType: matched ? tier.type : 'default_estimate',
    percent: null,
    serviceFee: null,
    matched
  }

  if (tier.type === 'flat_percent') {
    totalPayable = Math.round((tier.percent / 100) * amount)
    fee = totalPayable // all-inclusive resolution price
    result.percent = tier.percent
    description = matched
      ? `Flat ${tier.percent}% of the fine amount`
      : `Estimated at flat ${tier.percent}% (city not yet listed)`
  } else {
    // fine_plus_fee
    fee = tier.fee
    totalPayable = amount + tier.fee
    result.serviceFee = tier.fee
    description = `Fine amount + ₹${tier.fee} service fee`
  }

  result.fee = fee
  result.totalPayable = totalPayable
  result.savings = amount - totalPayable
  result.description = description
  return result
}

/**
 * Return the full pricing table (for the public pricing page / API).
 */
function getPricingTable() {
  return REGIONS.map((r) => ({
    region: r.region,
    cities: r.cities,
    tiers: r.tiers.map((t) =>
      t.type === 'flat_percent'
        ? {
            type: t.type,
            percent: t.percent,
            upTo: t.upTo || null,
            label:
              t.upTo === undefined
                ? 'All amounts'
                : `Below ₹${t.upTo.toLocaleString('en-IN')}`,
            description: `Flat ${t.percent}% of the fine amount`
          }
        : {
            type: t.type,
            fee: t.fee,
            upTo: t.upTo || null,
            label:
              t.upTo === undefined
                ? 'All amounts'
                : `Below ₹${t.upTo.toLocaleString('en-IN')}`,
            description: `Fine amount + ₹${t.fee} service fee`
          }
    )
  }))
}

/**
 * List of every city we currently support (handy for dropdowns).
 */
function getSupportedCities() {
  return Object.keys(CITY_INDEX).sort()
}

module.exports = {
  calculateResolutionFee,
  getPricingTable,
  getSupportedCities,
  REGIONS
}
