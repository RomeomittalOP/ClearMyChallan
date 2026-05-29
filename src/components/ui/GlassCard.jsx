import React from 'react'
import { motion } from 'framer-motion'

export default function GlassCard({
  children,
  className = '',
  hover = true,
  delay = 0,
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
      whileHover={hover ? { y: -4, boxShadow: '0 18px 44px -16px rgba(29, 78, 216, 0.22)' } : undefined}
      className={`card p-6 sm:p-7 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}
