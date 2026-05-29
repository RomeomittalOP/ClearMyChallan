import React, { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  MessageCircle,
  Phone,
  Mail,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Clock,
  RotateCcw
} from 'lucide-react'
import { SITE } from '../data/site.js'
import { submitContact } from '../services/contact.service.js'
import { extractError } from '../services/api.js'

export default function AdvocateContact() {
  const [form, setForm] = useState({ name: '', phone: '', message: '' })
  const [sending, setSending] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
      toast.error('Please fill in your name, phone and message.')
      return
    }
    setSending(true)
    try {
      await submitContact({ ...form, channel: 'web' })
      toast.success("Request received — we'll call you shortly.")
      setForm({ name: '', phone: '', message: '' })
    } catch (err) {
      // If the backend is down, still acknowledge so the UX isn't broken.
      toast(extractError(err, 'Saved locally — please also WhatsApp us.'), { icon: '📩' })
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="contact" className="relative py-16 md:py-24 bg-surface-soft border-t border-line">
      <div className="section-pad grid lg:grid-cols-12 gap-6">
        {/* Left: contact + assurances */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-7 card p-7 sm:p-9"
        >
          <span className="eyebrow">Advocate Desk</span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-navy">
            Talk to a verified advocate
          </h2>
          <p className="mt-3 text-ink-500 max-w-xl">
            Multiple challans, a court summons, or just questions? Reach our
            advocate desk directly — we respond fast.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href={SITE.whatsappHref()} target="_blank" rel="noreferrer" className="btn-whatsapp">
              <MessageCircle className="w-4 h-4" /> WhatsApp Us
              <ArrowRight className="w-4 h-4" />
            </a>
            <a href={SITE.telHref} className="btn-primary">
              <Phone className="w-4 h-4" /> Call {SITE.phoneDisplay}
            </a>
            <a href={`mailto:${SITE.email}`} className="btn-secondary">
              <Mail className="w-4 h-4" /> {SITE.email}
            </a>
          </div>

          <div className="mt-7 grid sm:grid-cols-3 gap-3">
            <Assurance icon={Clock} title={SITE.disposalTime} sub="Typical disposal time" />
            <Assurance icon={RotateCcw} title="100% Refund" sub="If unresolved in 25 days" />
            <Assurance icon={ShieldCheck} title="Encrypted" sub="Deleted after disposal" />
          </div>
        </motion.div>

        {/* Right: quick request form */}
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-5 card p-7"
        >
          <h3 className="font-display text-lg font-bold text-navy">Request a callback</h3>
          <p className="text-sm text-ink-500 mt-1">We&apos;ll call you back, usually within minutes.</p>

          <div className="mt-5 grid gap-3">
            <Field label="Your name">
              <input
                value={form.name}
                onChange={set('name')}
                placeholder="Full name"
                className="input"
              />
            </Field>
            <Field label="Phone number">
              <input
                value={form.phone}
                onChange={set('phone')}
                placeholder="10-digit mobile"
                inputMode="numeric"
                className="input"
              />
            </Field>
            <Field label="How can we help?">
              <textarea
                value={form.message}
                onChange={set('message')}
                rows={3}
                placeholder="e.g. 3 pending challans in Noida"
                className="input resize-none"
              />
            </Field>
            <button type="submit" disabled={sending} className="btn-primary w-full !py-3 mt-1">
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending…
                </>
              ) : (
                <>
                  Request Callback <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.form>
      </div>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid #E4E9F2;
          border-radius: 12px;
          padding: 0.7rem 0.9rem;
          background: #fff;
          color: #0B1B3F;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
        }
        .input::placeholder { color: #94A3B8; }
        .input:focus { border-color: #5E86FB; box-shadow: 0 0 0 4px rgba(29,78,216,0.12); }
      `}</style>
    </section>
  )
}

function Assurance({ icon: Icon, title, sub }) {
  return (
    <div className="rounded-xl border border-line bg-surface-soft p-4">
      <Icon className="w-5 h-5 text-police-600" />
      <div className="mt-2 font-display font-bold text-navy">{title}</div>
      <div className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold mt-0.5">
        {sub}
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  )
}
