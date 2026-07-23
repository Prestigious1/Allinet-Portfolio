'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useOSStore } from '@/store/os.store'
import { DesktopAppData } from '@/core/providers/portfolio/PortfolioProvider'
import { AppId } from '@/types/os.types'

interface Props {
  icon: DesktopAppData
}

export default function DesktopIcon({ icon }: Props) {
  const { openApp } = useOSStore()
  const [isHovered, setIsHovered] = useState(false)
  const [isSelected, setIsSelected] = useState(false)

  const handleOpen = () => {
    setIsSelected(true)
    openApp(icon.appId as AppId)
  }

  return (
    <motion.button
      type="button"
      className="group relative flex flex-col items-center gap-1.5 p-2 rounded-xl w-[72px] text-center cursor-pointer select-none"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onDoubleClick={handleOpen}
      onClick={handleOpen}
      style={{ outline: 'none' }}
      aria-label={icon.label}
    >
      {/* ── Icon Box ── */}
      <motion.div
        className="relative w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
        style={{
          background: isSelected || isHovered
            ? 'rgba(212, 175, 55, 0.15)'
            : 'rgba(255, 255, 255, 0.05)',
          border: isSelected || isHovered
            ? '1px solid rgba(212, 175, 55, 0.4)'
            : '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: isSelected || isHovered
            ? '0 0 20px rgba(212, 175, 55, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
            : '0 4px 12px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s ease',
        }}
      >
        {icon.iconMediaUrl ? (
          <img 
            src={icon.iconMediaUrl} 
            alt={icon.label} 
            className="w-8 h-8 object-contain"
            style={{ 
              filter: icon.iconColor 
                ? `drop-shadow(0 0 8px ${icon.iconColor}88)` 
                : 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))'
            }}
          />
        ) : (
          icon.iconName ?? '📁'
        )}

        {/* Glow dot */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-gold"
            style={{ boxShadow: '0 0 6px rgba(212, 175, 55, 0.8)' }}
          />
        )}
      </motion.div>

      {/* ── Label ── */}
      <span
        className="text-[10px] font-medium leading-tight text-center max-w-full"
        style={{
          color: isSelected || isHovered ? 'rgba(212, 175, 55, 0.95)' : 'rgba(255, 255, 255, 0.75)',
          textShadow: '0 1px 4px rgba(0,0,0,0.8)',
          wordBreak: 'break-word',
          transition: 'color 0.2s ease',
        }}
      >
        {icon.label}
      </span>
    </motion.button>
  )
}
