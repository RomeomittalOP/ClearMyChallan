import React from 'react'

// Subtle, professional light-theme background. No neon, no gaming feel —
// just faint blue tints and a soft grid that fades out.
export default function BackgroundOrbs() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute -top-40 -right-32 w-[560px] h-[560px] rounded-full opacity-60"
        style={{
          background:
            'radial-gradient(circle at center, rgba(29,78,216,0.10), transparent 70%)',
          filter: 'blur(40px)'
        }}
      />
      <div
        className="absolute top-[40%] -left-40 w-[520px] h-[520px] rounded-full opacity-50"
        style={{
          background:
            'radial-gradient(circle at center, rgba(29,78,216,0.08), transparent 70%)',
          filter: 'blur(50px)'
        }}
      />
    </div>
  )
}
