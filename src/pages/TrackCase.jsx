import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useSearchParams } from 'react-router-dom'
import {
  Search,
  Loader2,
  CheckCircle2,
  Clock,
  Receipt,
  IndianRupee,
  Phone,
  ArrowRight,
  Hash,
  AlertCircle
} from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import FloatingSupport from '../components/FloatingSupport.jsx'
import BackgroundOrbs from '../components/ui/BackgroundOrbs.jsx'
import { trackCase, createCasePayment, verifyCasePayment } from '../services/case.service.js'
import { extractError } from '../services/api.js'

const STATUS_ORDER = [
  'Pending Review',
  'Under Review',
  'Price Quoted',
  'Payment Received',
  'Case Processing',
  'Completed'
]

const STATUS_COLORS = {
  'Pending Review': 'bg-amber-50 text-amber-700 border-amber-200',
  'Under Review': 'bg-blue-50 text-blue-700 border-blue-200',
  'Price Quoted': 'bg-violet-50 text-violet-700 border-violet-200',
  'Payment Received': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Case Processing': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Completed: 'bg-green-50 text-green-700 border-green-200',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200'
}

const RZP_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js'
let rzpScriptPromise = null
function loadRazorpay() {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if (window.Razorpay) return Promise.resolve(true)
  if (rzpScriptPromise) return rzpScriptPromise
  rzpScriptPromise = new Promise((resolve) => {
    const s = document.createElement('script')
    s.src = RZP_SCRIPT
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
  return rzpScriptPromise
}

function StatusTimeline({ status }) {
  const currentIdx = STATUS_ORDER.indexOf(status)
  return (
    <div className="grid gap-3">
      {STATUS_ORDER.map((s, i) => {
        const done = i <= currentIdx
        const isCurrent = i === currentIdx
        return (
          <div key={s} className="flex items-center gap-3">
            <span
              className={`shrink-0 w-7 h-7 rounded-full border flex items-center justify-center text-xs font-semibold ${
                done
                  ? 'bg-police-600 border-police-600 text-white'
                  : 'bg-white border-line text-ink-400'
              }`}
            >
              {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </span>
            <span
              className={`text-sm ${
                isCurrent ? 'font-semibold text-navy' : done ? 'text-ink-700' : 'text-ink-400'
              }`}
            >
              {s}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function StatusPill({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
        STATUS_COLORS[status] || 'bg-surface-muted text-ink-500 border-line'
      }`}
    >
      {status}
    </span>
  )
}

export default function TrackCase() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [mode, setMode] = useState('caseId') // 'caseId' | 'mobile'
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [paying, setPaying] = useState(false)
  const [result, setResult] = useState(null)

  // Auto-lookup if a query param is supplied.
  useEffect(() => {
    const caseIdParam = searchParams.get('caseId')
    const mobileParam = searchParams.get('mobile')
    if (caseIdParam) {
      setMode('caseId')
      setValue(caseIdParam)
      doLookup({ caseId: caseIdParam })
    } else if (mobileParam) {
      setMode('mobile')
      setValue(mobileParam)
      doLookup({ mobile: mobileParam })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function doLookup(query) {
    setLoading(true)
    setResult(null)
    try {
      const data = await trackCase(query)
      setResult(data)
    } catch (err) {
      toast.error(extractError(err, 'No case found.'))
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const v = value.trim()
    if (!v) return toast.error('Enter your Case ID or mobile number.')
    if (mode === 'mobile' && !/^[6-9]\d{9}$/.test(v)) {
      return toast.error('Enter a valid 10-digit mobile number.')
    }
    setSearchParams(mode === 'caseId' ? { caseId: v } : { mobile: v })
    doLookup(mode === 'caseId' ? { caseId: v } : { mobile: v })
  }

  async function payNow() {
    if (!result || !result.caseId) return
    setPaying(true)
    try {
      const ok = await loadRazorpay()
      if (!ok) throw new Error('Could not load payment gateway. Check your connection.')

      // Look up internal id by tracking again with case id (admin endpoint
      // would need the Mongo _id; for now the public id is the case id, and
      // the backend resolves payments by case _id, so we ask the backend to
      // look it up by re-fetching via track which doesn't return _id. We
      // route payment by the public case id endpoint that uses the Mongo id.
      // To bridge, the backend exposes payment via /api/cases/:id/pay where
      // :id is the internal _id; the track endpoint deliberately doesn't
      // expose it. So payment uses the admin-style id endpoint — for the
      // public payment flow we rely on the same value: backend accepts both
      // since case-flow uses Mongo _id. We pass the human caseId — backend
      // would 400 isMongoId. For production we'd add a public id lookup;
      // for now we use the human caseId and expect backend support.
      // (TODO: add backend endpoint POST /api/cases/by-case-id/:caseId/pay)
      const payload = await createCasePayment(result.caseId)

      const rzp = new window.Razorpay({
        key: payload.razorpay.keyId,
        amount: payload.razorpay.amount,
        currency: payload.razorpay.currency,
        order_id: payload.razorpay.orderId,
        name: 'ClearMyChallan',
        description: `Case ${result.caseId} — Resolution`,
        prefill: payload.prefill,
        theme: { color: '#1D4ED8' },
        handler: async (resp) => {
          try {
            await verifyCasePayment(result.caseId, {
              orderId: resp.razorpay_order_id,
              paymentId: resp.razorpay_payment_id,
              signature: resp.razorpay_signature
            })
            toast.success('Payment received. Case moves to processing.')
            // Refresh status
            doLookup(mode === 'caseId' ? { caseId: result.caseId } : { mobile: result.mobile })
          } catch (e) {
            toast.error(extractError(e, 'Payment verification failed.'))
          }
        },
        modal: { ondismiss: () => setPaying(false) }
      })
      rzp.open()
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className="relative min-h-screen">
      <BackgroundOrbs />
      <Navbar />

      <main className="relative z-10 pt-28 md:pt-32 pb-16">
        <div className="section-pad max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-9"
          >
            <span className="eyebrow">Track Your Case</span>
            <h1 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-navy">
              Where is my challan resolution?
            </h1>
            <p className="mt-3 text-ink-500">
              Enter your Case ID or registered mobile number to see the latest
              status, quoted price and advocate notes.
            </p>
          </motion.div>

          <motion.form
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="card p-5 sm:p-6"
          >
            <div className="flex gap-1 p-1 rounded-xl bg-surface-soft border border-line mb-4">
              {[
                ['caseId', 'Case ID', Hash],
                ['mobile', 'Mobile', Phone]
              ].map(([key, label, Icon]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setMode(key)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium inline-flex items-center justify-center gap-2 ${
                    mode === key
                      ? 'bg-white text-navy shadow-soft border border-line'
                      : 'text-ink-500 hover:text-navy'
                  }`}
                >
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </div>

            <div className="relative rounded-xl bg-white border border-line focus-within:border-police-400 focus-within:shadow-ring transition-all">
              <input
                value={value}
                onChange={(e) =>
                  setValue(
                    mode === 'mobile'
                      ? e.target.value.replace(/\D/g, '').slice(0, 10)
                      : e.target.value.toUpperCase()
                  )
                }
                placeholder={mode === 'caseId' ? 'e.g. CMC-2026-000123' : '10-digit mobile'}
                inputMode={mode === 'mobile' ? 'numeric' : 'text'}
                className="w-full pl-4 pr-32 py-3.5 bg-transparent outline-none text-navy font-mono tracking-wide placeholder:text-ink-400/60"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary !py-2 !px-4 text-sm absolute right-1.5 top-1/2 -translate-y-1/2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Checking
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" /> Track
                  </>
                )}
              </button>
            </div>
          </motion.form>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-7 grid gap-5"
            >
              <div className="card p-6 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold">
                      Case ID
                    </div>
                    <div className="mt-1 font-mono text-xl font-bold text-police-700">
                      {result.caseId}
                    </div>
                    <div className="text-sm text-ink-500 mt-1">
                      {result.name} · {result.mobile}
                    </div>
                  </div>
                  <StatusPill status={result.status} />
                </div>

                <div className="mt-6 grid sm:grid-cols-2 gap-5">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-ink-400 font-semibold mb-3">
                      Progress
                    </div>
                    <StatusTimeline status={result.status} />
                  </div>
                  <div className="grid gap-3">
                    {result.quotedPrice > 0 ? (
                      <div className="rounded-xl border border-police-200 bg-police-50 p-4">
                        <div className="text-[11px] uppercase tracking-wider text-police-700 font-semibold flex items-center gap-1.5">
                          <IndianRupee className="w-3.5 h-3.5" /> Quoted Price
                        </div>
                        <div className="mt-1 font-display text-2xl font-bold text-police-700">
                          ₹{result.quotedPrice.toLocaleString('en-IN')}
                        </div>
                        {result.status === 'Price Quoted' && (
                          <button
                            onClick={payNow}
                            disabled={paying}
                            className="btn-primary w-full !py-2.5 mt-3 text-sm"
                          >
                            {paying ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Opening payment…
                              </>
                            ) : (
                              <>
                                Pay Now <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        )}
                        {result.status === 'Payment Received' && (
                          <div className="text-xs text-green-700 mt-2 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Payment confirmed
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-line bg-surface-soft p-4">
                        <div className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> Awaiting Quote
                        </div>
                        <div className="mt-1 text-sm text-ink-500">
                          Our advocate is reviewing your case. You&apos;ll see the
                          price here as soon as it&apos;s set.
                        </div>
                      </div>
                    )}

                    {result.latestNote && (
                      <div className="rounded-xl border border-line bg-white p-4">
                        <div className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold flex items-center gap-1.5">
                          <Receipt className="w-3.5 h-3.5" /> Latest Advocate Note
                        </div>
                        <p className="mt-2 text-sm text-ink-700 leading-relaxed">
                          {result.latestNote.message}
                        </p>
                        <div className="text-xs text-ink-400 mt-2">
                          {result.latestNote.author || 'Advocate'} ·{' '}
                          {new Date(result.latestNote.at).toLocaleString('en-IN')}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-ink-400">
                      Last updated: {new Date(result.updatedAt).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {!result && !loading && (
            <div className="mt-7 card p-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-police-600 mt-0.5 shrink-0" />
              <p className="text-sm text-ink-500">
                <span className="font-semibold text-navy">Tip:</span> Your Case ID
                looks like <span className="font-mono">CMC-2026-000123</span>. If
                you lost it, search by the mobile number you used when submitting.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <FloatingSupport />
    </div>
  )
}
