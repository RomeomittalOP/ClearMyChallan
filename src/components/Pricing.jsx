import React from 'react'
import { motion } from 'framer-motion'
import { Clock, RotateCcw, MapPin, Check, ArrowRight } from 'lucide-react'
import { pricingTable } from '../data/content.js'
import { SITE } from '../data/site.js'

export default function Pricing() {
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section id="pricing" className="relative py-16 md:py-24 bg-surface-soft border-y border-line">
      <div className="section-pad">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <span className="eyebrow">Transparent City-Based Pricing</span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-navy">
            Clear pricing, no surprises
          </h2>
          <p className="mt-3 text-ink-500">
            Resolution prices start as low as 60% of the original fine. The exact
            price depends on your city — here&apos;s the full breakdown.
          </p>
        </motion.div>

        {/* Disposal + refund highlight */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-10"
        >
          <div className="card p-5 flex items-center gap-4">
            <span className="w-11 h-11 rounded-xl bg-police-50 border border-police-100 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-police-600" />
            </span>
            <div>
              <div className="font-display font-bold text-navy">Disposal in {SITE.disposalTime}</div>
              <div className="text-sm text-ink-500">Most cases closed within 20–25 days.</div>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-4">
            <span className="w-11 h-11 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5 text-green-600" />
            </span>
            <div>
              <div className="font-display font-bold text-navy">100% Refund Guarantee</div>
              <div className="text-sm text-ink-500">{SITE.refundPolicy}</div>
            </div>
          </div>
        </motion.div>

        {/* City pricing cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pricingTable.map((region, i) => (
            <motion.div
              key={region.region}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className={`card p-6 flex flex-col ${
                region.highlight ? 'ring-2 ring-police-600 relative' : ''
              }`}
            >
              {region.highlight && (
                <span className="absolute -top-3 left-6 text-[11px] font-bold uppercase tracking-wider bg-police-600 text-white px-2.5 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <div className="flex items-center gap-2 text-police-600">
                <MapPin className="w-4 h-4" />
                <h3 className="font-display text-lg font-bold text-navy">{region.region}</h3>
              </div>

              <ul className="mt-4 grid gap-3 flex-1">
                {region.rules.map((r) => (
                  <li key={r.label} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-navy">{r.label}</div>
                      <div className="text-sm text-ink-500">{r.detail}</div>
                    </div>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => go('submit')}
                className="mt-5 btn-secondary w-full !py-2.5 text-sm group"
              >
                Check my challan
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-xs text-ink-400 mt-8 max-w-2xl mx-auto">
          Prices shown are the all-inclusive resolution amount you pay. &quot;Flat
          X%&quot; means you pay X% of the original fine. Final pricing is confirmed
          before payment. Government fees, where applicable, are handled by the
          assigned advocate.
        </p>
      </div>
    </section>
  )
}
