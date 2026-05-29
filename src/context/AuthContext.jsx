// =====================================================================
// AuthContext — single source of truth for the logged-in user.
// =====================================================================
// Hydrates from localStorage on mount, refreshes via /auth/me when a
// token exists, and exposes login/logout helpers.
// =====================================================================

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'
import * as authService from '../services/auth.service.js'
import { tokenStore, userStore } from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => userStore.get())
  const [loading, setLoading] = useState(false)

  // Refresh user from API on first load if we have a token.
  useEffect(() => {
    let cancelled = false
    if (tokenStore.get() && !user) {
      setLoading(true)
      authService
        .me()
        .then((u) => !cancelled && setUser(u))
        .catch(() => tokenStore.clear())
        .finally(() => !cancelled && setLoading(false))
    }
    return () => {
      cancelled = true
    }
  }, []) // eslint-disable-line

  // React to forced logout from the api interceptor (401)
  useEffect(() => {
    const onLogout = () => setUser(null)
    window.addEventListener('cr:logout', onLogout)
    return () => window.removeEventListener('cr:logout', onLogout)
  }, [])

  const login = useCallback(async (creds) => {
    const data = await authService.login(creds)
    setUser(data.user)
    return data.user
  }, [])

  const signup = useCallback(async (payload) => {
    const data = await authService.signup(payload)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
  }, [])

  const refresh = useCallback(async () => {
    const u = await authService.me()
    setUser(u)
    return u
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, refresh, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
