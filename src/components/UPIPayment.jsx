import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  IndianRupee,
  Copy,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowRight,
  ScanLine,
  Sparkles,
  Smartphone
} from 'lucide-react'
import { getUpiConfig, submitPaymentProof } from '../services/case.service.js'
import { extractError } from '../services/api.js'

/**
 * UPI manual payment flow.
 * - Displays the static QR served from /upi-qr.png  (drop a new file into
 *   `public/upi-qr.png` to swap — no code change needed).
 * - Shows the configured UPI ID for copy-paste fallback.
 * - Captures UTR (transaction reference) so the admin can verify in their
 *   bank/UPI app.
 */
export default function UPIPayment({ caseId, amount, onPaid }) {
  const [cfg, setCfg] = useState(null)
  const [loadingCfg, setLoadingCfg] = useState(true)
  const [utr, setUtr] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [qrBroken, setQrBroken] = useState(false)
  const [qrLoaded, setQrLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    getUpiConfig()
      .then((c) => !cancelled && setCfg(c))
      .catch(() => !cancelled && setCfg({ configured: false }))
      .finally(() => !cancelled && setLoadingCfg(false))
    return () => {
      cancelled = true
    }
  }, [])

  const copyUpi = async () => {
    if (!cfg?.upiId) return
    try {
      await navigator.clipboard.writeText(cfg.upiId)
      setCopied(true)
      toast.success('UPI ID copied')
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Could not copy. Long-press to copy manually.')
    }
  }

  const copyAmount = async () => {
    try {
      await navigator.clipboard.writeText(String(amount || 0))
      toast.success(`₹${Number(amount || 0).toLocaleString('en-IN')} copied`)
    } catch {
      /* ignore */
    }
  }

  const onSubmitUtr = async (e) => {
    e.preventDefault()
    if (!/^\d{6,22}$/.test(utr.trim())) {
      return toast.error('Enter a valid UTR (6–22 digits — check your UPI app).')
    }
    setSubmitting(true)
    try {
      await submitPaymentProof(caseId, { utr: utr.trim(), note: note.trim() })
      toast.success('Payment details received. Advocate will verify soon.')
      setSubmitted(true)
      onPaid?.()
    } catch (err) {
      toast.error(extractError(err, 'Could not save payment details.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingCfg) {
    return (
      <div className="rounded-2xl border border-line bg-surface-soft p-5 flex items-center gap-3 text-sm text-ink-500">
        <Loader2 className="w-4 h-4 animate-spin text-police-600" />
        Loading payment options…
      </div>
    )
  }

  // Success state — celebratory checkmark + soft confetti dots
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-7 text-center"
      >
        {/* Confetti dots */}
        {[...Array(14)].map((_, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 0, x: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              y: [0, -60 - (i % 4) * 12],
              x: [0, (i % 2 === 0 ? 1 : -1) * (20 + (i % 3) * 15)],
              scale: [0, 1, 0.6]
            }}
            transition={{ duration: 1.4, delay: 0.1 + (i % 7) * 0.05 }}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${15 + (i * 6) % 70}%`,
              top: '55%',
              backgroundColor:
                ['#16a34a', '#22c55e', '#0ea5e9', '#1D4ED8', '#f59e0b'][i % 5]
            }}
          />
        ))}

        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.1 }}
          className="inline-flex w-16 h-16 rounded-full bg-green-500 text-white items-center justify-center shadow-card"
        >
          <CheckCircle2 className="w-8 h-8" />
        </motion.div>
        <div className="mt-4 font-display text-xl font-bold text-green-900">
          Payment details submitted
        </div>
        <p className="text-sm text-green-900/80 mt-2 max-w-md mx-auto">
          Our advocate is verifying your transaction. Status will change to{' '}
          <span className="font-semibold">Payment Received</span> within a few
          hours — usually faster during business hours.
        </p>
      </motion.div>
    )
  }

  const upiId = cfg?.upiId || ''
  const payeeName = cfg?.payeeName || 'ClearMyChallan'
  const amountText = `₹${Number(amount || 0).toLocaleString('en-IN')}`

  const steps = [
    {
      title: 'Open any UPI app',
      desc: 'PhonePe, Google Pay, Paytm, BHIM — sab chalega.',
      icon: Smartphone
    },
    {
      title: 'Scan the QR',
      desc: 'Use the "Scan & Pay" option in your UPI app.',
      icon: ScanLine
    },
    {
      title: `Pay exactly ${amountText}`,
      desc: 'Enter this amount when prompted. Add Case ID as note (optional).',
      icon: IndianRupee
    },
    {
      title: 'Paste the UTR below',
      desc: 'Your UPI app shows a 12-digit reference after successful payment.',
      icon: ArrowRight
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border border-police-200 bg-gradient-to-br from-white via-police-50/40 to-white shadow-card"
    >
      {/* Subtle decorative orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-40"
        style={{
          background:
            'radial-gradient(circle, rgba(29,78,216,0.18), transparent 70%)',
          filter: 'blur(40px)'
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-20 w-72 h-72 rounded-full opacity-40"
        style={{
          background:
            'radial-gradient(circle, rgba(34,197,94,0.15), transparent 70%)',
          filter: 'blur(50px)'
        }}
      />

      <div className="relative p-5 sm:p-7 space-y-6">
        {/* Header chip + amount */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <span className="chip">
            <Sparkles className="w-3.5 h-3.5" />
            UPI Payment
          </span>
          {upiId && (
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold">
                Pay to
              </div>
              <button
                type="button"
                onClick={copyUpi}
                className="mt-0.5 inline-flex items-center gap-1.5 group"
                title="Copy UPI ID"
              >
                <span className="font-mono text-xs sm:text-sm font-semibold text-navy break-all group-hover:text-police-700 transition-colors">
                  {upiId}
                </span>
                {copied ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-ink-400 group-hover:text-police-600" />
                )}
              </button>
              <div className="text-[11px] text-ink-400">{payeeName}</div>
            </div>
          )}
        </div>

        {/* Big amount card */}
        <motion.button
          type="button"
          onClick={copyAmount}
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.05, type: 'spring', stiffness: 280, damping: 20 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full text-left rounded-xl bg-police-600 text-white p-5 shadow-card hover:shadow-card-hover transition-shadow group"
          title="Tap to copy amount"
        >
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-police-100 font-semibold">
                Amount to pay
              </div>
              <div className="font-display text-4xl sm:text-5xl font-extrabold mt-1 leading-none">
                {amountText}
              </div>
              <div className="text-xs text-police-100/90 mt-2 flex items-center gap-1.5">
                <Copy className="w-3 h-3" /> Tap to copy
              </div>
            </div>
            <div className="hidden sm:block font-mono text-[10px] uppercase tracking-widest text-police-100/80 text-right">
              Case<br />
              <span className="font-display text-sm text-white not-italic">
                {caseId}
              </span>
            </div>
          </div>
        </motion.button>

        {/* QR + steps */}
        <div className="grid lg:grid-cols-[auto_1fr] gap-6 items-start">
          {/* QR with animated frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 22 }}
            className="relative mx-auto lg:mx-0 w-fit"
          >
            {/* Animated dashed gradient frame */}
            <motion.div
              aria-hidden
              animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'linear',
                repeatType: 'reverse'
              }}
              className="absolute -inset-1 rounded-2xl opacity-90"
              style={{
                background:
                  'linear-gradient(135deg, #1D4ED8 0%, #22D3EE 25%, #16A34A 50%, #1D4ED8 100%)',
                backgroundSize: '300% 300%',
                filter: 'blur(6px)'
              }}
            />

            <div className="relative bg-white rounded-2xl border-2 border-white p-4 shadow-card">
              {/* "Scan & Pay" badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 bg-police-600 text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full shadow-soft whitespace-nowrap">
                <ScanLine className="w-3 h-3" /> Scan &amp; Pay
              </div>

              {qrBroken ? (
                <div className="w-[240px] h-[240px] flex flex-col items-center justify-center text-center text-xs text-ink-400 bg-surface-soft border border-dashed border-line rounded-lg p-4">
                  <ScanLine className="w-8 h-8 mb-2 text-ink-400" />
                  <span className="font-semibold text-ink-500">
                    QR not uploaded yet
                  </span>
                  <span className="mt-1.5 leading-relaxed">
                    Pay using the UPI ID above, or contact{' '}
                    <a
                      href="https://wa.me/918000727771"
                      target="_blank"
                      rel="noreferrer"
                      className="text-police-600 underline"
                    >
                      +91 8000727771
                    </a>{' '}
                    on WhatsApp.
                  </span>
                </div>
              ) : (
                <>
                  {!qrLoaded && (
                    <div className="w-[240px] h-[240px] flex items-center justify-center bg-surface-soft rounded-lg">
                      <Loader2 className="w-6 h-6 animate-spin text-police-600" />
                    </div>
                  )}
                  <motion.img
                    src="/upi-qr.png"
                    alt={`UPI QR — pay ${payeeName}`}
                    width={240}
                    height={240}
                    onLoad={() => setQrLoaded(true)}
                    onError={() => setQrBroken(true)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: qrLoaded ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`block w-[240px] h-[240px] object-contain rounded-lg ${
                      qrLoaded ? '' : 'hidden'
                    }`}
                  />

                  {/* Corner brackets for "scanner" feel */}
                  {qrLoaded && (
                    <>
                      <span className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-police-600 rounded-tl-md" />
                      <span className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-police-600 rounded-tr-md" />
                      <span className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-police-600 rounded-bl-md" />
                      <span className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-police-600 rounded-br-md" />
                      {/* Scanning sweep line */}
                      <motion.span
                        aria-hidden
                        initial={{ y: 14 }}
                        animate={{ y: 230 }}
                        transition={{
                          duration: 2.4,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          repeatType: 'reverse'
                        }}
                        className="absolute left-4 right-4 h-[2px] rounded-full pointer-events-none"
                        style={{
                          background:
                            'linear-gradient(90deg, transparent, #1D4ED8, transparent)',
                          boxShadow: '0 0 8px #1D4ED8'
                        }}
                      />
                    </>
                  )}
                </>
              )}
            </div>

            <div className="mt-3 text-center text-xs text-ink-400">
              {payeeName}
            </div>
          </motion.div>

          {/* Steps */}
          <ol className="space-y-2.5">
            {steps.map((s, i) => {
              const Icon = s.icon
              return (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white border border-line hover:border-police-200 hover:shadow-soft transition-all"
                >
                  <span className="shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-police-600 to-police-700 text-white font-display font-bold flex items-center justify-center text-sm shadow-soft">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-navy flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-police-600" />
                      {s.title}
                    </div>
                    <div className="text-xs text-ink-500 mt-0.5 leading-relaxed">
                      {s.desc}
                    </div>
                  </div>
                </motion.li>
              )
            })}
          </ol>
        </div>

        {!upiId && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-start gap-2 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              UPI ID will appear here once the admin sets it in env vars. The
              QR above is still valid for payment.
            </span>
          </div>
        )}

        {/* UTR form */}
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onSubmit={onSubmitUtr}
          className="border-t border-line pt-5 space-y-3"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
              ✓
            </span>
            <h4 className="font-display font-bold text-navy text-base">
              After paying, submit your UTR
            </h4>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-400">
              UPI Transaction Reference (UTR)
            </label>
            <div className="mt-1.5 relative rounded-xl bg-white border border-line focus-within:border-police-400 focus-within:shadow-ring transition-all">
              <input
                value={utr}
                onChange={(e) => setUtr(e.target.value.replace(/\s+/g, ''))}
                placeholder="e.g. 416289763421"
                inputMode="numeric"
                className="w-full px-4 py-3 bg-transparent outline-none text-navy font-mono tracking-[0.18em] text-sm placeholder:text-ink-400/60"
                maxLength={22}
              />
            </div>
            <p className="text-[11px] text-ink-400 mt-1.5">
              The 6–22 digit reference number your UPI app shows after a
              successful payment.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-400">
              Note <span className="font-normal normal-case text-ink-400/70">(optional)</span>
            </label>
            <div className="mt-1.5 relative rounded-xl bg-white border border-line focus-within:border-police-400 focus-within:shadow-ring transition-all">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Paid via Google Pay at 4:30 PM"
                className="w-full px-4 py-3 bg-transparent outline-none text-navy text-sm placeholder:text-ink-400/60"
                maxLength={200}
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={submitting}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
            className="btn-primary w-full !py-3.5 text-base"
          >
            <AnimatePresence mode="wait">
              {submitting ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="inline-flex items-center gap-2"
                >
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting…
                </motion.span>
              ) : (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="inline-flex items-center gap-2"
                >
                  I&apos;ve Paid — Confirm Payment
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <p className="text-[11px] text-ink-400 text-center">
            Our advocate verifies UTRs manually. Status will change to{' '}
            <span className="font-semibold text-ink-500">Payment Received</span>{' '}
            once confirmed.
          </p>
        </motion.form>
      </div>
    </motion.div>
  )
}
