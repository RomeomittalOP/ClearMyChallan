import React from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Phone,
  ShieldCheck,
  Clock,
  RotateCcw,
  CheckCircle2,
  Lock
} from 'lucide-react'
import { SITE } from '../data/site.js'
import { trustBadges } from '../data/content.js'

export default function Hero() {
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section id="home" className="relative pt-28 md:pt-36 pb-16 md:pb-20">
      <div className="section-pad">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="chip mb-5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Advocate-assisted traffic challan resolution
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="font-display text-4xl sm:text-5xl lg:text-[56px] leading-[1.08] font-extrabold tracking-tight text-navy"
            >
              Resolve your vehicle challans at prices as low as{' '}
              <span className="text-police-600">60% of the original fine.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mt-5 text-base sm:text-lg text-ink-500 max-w-2xl leading-relaxed"
            >
              Licensed advocates handle the entire process — no court visits, no
              agents. Transparent city-based pricing, disposal in{' '}
              <span className="font-semibold text-ink-700">{SITE.disposalTime}</span>,
              and a full refund if it isn&apos;t resolved in time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-7 flex flex-wrap items-center gap-3"
            >
              <button onClick={() => go('search')} className="btn-primary group">
                Check Your Challan
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <a href={SITE.telHref} className="btn-secondary">
                <Phone className="w-4 h-4" />
                Talk to an Advocate
              </a>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-2.5"
            >
              {trustBadges.map((b) => (
                <span key={b} className="badge-trust">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  {b}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right — assurance card */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card p-6 sm:p-7 relative"
            >
              <div className="flex items-center justify-between">
                <span className="eyebrow">Service Guarantee</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                  <Lock className="w-3 h-3" /> Secure
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                {[
                  {
                    icon: Clock,
                    title: `Disposed in ${SITE.disposalTime}`,
                    sub: 'Most cases closed within 20–25 days.'
                  },
                  {
                    icon: RotateCcw,
                    title: '100% Refund Guarantee',
                    sub: SITE.refundPolicy
                  },
                  {
                    icon: ShieldCheck,
                    title: 'Encrypted & Deleted',
                    sub: 'Data encrypted, then deleted after disposal.'
                  }
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={item.title}
                      className="flex items-start gap-3 rounded-xl border border-line bg-surface-soft p-3.5"
                    >
                      <span className="shrink-0 w-9 h-9 rounded-lg bg-police-600/10 border border-police-200 flex items-center justify-center">
                        <Icon className="w-4.5 h-4.5 text-police-600" />
                      </span>
                      <div>
                        <div className="font-semibold text-navy text-sm">{item.title}</div>
                        <div className="text-xs text-ink-500 mt-0.5">{item.sub}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-5 rounded-xl bg-police-600 p-4 text-white flex items-center justify-between">
                <div>
                  <div className="text-xs text-police-100">Starting from</div>
                  <div className="font-display text-2xl font-bold">60% of fine</div>
                </div>
                <button
                  onClick={() => go('pricing')}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold bg-white/15 hover:bg-white/25 transition-colors px-3.5 py-2 rounded-lg"
                >
                  View pricing <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
