'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOSStore } from '@/store/os.store'

export default function ContextMenu() {
  const { contextMenu, closeContextMenu } = useOSStore()

  useEffect(() => {
    const handleGlobalClick = () => {
      if (contextMenu.isOpen) {
        closeContextMenu()
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && contextMenu.isOpen) {
        closeContextMenu()
      }
    }
    
    // Slight delay to prevent immediate close on the right-click event itself
    const timeoutId = setTimeout(() => {
      if (contextMenu.isOpen) {
        window.addEventListener('click', handleGlobalClick)
        window.addEventListener('contextmenu', handleGlobalClick)
        window.addEventListener('keydown', handleKeyDown)
      }
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('click', handleGlobalClick)
      window.removeEventListener('contextmenu', handleGlobalClick)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [contextMenu.isOpen, closeContextMenu])

  if (!contextMenu.isOpen) return null

  // Ensure menu stays within screen bounds
  const x = Math.min(contextMenu.position.x, typeof window !== 'undefined' ? window.innerWidth - 200 : contextMenu.position.x)
  const y = Math.min(contextMenu.position.y, typeof window !== 'undefined' ? window.innerHeight - (contextMenu.items.length * 35) : contextMenu.position.y)

  return (
    <AnimatePresence>
      {contextMenu.isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.1 }}
          className="fixed z-[9999] w-48 py-1 rounded-lg glassmorphism-strong shadow-[0_0_15px_rgba(0,0,0,0.8)] border border-white/20 overflow-hidden"
          role="menu"
          aria-label="Context menu"
          style={{ left: x, top: y }}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          {contextMenu.items.map((item, i) => {
            if (item.divider) {
              return <div key={`div-${i}`} className="h-px w-full bg-white/10 my-1" />
            }

            return (
              <button
                key={i}
                disabled={item.disabled}
                onClick={() => {
                  item.action()
                  closeContextMenu()
                }}
                className="w-full text-left px-4 py-1.5 text-xs text-white/90 hover:bg-purple-500/30 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-sans tracking-wide"
              >
                {item.label}
              </button>
            )
          })}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
