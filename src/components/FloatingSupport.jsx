import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Phone, X, Headphones } from 'lucide-react'
import { SITE } from '../data/site.js'

export default function FloatingSupport() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            className="mb-3 w-72 card p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-full bg-police-600 flex items-center justify-center">
                <Headphones className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-navy">Need help?</div>
                <div className="text-[11px] text-ink-400">We typically reply in minutes</div>
              </div>
            </div>
            <div className="grid gap-2">
              <a
                href={SITE.whatsappHref()}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium"
              >
                <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
              </a>
              <a
                href={SITE.telHref}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-police-50 border border-police-200 text-police-700 text-sm font-medium"
              >
                <Phone className="w-4 h-4" /> Call {SITE.phoneDisplay}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((s) => !s)}
        className="w-14 h-14 rounded-full bg-police-600 shadow-card flex items-center justify-center text-white"
        aria-label="Toggle support"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>
    </div>
  )
}
