'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ImageViewerProps {
  src: string | null
  alt?: string
  onClose: () => void
}

export default function ImageViewer({ src, alt, onClose }: ImageViewerProps) {
  // Lock body scroll when open if needed, but in an OS window environment, it might not be strictly necessary.
  
  return (
    <AnimatePresence>
      {src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-8"
          onClick={onClose}
        >
          <button 
            className="absolute top-6 right-6 text-white/50 hover:text-white bg-black/50 hover:bg-white/10 rounded-full w-10 h-10 flex items-center justify-center transition-colors z-10 border border-white/10"
            onClick={onClose}
            aria-label="Close image"
          >
            ✕
          </button>
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            src={src}
            alt={alt || 'Fullscreen view'}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
