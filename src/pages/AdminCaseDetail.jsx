import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Loader2,
  ShieldCheck,
  LogOut,
  FileText,
  ExternalLink,
  Save,
  Phone,
  Mail,
  Car,
  Hash,
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  IndianRupee,
  Download
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { adminGetCase, adminUpdateCase } from '../services/case.service.js'
import { extractError } from '../services/api.js'

const STATUSES = [
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

function FileViewer({ label, file }) {
  if (!file?.url) {
    return (
      <div className="card p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-ink-400">{label}</div>
        <div className="mt-2 text-sm text-ink-500">No file uploaded.</div>
      </div>
    )
  }

  const isPdf = file.mimeType === 'application/pdf' || /\.pdf($|\?)/i.test(file.url)

  return (
    <div className="card overflow-hidden flex flex-col">
      <div className="p-4 border-b border-line flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-ink-400">{label}</div>
          <div className="mt-0.5 text-sm font-medium text-navy truncate">
            {file.originalName || 'Document'}
          </div>
          <div className="text-[11px] text-ink-400 mt-0.5">
            {file.mimeType || 'file'} ·{' '}
            {file.bytes ? `${Math.round(file.bytes / 1024)} KB` : ''}
          </div>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <a
            href={file.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-line hover:border-police-400 hover:bg-police-50 transition-colors text-navy"
            title="Open in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open
          </a>
          <a
            href={file.url}
            download={file.originalName || true}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-line hover:border-police-400 hover:bg-police-50 transition-colors text-navy"
            title="Download"
          >
            <Download className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="bg-ink-900/3 flex-1 min-h-[280px]">
        {isPdf ? (
          <iframe
            title={`${label} preview`}
            src={`${file.url}#view=FitH`}
            className="w-full h-[420px] bg-white"
          />
        ) : (
          <a href={file.url} target="_blank" rel="noreferrer" className="block">
            <img
              src={file.url}
              alt={`${label} document`}
              className="w-full h-auto max-h-[480px] object-contain bg-surface-soft"
            />
          </a>
        )}
      </div>
    </div>
  )
}

function StatusPill({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
        STATUS_BADGE[status] || 'bg-surface-muted text-ink-500 border-line'
      }`}
    >
      {status}
    </span>
  )
}

export default function AdminCaseDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { user, logout } = useAuth()

  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Editable bits
  const [status, setStatus] = useState('')
  const [quotedPrice, setQuotedPrice] = useState('')
  const [noteDraft, setNoteDraft] = useState('')

  useEffect(() => {
    let cancelled = false
    adminGetCase(id)
      .then((c) => {
        if (cancelled) return
        setDoc(c)
        setStatus(c.status)
        setQuotedPrice(c.quotedPrice || '')
      })
      .catch((e) => {
        toast.error(extractError(e, 'Failed to load case.'))
        nav('/admin')
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [id, nav])

  async function save() {
    if (saving) return
    const patch = {}
    if (status && status !== doc.status) patch.status = status
    if (
      String(quotedPrice) !== String(doc.quotedPrice || '') &&
      !Number.isNaN(Number(quotedPrice))
    ) {
      patch.quotedPrice = Number(quotedPrice)
    }
    if (noteDraft.trim()) patch.note = noteDraft.trim()

    if (Object.keys(patch).length === 0) {
      toast('Nothing to save.', { icon: 'ℹ️' })
      return
    }
    setSaving(true)
    try {
      const updated = await adminUpdateCase(doc.id, patch)
      setDoc(updated)
      setStatus(updated.status)
      setQuotedPrice(updated.quotedPrice || '')
      setNoteDraft('')
      toast.success('Case updated')
    } catch (err) {
      toast.error(extractError(err, 'Update failed.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-soft flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-police-600" />
      </div>
    )
  }
  if (!doc) return null

  const fmt = (n) => Number(n || 0).toLocaleString('en-IN')

  return (
    <div className="min-h-screen bg-surface-soft">
      {/* Top bar */}
      <header className="bg-white border-b border-line sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="w-9 h-9 rounded-lg border border-line bg-white text-ink-500 hover:text-navy hover:border-police-300 flex items-center justify-center"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <Link to="/admin" className="flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-police-600">
                <ShieldCheck className="w-5 h-5 text-white" />
              </span>
              <div>
                <div className="font-display font-bold text-navy text-sm leading-none">
                  ClearMyChallan
                </div>
                <div className="text-[11px] uppercase tracking-wider text-police-600 font-semibold mt-0.5">
                  Case detail
                </div>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-sm text-ink-500">
              {user?.name}
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
        {/* Header strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-5 sm:p-6 mb-6 flex flex-wrap items-start justify-between gap-4"
        >
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold">
              Case ID
            </div>
            <div className="mt-1 font-mono text-2xl font-extrabold text-police-700">
              {doc.caseId}
            </div>
            <div className="text-sm text-ink-500 mt-1">
              Submitted {new Date(doc.createdAt).toLocaleString('en-IN')}
            </div>
          </div>
          <StatusPill status={doc.status} />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: customer + status history */}
          <div className="space-y-6 lg:col-span-1">
            <div className="card p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-3">
                Customer
              </div>
              <div className="grid gap-3 text-sm">
                <div className="flex items-start gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-police-50 border border-police-100 flex items-center justify-center text-police-600 shrink-0">
                    <FileText className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <div className="font-medium text-navy">{doc.name}</div>
                    <div className="text-xs text-ink-400">Full name</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-police-50 border border-police-100 flex items-center justify-center text-police-600 shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </span>
                  <a href={`tel:+91${doc.mobile}`} className="font-medium text-police-700 hover:underline">
                    {doc.mobile}
                  </a>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-police-50 border border-police-100 flex items-center justify-center text-police-600 shrink-0">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  <a href={`mailto:${doc.email}`} className="font-medium text-navy hover:text-police-700 break-all">
                    {doc.email}
                  </a>
                </div>
                {doc.vehicleNumber && (
                  <div className="flex items-start gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-police-50 border border-police-100 flex items-center justify-center text-police-600 shrink-0">
                      <Car className="w-3.5 h-3.5" />
                    </span>
                    <div className="font-mono text-navy tracking-wider">{doc.vehicleNumber}</div>
                  </div>
                )}
                {doc.challanNumber && (
                  <div className="flex items-start gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-police-50 border border-police-100 flex items-center justify-center text-police-600 shrink-0">
                      <Hash className="w-3.5 h-3.5" />
                    </span>
                    <div className="font-mono text-navy">{doc.challanNumber}</div>
                  </div>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={`https://wa.me/91${doc.mobile}?text=${encodeURIComponent(
                    `Hi ${doc.name}, regarding your ClearMyChallan case ${doc.caseId}.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700 hover:bg-green-100"
                >
                  WhatsApp
                </a>
                <a
                  href={`tel:+91${doc.mobile}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-police-50 border border-police-200 text-police-700 hover:bg-police-100"
                >
                  Call
                </a>
              </div>
            </div>

            {/* Status history */}
            <div className="card p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-3 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> Status history
              </div>
              <ol className="space-y-2.5">
                {doc.statusHistory && doc.statusHistory.length > 0 ? (
                  doc.statusHistory
                    .slice()
                    .reverse()
                    .map((s, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <span
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            i === 0 ? 'bg-police-600' : 'bg-line'
                          }`}
                        />
                        <div>
                          <div className={i === 0 ? 'font-semibold text-navy' : 'text-ink-700'}>
                            {s.status}
                          </div>
                          <div className="text-xs text-ink-400">
                            {new Date(s.at).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </li>
                    ))
                ) : (
                  <li className="text-sm text-ink-400">No status changes yet.</li>
                )}
              </ol>
            </div>

            {/* UPI payment proof (shown when customer has submitted UTR) */}
            {doc.paymentReference && (
              <div className="card p-5 border-amber-300 bg-amber-50/40">
                <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-2 flex items-center gap-2">
                  <IndianRupee className="w-3.5 h-3.5" /> Customer payment claim
                </div>
                <div className="text-xs text-ink-400">UTR / Transaction ID</div>
                <div className="font-mono text-base font-bold text-navy mt-0.5 tracking-wider break-all">
                  {doc.paymentReference}
                </div>
                {doc.paymentNote && (
                  <div className="mt-2.5">
                    <div className="text-xs text-ink-400">Note from customer</div>
                    <div className="text-sm text-ink-700 mt-0.5">{doc.paymentNote}</div>
                  </div>
                )}
                {doc.paymentSubmittedAt && (
                  <div className="text-xs text-ink-400 mt-2">
                    Submitted: {new Date(doc.paymentSubmittedAt).toLocaleString('en-IN')}
                  </div>
                )}
                <div className="mt-3 rounded-md bg-amber-100/60 border border-amber-200 px-3 py-2 text-xs text-amber-900 leading-relaxed">
                  <strong>Verify this UTR</strong> in your bank/UPI app, then set
                  status to <span className="font-semibold">Payment Received</span>{' '}
                  in the update form on the right and Save.
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="card p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-3 flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" /> Advocate notes
              </div>
              <div className="space-y-3">
                {doc.advocateNotes && doc.advocateNotes.length > 0 ? (
                  doc.advocateNotes
                    .slice()
                    .reverse()
                    .map((n, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-line bg-surface-soft p-3 text-sm"
                      >
                        <p className="text-ink-700 leading-relaxed whitespace-pre-wrap">{n.message}</p>
                        <div className="text-xs text-ink-400 mt-1.5">
                          {n.authorName || 'Advocate'} ·{' '}
                          {new Date(n.at).toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-sm text-ink-400">No notes yet.</div>
                )}
              </div>
            </div>
          </div>

          {/* Right: documents + action panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid md:grid-cols-2 gap-5">
              <FileViewer label="RC document" file={doc.rc} />
              <FileViewer label="Challan document" file={doc.challan} />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-5 sm:p-6"
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-4">
                Update case
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-ink-500">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="mt-1.5 w-full rounded-xl bg-white border border-line px-3 py-2.5 text-sm text-navy outline-none focus:border-police-400"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink-500">
                    Quoted price (₹)
                  </label>
                  <div className="mt-1.5 relative rounded-xl bg-white border border-line focus-within:border-police-400 focus-within:shadow-ring transition-all">
                    <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                    <input
                      value={quotedPrice}
                      onChange={(e) =>
                        setQuotedPrice(e.target.value.replace(/[^\d]/g, ''))
                      }
                      placeholder="e.g. 1500"
                      inputMode="numeric"
                      className="w-full pl-10 pr-3 py-2.5 bg-transparent outline-none text-navy"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-xs font-semibold text-ink-500">
                  Add advocate note <span className="text-ink-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  rows={3}
                  placeholder="e.g. Customer informed about quoted price. Awaiting payment."
                  className="mt-1.5 w-full rounded-xl bg-white border border-line px-3.5 py-2.5 text-sm text-navy outline-none focus:border-police-400 focus:shadow-ring resize-none"
                />
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-ink-400">
                  Customer is notified by status-change (WhatsApp / email when configured).
                </div>
                <button onClick={save} disabled={saving} className="btn-primary !py-2.5">
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save changes
                    </>
                  )}
                </button>
              </div>

              {doc.payment && (
                <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-700 shrink-0" />
                  <div className="text-sm">
                    <div className="font-semibold text-green-900">
                      Payment received: ₹{fmt((doc.payment.amount || 0) / 100)}
                    </div>
                    <div className="text-xs text-green-800/80">
                      {doc.payment.paymentId} ·{' '}
                      {doc.paidAt && new Date(doc.paidAt).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
