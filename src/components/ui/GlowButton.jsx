import React from 'react'
import { motion } from 'framer-motion'

export default function GlowButton({
  children,
  variant = 'primary',
  className = '',
  as: As = 'button',
  ...props
}) {
  const base = variant === 'primary' ? 'btn-primary' : 'btn-ghost'
  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="inline-flex"
    >
      <As className={`${base} ${className}`} {...props}>
        {children}
      </As>
    </motion.div>
  )
}
