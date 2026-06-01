import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Upload,
  FileText,
  CheckCircle2,
  Loader2,
  X,
  Lock,
  Phone,
  Mail,
  User,
  Clock,
  ArrowRight,
  Car,
  Hash
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { submitCase } from '../services/case.service.js'
import { extractError } from '../services/api.js'

const MAX_MB = 20

function formatBytes(n) {
  if (!n) return ''
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

function validateFile(file) {
  if (!file) return 'File required'
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
  if (!allowed.includes(file.type)) return 'Only JPG, PNG or PDF allowed'
  if (file.size > MAX_MB * 1024 * 1024) return `Max ${MAX_MB} MB per file`
  return null
}

function FileDropzone({ id, label, file, onFile, accept, optional = false }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const err = file ? validateFile(file) : null

  const handle = (f) => {
    if (!f) return
    const e = validateFile(f)
    if (e) {
      toast.error(`${label}: ${e}`)
      return
    }
    onFile(f)
  }

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2"
      >
        {label}
        {optional && (
          <span className="ml-1.5 normal-case font-normal text-ink-400/80 tracking-normal">
            (optional)
          </span>
        )}
      </label>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          const f = e.dataTransfer.files?.[0]
          if (f) handle(f)
        }}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed p-5 transition-all ${
          dragOver
            ? 'border-police-500 bg-police-50'
            : file
              ? 'border-police-300 bg-police-50/40'
              : 'border-line bg-surface-soft hover:border-police-300 hover:bg-police-50/40'
        }`}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handle(e.target.files?.[0])}
        />

        {!file ? (
          <div className="flex flex-col items-center text-center py-3">
            <span className="w-11 h-11 rounded-full bg-police-100 text-police-700 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </span>
            <p className="mt-3 text-sm font-medium text-navy">
              Drop your {label.toLowerCase()} here
            </p>
            <p className="text-xs text-ink-400 mt-1">
              JPG, PNG or PDF · Max {MAX_MB} MB
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-lg bg-white border border-line flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-police-600" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-navy text-sm truncate">{file.name}</div>
              <div className="text-xs text-ink-400 flex items-center gap-2">
                <span>{formatBytes(file.size)}</span>
                {!err && (
                  <span className="inline-flex items-center gap-1 text-green-700">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onFile(null)
              }}
              className="w-8 h-8 rounded-full hover:bg-white border border-transparent hover:border-line flex items-center justify-center text-ink-400"
              aria-label="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function SuccessScreen({ result }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-7 sm:p-10 max-w-2xl mx-auto text-center"
    >
      <div className="inline-flex w-16 h-16 rounded-full bg-green-50 border border-green-200 items-center justify-center mb-5">
        <CheckCircle2 className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy">
        Documents Received Successfully
      </h2>
      <p className="mt-3 text-ink-500">
        Our advocate will review your case and contact you within{' '}
        <span className="font-semibold text-navy">24 hours</span>.
      </p>

      <div className="mt-7 rounded-xl border border-police-200 bg-police-50 px-5 py-4 inline-block">
        <div className="text-[11px] uppercase tracking-wider text-police-700 font-semibold">
          Your Case ID
        </div>
        <div className="mt-1 font-mono text-xl font-bold text-police-700">
          {result.caseId}
        </div>
      </div>

      <div className="mt-6 text-sm text-ink-500">
        Save this Case ID to track progress anytime. We&apos;ve also linked it to
        your mobile number.
      </div>

      <div className="mt-7 flex flex-wrap gap-3 justify-center">
        <Link to={`/track?caseId=${result.caseId}`} className="btn-primary">
          Track My Case <ArrowRight className="w-4 h-4" />
        </Link>
        <a
          href={`https://wa.me/918000727771?text=${encodeURIComponent(
            `Hi, I just submitted case ${result.caseId}. Please confirm receipt.`
          )}`}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary"
        >
          WhatsApp Us
        </a>
      </div>
    </motion.div>
  )
}

export default function SubmitCase() {
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [email, setEmail] = useState('')
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [challanNumber, setChallanNumber] = useState('')
  const [rcFile, setRcFile] = useState(null)
  const [challanFile, setChallanFile] = useState(null)
  const [sending, setSending] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!rcFile) return toast.error('Please upload your RC document.')
    // Challan upload is optional — advocate collects it during review if needed.
    if (!name.trim() || name.trim().length < 2)
      return toast.error('Please enter your full name.')
    if (!/^[6-9]\d{9}$/.test(mobile))
      return toast.error('Please enter a valid 10-digit Indian mobile number.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return toast.error('Please enter a valid email address.')

    setSending(true)
    setProgress(0)
    try {
      const data = await submitCase(
        {
          name: name.trim(),
          mobile,
          email: email.trim(),
          vehicleNumber: vehicleNumber.trim().toUpperCase(),
          challanNumber: challanNumber.trim(),
          rcFile,
          challanFile
        },
        setProgress
      )
      toast.success('Submitted! Our advocate will reach out within 24 hours.')
      setResult(data)
    } catch (err) {
      toast.error(extractError(err, 'Submission failed. Please try again.'))
    } finally {
      setSending(false)
    }
  }

  return (
    <section
      id="submit"
      className="relative py-14 md:py-20 bg-surface-soft border-y border-line"
    >
      <div className="section-pad">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-9"
        >
          <span className="eyebrow">Submit Your Case</span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-navy">
            Our advocate will contact you within 24 hours
          </h2>
          <p className="mt-3 text-ink-500">
            Upload your RC and Challan, share your contact details — our team
            reviews every case manually and gets back to you with a transparent
            price quote.
          </p>
        </motion.div>

        {result ? (
          <SuccessScreen result={result} />
        ) : (
          <motion.form
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="card p-5 sm:p-7 lg:p-8 max-w-4xl mx-auto"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <FileDropzone
                id="rcFile"
                label="RC Document"
                file={rcFile}
                onFile={setRcFile}
                accept=".jpg,.jpeg,.png,.pdf"
              />
              <FileDropzone
                id="challanFile"
                label="Challan Document"
                file={challanFile}
                onFile={setChallanFile}
                accept=".jpg,.jpeg,.png,.pdf"
                optional
              />
            </div>

            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                  Full Name
                </label>
                <div className="mt-2 relative rounded-xl bg-white border border-line focus-within:border-police-400 focus-within:shadow-ring transition-all">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="As per RC"
                    className="w-full pl-11 pr-4 py-3 bg-transparent outline-none text-navy placeholder:text-ink-400/60"
                    autoComplete="name"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                  Mobile Number
                </label>
                <div className="mt-2 relative rounded-xl bg-white border border-line focus-within:border-police-400 focus-within:shadow-ring transition-all">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                  <input
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile"
                    inputMode="numeric"
                    className="w-full pl-11 pr-4 py-3 bg-transparent outline-none text-navy placeholder:text-ink-400/60"
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                  Email Address
                </label>
                <div className="mt-2 relative rounded-xl bg-white border border-line focus-within:border-police-400 focus-within:shadow-ring transition-all">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    type="email"
                    className="w-full pl-11 pr-4 py-3 bg-transparent outline-none text-navy placeholder:text-ink-400/60"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                  Vehicle Number <span className="text-ink-400/70 font-normal normal-case">(optional)</span>
                </label>
                <div className="mt-2 relative rounded-xl bg-white border border-line focus-within:border-police-400 focus-within:shadow-ring transition-all">
                  <Car className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                  <input
                    value={vehicleNumber}
                    onChange={(e) =>
                      setVehicleNumber(e.target.value.toUpperCase().replace(/\s+/g, ''))
                    }
                    placeholder="e.g. DL10CA1234"
                    maxLength={15}
                    className="w-full pl-11 pr-4 py-3 bg-transparent outline-none text-navy font-mono tracking-wider placeholder:text-ink-400/60"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                  Challan Number <span className="text-ink-400/70 font-normal normal-case">(optional)</span>
                </label>
                <div className="mt-2 relative rounded-xl bg-white border border-line focus-within:border-police-400 focus-within:shadow-ring transition-all">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                  <input
                    value={challanNumber}
                    onChange={(e) => setChallanNumber(e.target.value)}
                    placeholder="If you have it"
                    maxLength={40}
                    className="w-full pl-11 pr-4 py-3 bg-transparent outline-none text-navy font-mono placeholder:text-ink-400/60"
                  />
                </div>
              </div>
            </div>

            {sending && progress > 0 && progress < 100 && (
              <div className="mt-5">
                <div className="flex justify-between text-xs text-ink-500 mb-1.5">
                  <span>Uploading documents…</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-line overflow-hidden">
                  <div
                    className="h-full bg-police-600 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={sending}
              className="btn-primary w-full !py-3.5 mt-6 group"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting…
                </>
              ) : (
                <>
                  Submit My Documents
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-400">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-green-600" />
                Encrypted upload — files deleted after disposal.
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-police-600" />
                Advocate responds within 24 hours.
              </span>
            </div>
          </motion.form>
        )}
      </div>
    </section>
  )
}
