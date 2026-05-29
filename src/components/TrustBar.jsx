import React from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Lock, Trash2, Scale } from 'lucide-react'
import { trustBadges } from '../data/content.js'

const ICONS = [ShieldCheck, Lock, Trash2, Scale]

export default function TrustBar() {
  return (
    <section
      aria-labelledby="trust-heading"
      className="relative border-y border-line bg-white/70 backdrop-blur-sm"
    >
      <div className="section-pad py-5">
        <h2 id="trust-heading" className="sr-only">
          Trust and security highlights
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {trustBadges.map((b, i) => {
            const Icon = ICONS[i % ICONS.length]
            return (
              <motion.div
                key={b}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="flex items-center gap-2.5 justify-center md:justify-start text-sm font-medium text-ink-700"
              >
                <span className="w-8 h-8 rounded-lg bg-police-50 border border-police-100 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-police-600" />
                </span>
                {b}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
