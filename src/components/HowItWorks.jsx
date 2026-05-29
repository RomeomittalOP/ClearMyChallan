import React from 'react'
import { motion } from 'framer-motion'
import { steps } from '../data/content.js'

export default function HowItWorks() {
  return (
    <section id="how" className="relative py-16 md:py-24 bg-surface-soft border-y border-line">
      <div className="section-pad">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="eyebrow">How it works</span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-navy">
            From lookup to disposed — in 5 steps
          </h2>
        </motion.div>

        <ol className="relative max-w-3xl mx-auto">
          {/* vertical line */}
          <span className="absolute left-[19px] sm:left-1/2 top-2 bottom-2 w-px bg-line sm:-translate-x-1/2" />

          {steps.map((s, i) => (
            <motion.li
              key={s.n}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="relative pl-14 sm:pl-0 sm:grid sm:grid-cols-2 sm:gap-10 items-center pb-8 last:pb-0"
            >
              {/* node */}
              <span className="absolute left-0 sm:left-1/2 top-0 sm:-translate-x-1/2 w-10 h-10 rounded-full bg-police-600 text-white font-display font-bold flex items-center justify-center shadow-soft z-10">
                {s.n}
              </span>

              <div className={`${i % 2 === 0 ? 'sm:text-right sm:pr-12' : 'sm:col-start-2 sm:pl-12'}`}>
                <div className="card p-5 inline-block text-left">
                  <h3 className="font-display text-lg font-bold text-navy">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}
