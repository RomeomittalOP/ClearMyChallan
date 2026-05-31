// =====================================================================
// Central site constants — brand, contact, policy.
// Pulls from Vite env where available, with sensible defaults so the
// app works even without a .env file.
// =====================================================================

const env = import.meta.env || {}

const PHONE = (env.VITE_SUPPORT_PHONE || '8000727771').replace(/[^\d]/g, '')
const WHATSAPP = (env.VITE_WHATSAPP_NUMBER || '918000727771').replace(/[^\d]/g, '')

export const SITE = {
  brand: env.VITE_BRAND_NAME || 'ClearMyChallan',

  // Contact
  phone: PHONE, // 8000727771 (display)
  phoneDisplay: '8000727771',
  telHref: `tel:+91${PHONE}`,
  whatsapp: WHATSAPP, // 918000727771
  whatsappHref: (msg = 'Hi, I need help resolving a vehicle challan.') =>
    `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`,
  email: 'help@clearmychallan.co.in',

  // Offer / policy
  startingPercent: 60, // "as low as 60% of the original fine"
  disposalTime: '20–25 Days',
  refundPolicy:
    'If the challan is not disposed within 25 days, the amount is fully refunded.',
  refundDays: 25
}

export default SITE
