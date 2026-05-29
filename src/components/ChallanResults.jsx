import React, { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  FileText,
  MapPin,
  Calendar,
  AlertTriangle,
  ArrowRight,
  CircleDot,
  Building2,
  CheckCircle2,
  Receipt,
  Loader2,
  WifiOff,
  TrendingDown
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { createResolution } from '../services/resolution.service.js'
import { startPayment } from '../services/payment.service.js'
import { extractError } from '../services/api.js'

const rupee = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

function StatusPill({ status }) {
  const map = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Disputed: 'bg-violet-50 text-violet-700 border-violet-200',
    Resolved: 'bg-green-50 text-green-700 border-green-200'
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
        map[status] || 'bg-surface-muted text-ink-500 border-line'
      }`}
    >
      <CircleDot className="w-3 h-3" />
      {status}
    </span>
  )
}

function ChallanCard({ c, index, onProceed, busy }) {
  const id = c.id || c._id || c.externalId
  const externalLabel = c.externalId || c.id || id
  const payable = c.totalPayable ?? c.resolutionFee ?? c.legalFee
  const showSavings = (c.savings ?? 0) > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      whileHover={{ y: -3 }}
      className="card p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-ink-400 uppercase tracking-wider font-semibold">
            <FileText className="w-3.5 h-3.5" /> Challan #
          </div>
          <div className="mt-1 font-mono text-sm text-navy">{externalLabel}</div>
        </div>
        <StatusPill status={c.status} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <Detail icon={AlertTriangle} label="Violation" value={c.violation} accent />
        <Detail icon={Calendar} label="Date" value={c.date} />
        <Detail icon={MapPin} label="Location" value={c.location} full />
        <Detail
          icon={Building2}
          label="Authority"
          value={`${c.authority}${c.city ? ` · ${c.city}` : ''}`}
          full
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-line bg-surface-soft p-3.5">
          <div className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold">
            Original Fine
          </div>
          <div className="mt-1 font-display text-xl font-bold text-ink-700 line-through decoration-ink-400/50">
            {rupee(c.fineAmount)}
          </div>
        </div>
        <div className="rounded-xl border border-police-200 bg-police-50 p-3.5">
          <div className="text-[11px] uppercase tracking-wider text-police-700 font-semibold">
            You Pay
          </div>
          <div className="mt-1 font-display text-xl font-bold text-police-700">
            {rupee(payable)}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-ink-400">{c.pricingDescription}</span>
        {showSavings && (
          <span className="inline-flex items-center gap-1 font-semibold text-green-700">
            <TrendingDown className="w-3.5 h-3.5" /> Save {rupee(c.savings)}
          </span>
        )}
      </div>

      <button
        onClick={() => onProceed?.([id])}
        disabled={busy}
        className="mt-5 w-full btn-primary !py-3 group"
      >
        {busy ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Starting…
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4" /> Proceed With Resolution
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>
    </motion.div>
  )
}

function Detail({ icon: Icon, label, value, accent, full }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <div className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold">
        {label}
      </div>
      <div className="mt-1 flex items-center gap-2 text-ink-700">
        <Icon className={`w-4 h-4 ${accent ? 'text-police-600' : 'text-ink-400'}`} />
        <span className="font-medium">{value}</span>
      </div>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4">
        <div className="skeleton h-10 w-full" />
        <div className="skeleton h-10 w-full" />
        <div className="skeleton h-10 w-full col-span-2" />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="skeleton h-16 w-full" />
        <div className="skeleton h-16 w-full" />
      </div>
      <div className="skeleton h-11 w-full mt-5 rounded-xl" />
    </div>
  )
}

export default function ChallanResults({ searchState }) {
  const { status, vehicle, results, source } = searchState
  const { user, isAuthenticated } = useAuth()
  const [busyId, setBusyId] = useState(null)
  const [busyAll, setBusyAll] = useState(false)

  if (status === 'idle') return null

  const totalFine = results.reduce((s, c) => s + Number(c.fineAmount || 0), 0)
  const totalPay = results.reduce(
    (s, c) => s + Number(c.totalPayable ?? c.resolutionFee ?? c.legalFee ?? 0),
    0
  )
  const isMongoId = (s) => /^[0-9a-fA-F]{24}$/.test(String(s))

  async function proceed(challanIds) {
    if (source === 'offline-mock') {
      toast('Connect the backend (set VITE_API_BASE_URL) to start a real resolution.', {
        icon: '⚙️'
      })
      return
    }
    if (!isAuthenticated) {
      toast('Please sign in to start a resolution.', { icon: '🔐' })
      return
    }
    const valid = challanIds.filter(isMongoId)
    if (valid.length === 0) {
      toast.error('Challan ids are stale — please re-run the search.')
      return
    }

    const single = challanIds.length === 1
    if (single) setBusyId(challanIds[0])
    else setBusyAll(true)

    try {
      const reqDoc = await createResolution({ vehicleNumber: vehicle, challanIds: valid })
      toast.success('Resolution request created')
      try {
        const payment = await startPayment({ resolutionRequestId: reqDoc.id || reqDoc._id, user })
        toast.success(`Payment received (${payment.status})`)
      } catch (e) {
        toast(extractError(e, 'Payment skipped'), { icon: '💳' })
      }
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setBusyId(null)
      setBusyAll(false)
    }
  }

  return (
    <section id="results" className="relative py-10 md:py-14">
      <div className="section-pad">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-wrap items-end justify-between gap-4 mb-7"
        >
          <div>
            <span className="chip">
              <Receipt className="w-3.5 h-3.5" /> Lookup result
              {source === 'offline-mock' && (
                <span className="ml-2 inline-flex items-center gap-1 text-amber-700">
                  <WifiOff className="w-3 h-3" /> offline demo
                </span>
              )}
            </span>
            <h3 className="mt-3 font-display text-2xl sm:text-3xl font-bold text-navy">
              {status === 'loading'
                ? 'Scanning state portals…'
                : `${results.length} challan${results.length === 1 ? '' : 's'} found for `}
              {status === 'done' && (
                <span className="font-mono tracking-[0.18em] text-police-600">{vehicle}</span>
              )}
            </h3>
          </div>

          {status === 'done' && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="card px-5 py-4 flex items-center gap-5"
            >
              <div>
                <div className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold">
                  Total Fine
                </div>
                <div className="font-display text-lg font-bold text-ink-700 line-through decoration-ink-400/50">
                  {rupee(totalFine)}
                </div>
              </div>
              <div className="w-px h-9 bg-line" />
              <div>
                <div className="text-[11px] uppercase tracking-wider text-police-700 font-semibold">
                  You Pay
                </div>
                <div className="font-display text-lg font-bold text-police-700">
                  {rupee(totalPay)}
                </div>
              </div>
              <button
                onClick={() => proceed(results.map((c) => c.id || c._id))}
                disabled={busyAll}
                className="btn-primary !py-2.5 !px-4 text-sm"
              >
                {busyAll ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Starting…
                  </>
                ) : (
                  <>
                    Resolve all <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>
          )}
        </motion.div>

        {status === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid md:grid-cols-2 gap-4"
          >
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} />
            ))}
          </motion.div>
        )}

        {status === 'done' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid md:grid-cols-2 gap-4"
          >
            {results.map((c, i) => {
              const id = c.id || c._id || c.externalId
              return (
                <ChallanCard
                  key={id}
                  c={c}
                  index={i}
                  onProceed={proceed}
                  busy={busyId === id || busyAll}
                />
              )
            })}
          </motion.div>
        )}
      </div>
    </section>
  )
}
