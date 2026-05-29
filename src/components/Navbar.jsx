import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Menu, X, Phone } from 'lucide-react'
import { navLinks } from '../data/content.js'
import { SITE } from '../data/site.js'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('home')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observers = []
    navLinks.forEach((l) => {
      const el = document.getElementById(l.id)
      if (!el) return
      const obs = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => e.isIntersecting && setActive(l.id)),
        { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [])

  const go = (id) => {
    setOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-line shadow-soft'
          : 'bg-white/70 backdrop-blur-sm border-b border-transparent'
      }`}
    >
      <nav className="section-pad flex items-center justify-between h-16 md:h-[72px]">
        <button onClick={() => go('home')} className="flex items-center gap-2.5" aria-label="ClearMyChallan home">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-police-600 shadow-soft">
            <ShieldCheck className="w-5 h-5 text-white" />
          </span>
          <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-navy">
            ClearMy<span className="text-police-600">Challan</span>
          </span>
        </button>

        {/* Desktop nav */}
        <ul className="hidden lg:flex items-center gap-1">
          {navLinks.map((l) => (
            <li key={l.id}>
              <button
                onClick={() => go(l.id)}
                className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                  active === l.id
                    ? 'text-police-700'
                    : 'text-ink-500 hover:text-police-700'
                }`}
              >
                {active === l.id && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute left-3.5 right-3.5 -bottom-0.5 h-0.5 rounded-full bg-police-600"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          <a href={SITE.telHref} className="btn-secondary !px-4 !py-2.5 text-sm">
            <Phone className="w-4 h-4" />
            {SITE.phoneDisplay}
          </a>
          <button onClick={() => go('search')} className="btn-primary !px-5 !py-2.5 text-sm">
            Check Challan
          </button>
        </div>

        <button
          className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-line bg-white text-ink-700"
          onClick={() => setOpen((s) => !s)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden border-t border-line bg-white"
          >
            <ul className="section-pad py-4 grid gap-1">
              {navLinks.map((l) => (
                <li key={l.id}>
                  <button
                    onClick={() => go(l.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium ${
                      active === l.id
                        ? 'bg-police-50 text-police-700'
                        : 'text-ink-500 hover:bg-surface-soft'
                    }`}
                  >
                    {l.label}
                  </button>
                </li>
              ))}
              <li className="pt-2 grid grid-cols-2 gap-2">
                <a href={SITE.telHref} className="btn-secondary text-sm">
                  <Phone className="w-4 h-4" /> Call
                </a>
                <button onClick={() => go('search')} className="btn-primary text-sm">
                  Check Challan
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
