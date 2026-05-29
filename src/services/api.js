// =====================================================================
// Axios instance + auth + retry + error toast plumbing
// =====================================================================
// Every service/* module imports `api` from here so all calls share:
//   - a single base URL (VITE_API_BASE_URL)
//   - automatic JWT injection from secure storage
//   - one-shot retry for transient network errors
//   - normalised error messages for the toast layer
// =====================================================================

import axios from 'axios'
import toast from 'react-hot-toast'

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

// ---- Token storage --------------------------------------------------
// We use localStorage for now. To upgrade to httpOnly cookies later,
// the only file that needs to change is this one + the auth controller.
const TOKEN_KEY = 'cr_token'
const USER_KEY = 'cr_user'

export const tokenStore = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set: (t) => {
    try {
      localStorage.setItem(TOKEN_KEY, t)
    } catch {}
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    } catch {}
  }
}

export const userStore = {
  get: () => {
    try {
      const raw = localStorage.getItem(USER_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },
  set: (u) => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(u))
    } catch {}
  }
}

// ---- Axios instance -------------------------------------------------
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((cfg) => {
  const t = tokenStore.get()
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

// One-shot retry for network errors / 502/503/504.
api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const cfg = err.config || {}
    const transient =
      !err.response ||
      [502, 503, 504].includes(err.response?.status) ||
      err.code === 'ECONNABORTED'

    if (transient && !cfg._retried) {
      cfg._retried = true
      await new Promise((r) => setTimeout(r, 700))
      return api(cfg)
    }

    // Auto-logout on 401 (token expired or invalid)
    if (err.response?.status === 401 && tokenStore.get()) {
      tokenStore.clear()
      // Trigger a soft event so AuthContext can react.
      window.dispatchEvent(new CustomEvent('cr:logout'))
    }

    return Promise.reject(err)
  }
)

// ---- Helpers --------------------------------------------------------

export function extractError(err, fallback = 'Something went wrong') {
  return (
    err?.response?.data?.message ||
    err?.message ||
    fallback
  )
}

/**
 * Wrap any service call to auto-toast errors.
 * Usage:
 *   const data = await withErrorToast(() => challanService.lookup(...))
 */
export async function withErrorToast(fn, { toastError = true } = {}) {
  try {
    return await fn()
  } catch (err) {
    if (toastError) toast.error(extractError(err))
    throw err
  }
}

export default api
