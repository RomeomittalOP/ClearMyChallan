import React from 'react'
import { motion } from 'framer-motion'
import { Lock, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { safetyPoints } from '../data/content.js'

export default function DataSafety() {
  return (
    <section id="safety" className="relative py-16 md:py-24">
      <div className="section-pad">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left: heading + visual */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5"
          >
            <span className="eyebrow">Security & Privacy</span>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-navy">
              Your Data Is Safe
            </h2>
            <p className="mt-3 text-ink-500 leading-relaxed">
              We treat your information like it&apos;s our own. Everything is
              encrypted, access is restricted to your assigned advocate, and
              your data is permanently deleted once your challan is disposed.
            </p>

            <div className="mt-6 card p-5 flex items-center gap-4">
              <span className="w-12 h-12 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6 text-green-600" />
              </span>
              <div>
                <div className="font-semibold text-navy">Encrypted & privacy-first</div>
                <div className="text-sm text-ink-500">
                  Secure workflow from lookup to disposal.
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: safety points */}
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
            {safetyPoints.map((p, i) => {
              const Icon = p.icon
              return (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.45, delay: i * 0.07 }}
                  className="card p-5"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-lg bg-police-50 border border-police-100 flex items-center justify-center">
                      <Icon className="w-4.5 h-4.5 text-police-600" />
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto" />
                  </div>
                  <h3 className="mt-3 font-display font-bold text-navy">{p.title}</h3>
                  <p className="mt-1 text-sm text-ink-500 leading-relaxed">{p.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
