import api from './api.js'

// Public: submit a new case (multipart upload)
export async function submitCase(
  { name, mobile, email, vehicleNumber = '', challanNumber = '', rcFile, challanFile },
  onProgress
) {
  const fd = new FormData()
  fd.append('name', name)
  fd.append('mobile', mobile)
  fd.append('email', email)
  if (vehicleNumber) fd.append('vehicleNumber', vehicleNumber)
  if (challanNumber) fd.append('challanNumber', challanNumber)
  fd.append('rc', rcFile)
  fd.append('challan', challanFile)

  const { data } = await api.post('/cases/submit', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) {
        onProgress(Math.round((evt.loaded / evt.total) * 100))
      }
    },
    // Longer timeout for upload of two 20MB files.
    timeout: 120000
  })
  return data.data
}

// Public: track a case by mobile number or case id
export async function trackCase({ mobile, caseId }) {
  const params = {}
  if (mobile) params.mobile = mobile
  if (caseId) params.caseId = caseId
  const { data } = await api.get('/cases/track', { params })
  return data.data
}

// Public: UPI config (cloud_name etc. for QR rendering on the track page)
export async function getUpiConfig() {
  const { data } = await api.get('/cases/upi-config')
  return data.data
}

// Public: customer submits UTR after paying via UPI QR
export async function submitPaymentProof(caseId, { utr, note }) {
  const { data } = await api.post(`/cases/${caseId}/payment-proof`, { utr, note })
  return data.data
}

// Public: kick off Razorpay payment for a case (kept as backup gateway path)
export async function createCasePayment(caseId) {
  const { data } = await api.post(`/cases/${caseId}/pay`)
  return data.data
}

// Public: verify payment after Razorpay Checkout
export async function verifyCasePayment(caseId, { orderId, paymentId, signature }) {
  const { data } = await api.post(`/cases/${caseId}/verify`, {
    orderId,
    paymentId,
    signature
  })
  return data.data
}

// ----- Admin -----
export async function adminListCases({ search, status, page = 1, limit = 25 } = {}) {
  const params = { page, limit }
  if (search) params.search = search
  if (status) params.status = status
  const { data } = await api.get('/admin/cases', { params })
  return data.data
}

export async function adminGetCase(id) {
  const { data } = await api.get(`/admin/cases/${id}`)
  return data.data.case
}

export async function adminUpdateCase(id, patch) {
  const { data } = await api.patch(`/admin/cases/${id}`, patch)
  return data.data.case
}

export async function adminSummary() {
  const { data } = await api.get('/admin/summary')
  return data.data
}
