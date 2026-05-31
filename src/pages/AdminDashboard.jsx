import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  ShieldCheck,
  LogOut,
  Search,
  Filter,
  Loader2,
  Bell,
  Wallet,
  ClipboardList,
  Clock,
  CheckCircle2,
  IndianRupee,
  ArrowRight
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { adminListCases, adminSummary } from '../services/case.service.js'
import { extractError } from '../services/api.js'

const STATUSES = [
  '',
  'Pending Review',
  'Under Review',
  'Price Quoted',
  'Payment Received',
  'Case Processing',
  'Completed',
  'Cancelled'
]

const STATUS_BADGE = {
  'Pending Review': 'bg-amber-50 text-amber-700 border-amber-200',
  'Under Review': 'bg-blue-50 text-blue-700 border-blue-200',
  'Price Quoted': 'bg-violet-50 text-violet-700 border-violet-200',
  'Payment Received': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Case Processing': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Completed: 'bg-green-50 text-green-700 border-green-200',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200'
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <span
          className={`w-10 h-10 rounded-lg border flex items-center justify-center ${
            accent || 'bg-police-50 border-police-100 text-police-600'
          }`}
        >
          <Icon className="w-5 h-5" />
        </span>
        <div className="text-xs font-semibold uppercase tracking-wider text-ink-400">
          {label}
        </div>
      </div>
      <div className="mt-3 font-display text-3xl font-extrabold text-navy">{value}</div>
    </div>
  )
}

export default function AdminDashboard() {
  const nav = useNavigate()
  const { user, logout } = useAuth()
  const [summary, setSummary] = useState(null)
  const [cases, setCases] = useState([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const limit = 25

  useEffect(() => {
    adminSummary()
      .then(setSummary)
      .catch((e) => toast.error(extractError(e, 'Failed to load summary.')))
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    adminListCases({ search, status, page, limit })
      .then((data) => {
        if (cancelled) return
        setCases(data.items)
        setTotal(data.total)
      })
      .catch((e) => toast.error(extractError(e, 'Failed to load cases.')))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [search, status, page])

  const pages = Math.max(1, Math.ceil(total / limit))
  const fmt = (n) => Number(n || 0).toLocaleString('en-IN')
  const c = summary?.cases

  return (
    <div className="min-h-screen bg-surface-soft">
      {/* Top bar */}
      <header className="bg-white border-b border-line sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-3 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-police-600">
              <ShieldCheck className="w-5 h-5 text-white" />
            </span>
            <div>
              <div className="font-display font-bold text-navy text-sm leading-none">
                ClearMyChallan
              </div>
              <div className="text-[11px] uppercase tracking-wider text-police-600 font-semibold mt-0.5">
                Admin
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-sm text-ink-500">
              {user?.name} · <span className="text-police-600 font-medium">{user?.role}</span>
            </div>
            <button
              onClick={() => {
                logout()
                nav('/admin/login')
              }}
              className="btn-secondary !px-3 !py-2 text-sm"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-7">
        {/* Notifications strip */}
        {c && c.unread > 0 && (
          <div className="card p-4 mb-6 border-amber-200 bg-amber-50/60 flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </span>
            <div className="text-sm flex-1">
              <span className="font-semibold text-amber-900">{c.unread} new submission{c.unread === 1 ? '' : 's'}</span>{' '}
              <span className="text-amber-800/80">— open each case to mark as read.</span>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-7">
          <StatCard icon={ClipboardList} label="Total Cases" value={fmt(c?.total)} />
          <StatCard icon={Clock} label="Pending Review" value={fmt(c?.pendingReview)} accent="bg-amber-50 border-amber-200 text-amber-700" />
          <StatCard icon={Filter} label="Under Review" value={fmt(c?.underReview)} accent="bg-blue-50 border-blue-200 text-blue-700" />
          <StatCard icon={CheckCircle2} label="Completed" value={fmt(c?.completed)} accent="bg-green-50 border-green-200 text-green-700" />
          <StatCard icon={IndianRupee} label="Revenue (₹)" value={fmt(c?.revenue)} accent="bg-police-50 border-police-200 text-police-700" />
        </div>

        {/* Filters + table */}
        <div className="card overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-line grid sm:grid-cols-[1fr_auto] gap-3">
            <div className="relative rounded-xl bg-white border border-line focus-within:border-police-400 focus-within:shadow-ring transition-all">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                placeholder="Search by Case ID, mobile, name or email"
                className="w-full pl-11 pr-4 py-2.5 bg-transparent outline-none text-navy placeholder:text-ink-400/60"
              />
            </div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
              className="rounded-xl bg-white border border-line px-4 py-2.5 text-sm text-navy outline-none focus:border-police-400"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s || 'All statuses'}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-soft text-[11px] uppercase tracking-wider text-ink-400 font-semibold">
                  <th className="text-left px-4 py-3">Case ID</th>
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Quoted</th>
                  <th className="text-left px-4 py-3">Submitted</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-ink-400">
                      <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
                      Loading…
                    </td>
                  </tr>
                )}
                {!loading && cases.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-ink-400">
                      No cases match your filters yet.
                    </td>
                  </tr>
                )}
                {!loading &&
                  cases.map((row) => (
                    <tr key={row.id} className="border-t border-line hover:bg-surface-soft/60">
                      <td className="px-4 py-3 font-mono text-police-700 font-semibold">
                        {row.caseId}
                        {!row.notifiedAdmin && (
                          <span className="ml-2 inline-block w-2 h-2 rounded-full bg-amber-500" title="New" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-navy">{row.name}</div>
                        <div className="text-xs text-ink-400">{row.mobile}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                            STATUS_BADGE[row.status] || 'bg-surface-muted text-ink-500 border-line'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {row.quotedPrice > 0 ? `₹${fmt(row.quotedPrice)}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-ink-500 whitespace-nowrap">
                        {new Date(row.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/admin/cases/${row.id}`}
                          className="inline-flex items-center gap-1 text-police-700 hover:text-police-800 text-sm font-medium"
                        >
                          Open <ArrowRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="px-4 sm:px-5 py-3 border-t border-line flex items-center justify-between text-sm">
              <div className="text-ink-400">
                Page {page} of {pages} · {total} case{total === 1 ? '' : 's'}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="btn-secondary !px-3 !py-1.5 text-sm disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page >= pages}
                  className="btn-secondary !px-3 !py-1.5 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
