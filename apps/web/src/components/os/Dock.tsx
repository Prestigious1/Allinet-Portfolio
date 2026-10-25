'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useOSStore } from '@/store/os.store'
import { AppId } from '@/types/os.types'

import { DesktopAppData } from '@/core/providers/portfolio/PortfolioProvider'

function DockIcon({ 
  app, 
  mouseX, 
  isOpen, 
  onClick,
  onContextMenu
}: { 
  app: DesktopAppData, 
  mouseX: any, 
  isOpen: boolean,
  onClick: () => void,
  onContextMenu: (e: React.MouseEvent) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isBouncing, setIsBouncing] = useState(false)

  // Distance from cursor to icon center
  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return val - bounds.x - bounds.width / 2
  })

  // Magnification mapping (macOS style)
  const baseWidth = 48
  const maxWidth = 80
  const widthSync = useTransform(distance, [-150, 0, 150], [baseWidth, maxWidth, baseWidth])
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 200, damping: 12 })

  const handleClick = () => {
    setIsBouncing(true)
    onClick()
    setTimeout(() => setIsBouncing(false), 600)
  }

  return (
    <div className="relative flex flex-col items-center" ref={ref}>
      <motion.button
        style={{ width, height: width }}
        className={`group relative rounded-xl flex items-center justify-center text-2xl cursor-pointer ${isBouncing ? 'animate-bounce-dock' : ''}`}
        onClick={handleClick}
        onContextMenu={onContextMenu}
        title={app.label}
        aria-label={app.label}
      >
        {/* Icon background */}
        <div
          className="absolute inset-0 rounded-xl border border-white/20 shadow-lg transition-all duration-200"
          style={{
            background: app.iconColor ? `linear-gradient(to bottom, ${app.iconColor}dd, ${app.iconColor}88)` : 'rgba(255, 255, 255, 0.15)',
            boxShadow: isOpen ? `0 0 15px rgba(212,175,55,0.4)` : undefined,
          }}
        />

        {/* Icon emoji or custom image */}
        <motion.span 
          className="relative z-10 flex items-center justify-center w-full h-full"
          style={{ scale: useTransform(width, [48, 80], [1, 1.5]) }}
        >
          {app.iconMediaUrl ? (
            <img 
              src={app.iconMediaUrl} 
              alt={app.label} 
              className="w-7 h-7 object-contain"
              style={{ 
                filter: app.iconColor 
                  ? `drop-shadow(0 2px 6px ${app.iconColor}99)` 
                  : 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
              }}
            />
          ) : (
            app.iconName
          )}
        </motion.span>

        {/* Tooltip */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-sm text-white text-[11px] py-1 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 font-medium z-50 shadow-lg">
          {app.label}
        </div>
      </motion.button>

      {/* Active dot */}
      <div
        className={`w-1.5 h-1.5 rounded-full mt-1.5 transition-all duration-300 ${isOpen ? 'bg-gold shadow-[0_0_8px_rgba(212,175,55,0.9)]' : 'bg-transparent'}`}
      />
    </div>
  )
}

export default function Dock() {
  const { openApp, closeWindow, windows, openContextMenu, systemApps } = useOSStore()
  const mouseX = useMotionValue(Infinity)
  
  // Hide on mobile (Taskbar takes over)
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (isMobile) return null

  const getWindowId = (appId: string) => Object.keys(windows).find(id => windows[id].appId === appId)

  const handleContextMenu = (e: React.MouseEvent, appId: AppId, appLabel: string) => {
    e.preventDefault()
    e.stopPropagation()
    const winId = getWindowId(appId)
    openContextMenu(
      { x: e.clientX, y: e.clientY - 120 }, // Open slightly above the cursor so it doesn't clip off bottom
      [
        { label: winId ? `Quit ${appLabel}` : `Open ${appLabel}`, action: () => winId ? closeWindow(winId) : openApp(appId) },
        { label: '-', divider: true, action: () => {} },
        { label: 'Pin to Dock (Coming soon)', action: () => {}, disabled: true },
      ]
    )
  }

  return (
    <div 
      className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[44]"
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      role="toolbar"
      aria-label="Application Dock"
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.2 }}
        className="glassmorphism rounded-2xl px-3 py-2 flex items-end gap-2 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_20px_rgba(124,58,237,0.15)] backdrop-blur-2xl bg-black/40"
      >
        {systemApps
          .filter(app => app.showInDock)
          .sort((a, b) => (a.dockPosition ?? 0) - (b.dockPosition ?? 0))
          .map((app) => (
            <DockIcon 
              key={app.id} 
              app={app} 
              mouseX={mouseX} 
              isOpen={!!getWindowId(app.appId)}
              onClick={() => openApp(app.appId as AppId)}
              onContextMenu={(e) => handleContextMenu(e, app.appId as AppId, app.label)}
            />
          ))}
      </motion.div>
    </div>
  )
}
