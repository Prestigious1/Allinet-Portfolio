'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LuxuryImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl?: string | null
  alt?: string
  title?: string
  subtitle?: string
}

export function LuxuryImageModal({
  isOpen,
  onClose,
  imageUrl,
  alt = 'Full size image preview',
  title,
  subtitle,
}: LuxuryImageModalProps) {
  if (!imageUrl) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/92 backdrop-blur-2xl z-[100] flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden select-none"
        >
          {/* Ambient Luxury Glow behind the image */}
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-purple-600/10 to-amber-300/20 blur-3xl opacity-70 pointer-events-none" />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 15 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={e => e.stopPropagation()}
            className="relative flex flex-col items-center max-w-5xl w-full max-h-[90vh] z-10"
          >
            {/* Header bar */}
            <div className="w-full flex items-center justify-between p-4 mb-2 glassmorphism rounded-2xl border border-gold/30 bg-black/50 shadow-xl">
              <div className="min-w-0 pr-4">
                {title && <h3 className="text-white font-bold text-base md:text-lg font-display truncate">{title}</h3>}
                {subtitle && <p className="text-gold font-mono text-xs truncate mt-0.5">{subtitle}</p>}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <a
                  href={imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-gold/15 hover:bg-gold/25 border border-gold/40 text-gold text-xs font-mono transition-all flex items-center gap-1.5"
                >
                  <span>🔍</span> View Raw File
                </a>

                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-sm border border-white/20 transition-all flex items-center justify-center"
                  title="Close luxury view"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* High-Res Big Luxury Image Frame */}
            <div className="relative max-h-[75vh] w-full flex items-center justify-center p-2 rounded-2xl glassmorphism border-2 border-gold/40 bg-black/80 shadow-[0_0_60px_rgba(212,175,55,0.3)] overflow-hidden group">
              <img
                src={imageUrl}
                alt={alt}
                className="max-h-[72vh] max-w-full object-contain rounded-xl shadow-2xl transition-transform duration-300 group-hover:scale-[1.01]"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
