import React, { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { stats } from '../data/content.js'

function Counter({ to, suffix = '' }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  useEffect(() => {
    if (!inView) return
    const duration = 1600
    const start = performance.now()
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setVal(Math.round(eased * to))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to])

  return (
    <span ref={ref}>
      {val.toLocaleString('en-IN')}
      {suffix}
    </span>
  )
}

export default function Stats() {
  return (
    <section
      id="stats"
      aria-labelledby="stats-heading"
      className="relative py-16 md:py-20"
    >
      <div className="section-pad">
        <h2 id="stats-heading" className="sr-only">
          ClearMyChallan by the numbers — resolved challans, savings and on-time disposal
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="card p-5 sm:p-6 text-center"
            >
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-police-600">
                <Counter to={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-1 text-xs uppercase tracking-wider text-ink-400 font-semibold">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
