import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, FileText, Calendar } from 'lucide-react'
import { legalSections, legalLastUpdated } from '../data/content.js'

// Compact legal-pages section (Privacy, Terms, Refund, Disclaimer).
// Lives at the bottom of the home page; the footer links here via #anchors.
// Whichever card matches the current `location.hash` opens automatically
// on load, so deep links like /#privacy take the user straight to it.
export default function Legal() {
  const [open, setOpen] = useState(null)

  useEffect(() => {
    const sync = () => {
      const id = window.location.hash.replace('#', '')
      if (legalSections.some((s) => s.id === id)) setOpen(id)
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  return (
    <section
      id="legal"
      aria-labelledby="legal-heading"
      className="relative py-16 md:py-20 bg-surface-soft border-t border-line"
    >
      <div className="section-pad max-w-4xl">
        <div className="text-center mb-10">
          <span className="eyebrow inline-flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Legal
          </span>
          <h2
            id="legal-heading"
            className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-navy"
          >
            Policies &amp; disclosures
          </h2>
          <p className="mt-3 text-ink-500 inline-flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Last updated: {legalLastUpdated}
          </p>
        </div>

        <div className="grid gap-3">
          {legalSections.map((s, i) => {
            const isOpen = open === s.id
            return (
              <motion.article
                key={s.id}
                id={s.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="card overflow-hidden scroll-mt-24"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : s.id)}
                  aria-expanded={isOpen}
                  aria-controls={`${s.id}-body`}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                >
                  <h3 className="font-display text-lg font-bold text-navy">
                    {s.title}
                  </h3>
                  <span className="shrink-0 w-7 h-7 rounded-lg bg-police-50 border border-police-100 flex items-center justify-center text-police-600">
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`${s.id}-body`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-5 pb-6 text-ink-500 leading-relaxed">
                        <p className="text-ink-700">{s.intro}</p>
                        {s.blocks.map((b) => (
                          <div key={b.h} className="mt-5">
                            <h4 className="font-semibold text-navy">{b.h}</h4>
                            <ul className="mt-2 list-disc pl-5 space-y-1.5">
                              {b.p.map((line, j) => (
                                <li key={j}>{line}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            )
          })}
        </div>

        <p className="mt-8 text-xs text-ink-400 text-center max-w-2xl mx-auto">
          These documents are provided in good faith and are subject to change.
          For questions, contact{' '}
          <a href="mailto:help@clearmychallan.co.in" className="text-police-600 underline">
            help@clearmychallan.co.in
          </a>
          .
        </p>
      </div>
    </section>
  )
}
