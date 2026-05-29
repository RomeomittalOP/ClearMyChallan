import React from 'react'
import { motion } from 'framer-motion'
import GlassCard from './ui/GlassCard.jsx'
import { features } from '../data/content.js'

export default function WhyChooseUs() {
  return (
    <section id="why" className="relative py-16 md:py-24">
      <div className="section-pad">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="eyebrow">Why ClearMyChallan</span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-navy">
            Built for drivers, priced fairly
          </h2>
          <p className="mt-3 text-ink-500">
            A licensed, transparent and secure alternative to local agents and
            inflated fees.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <GlassCard key={f.title} delay={i * 0.06}>
                <div className="w-11 h-11 rounded-xl bg-police-50 border border-police-100 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-police-600" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-navy">{f.title}</h3>
                <p className="mt-1.5 text-sm text-ink-500 leading-relaxed">{f.desc}</p>
              </GlassCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}
