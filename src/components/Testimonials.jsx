import React from 'react'
import { motion } from 'framer-motion'
import { testimonials } from '../data/content.js'
import { Quote, Star } from 'lucide-react'

export default function Testimonials() {
  return (
    <section id="reviews" className="relative py-16 md:py-24">
      <div className="section-pad">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="eyebrow">Trusted by drivers</span>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-navy">
            What our users say
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="card p-6 sm:p-7 relative"
            >
              <Quote className="absolute top-5 right-5 w-7 h-7 text-police-100" />
              <div className="flex items-center gap-1 mb-3">
                {[0, 1, 2, 3, 4].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-ink-700 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-police-600 text-white flex items-center justify-center font-display font-bold">
                  {t.initial}
                </div>
                <div>
                  <div className="font-semibold text-navy">{t.name}</div>
                  <div className="text-xs text-ink-400">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
