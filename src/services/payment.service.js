// =====================================================================
// Frontend payment helper
// =====================================================================
// Loads the Razorpay Checkout script on demand, asks the backend for an
// order, opens Checkout, and finally calls /verify on success.
// =====================================================================

import api from './api.js'

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'
let scriptPromise = null

function loadScript() {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if (window.Razorpay) return Promise.resolve(true)
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve) => {
    const s = document.createElement('script')
    s.src = SCRIPT_SRC
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
  return scriptPromise
}

export async function getPublicConfig() {
  const { data } = await api.get('/payments/config')
  return data.data
}

export async function createOrder(resolutionRequestId) {
  const { data } = await api.post('/payments/order', { resolutionRequestId })
  return data.data
}

export async function verifyPayment({ orderId, paymentId, signature }) {
  const { data } = await api.post('/payments/verify', {
    orderId,
    paymentId,
    signature
  })
  return data.data.payment
}

/**
 * Full Pay flow: create order → open Checkout → verify on success.
 *
 * @param {Object}   args
 * @param {String}   args.resolutionRequestId
 * @param {Object}   args.user            (used to prefill checkout)
 * @param {String}   [args.brand]         Defaults to env brand name.
 */
export async function startPayment({ resolutionRequestId, user, brand }) {
  const ok = await loadScript()
  if (!ok) throw new Error('Could not load Razorpay. Check your connection.')

  const { razorpay } = await createOrder(resolutionRequestId)
  if (!razorpay?.keyId) {
    throw new Error('Payments not configured on the server')
  }

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: razorpay.keyId,
      amount: razorpay.amount,
      currency: razorpay.currency,
      order_id: razorpay.orderId,
      name: brand || import.meta.env.VITE_BRAND_NAME || 'ClearMyChallan',
      description: 'Challan resolution legal fee',
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
        contact: user?.phone || ''
      },
      theme: { color: '#22D3EE' },
      handler: async (resp) => {
        try {
          const payment = await verifyPayment({
            orderId: resp.razorpay_order_id,
            paymentId: resp.razorpay_payment_id,
            signature: resp.razorpay_signature
          })
          resolve(payment)
        } catch (e) {
          reject(e)
        }
      },
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled'))
      }
    })
    rzp.open()
  })
}
