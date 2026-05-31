import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { extractError } from '../services/api.js'

export default function AdminLogin() {
  const nav = useNavigate()
  const { user, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  // If already logged in as admin, redirect to dashboard.
  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'advocate')) {
      nav('/admin', { replace: true })
    }
  }, [user, nav])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return toast.error('Enter email and password.')
    setBusy(true)
    try {
      const u = await login({ email, password })
      if (u.role !== 'admin' && u.role !== 'advocate') {
        toast.error('This account does not have admin access.')
        return
      }
      toast.success(`Welcome, ${u.name}`)
      nav('/admin', { replace: true })
    } catch (err) {
      toast.error(extractError(err, 'Login failed.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-soft p-4">
      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="card w-full max-w-md p-7 sm:p-9"
      >
        <Link to="/" className="flex items-center gap-2.5 mb-7">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-police-600 shadow-soft">
            <ShieldCheck className="w-5 h-5 text-white" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-navy">
            ClearMy<span className="text-police-600">Challan</span>
          </span>
        </Link>

        <h1 className="font-display text-2xl font-bold text-navy">Admin Login</h1>
        <p className="text-sm text-ink-500 mt-1">
          Sign in to manage cases and quote prices.
        </p>

        <div className="mt-6 grid gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-400">
              Email
            </label>
            <div className="mt-2 relative rounded-xl bg-white border border-line focus-within:border-police-400 focus-within:shadow-ring transition-all">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="admin@clearmychallan.in"
                className="w-full pl-11 pr-4 py-3 bg-transparent outline-none text-navy placeholder:text-ink-400/60"
                autoComplete="email"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-400">
              Password
            </label>
            <div className="mt-2 relative rounded-xl bg-white border border-line focus-within:border-police-400 focus-within:shadow-ring transition-all">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-transparent outline-none text-navy"
                autoComplete="current-password"
              />
            </div>
          </div>
          <button type="submit" disabled={busy} className="btn-primary !py-3 mt-2">
            {busy ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Signing in…
              </>
            ) : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        <div className="mt-6 text-xs text-ink-400 text-center">
          Customers can <Link to="/" className="text-police-600 hover:underline">submit a case</Link>{' '}
          or <Link to="/track" className="text-police-600 hover:underline">track a case</Link>.
        </div>
      </motion.form>
    </div>
  )
}
