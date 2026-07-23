'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOSStore } from '@/store/os.store'

export default function Taskbar() {
  const { windows, activeWindowId, minimizeWindow, focusWindow, openCommandPalette, notifications, addNotification, systemApps } = useOSStore()
  const [time, setTime] = useState(new Date())
  const [showVolume, setShowVolume] = useState(false)
  const [volume, setVolume] = useState(80)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const windowEntries = Object.entries(windows)
  const unreadNotifs = notifications.length

  return (
    <div
      className="h-12 w-full glassmorphism flex items-center justify-between px-2 sm:px-4 border-t border-purple-500/20 shadow-[0_0_15px_rgba(124,58,237,0.15)] backdrop-blur-3xl bg-black/70 z-50 select-none"
      role="navigation"
      aria-label="OS Taskbar"
    >
      
      {/* ── Start Button & Brand ── */}
      <div className="flex items-center space-x-2 sm:space-x-4 h-full">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openCommandPalette}
          className="w-9 h-9 rounded-md bg-gradient-to-br from-gold to-purple flex items-center justify-center shadow-[0_0_10px_rgba(212,175,55,0.4)] hover:shadow-[0_0_15px_rgba(212,175,55,0.6)] transition-shadow group"
          title="Start / Command Palette (⌘K)"
        >
          <span className="text-black font-bold text-lg">A</span>
        </motion.button>
        <div className="font-display font-bold text-gold tracking-widest text-sm hidden lg:block opacity-90">ALLINET OS</div>
        
        {/* Search Input (Mock trigger) */}
        <button 
          onClick={openCommandPalette}
          className="hidden md:flex items-center ml-4 px-3 h-8 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-white/40 text-xs w-48 transition-colors"
        >
          <span className="mr-2 text-[10px]">🔍</span>
          <span className="flex-1 text-left">Search...</span>
          <kbd className="font-mono text-[9px] border border-white/20 rounded px-1">⌘K</kbd>
        </button>
      </div>

      {/* ── Running Apps ── */}
      <div className="flex-1 flex items-center justify-center sm:justify-start space-x-1.5 px-4 sm:px-8 overflow-hidden h-full">
        {windowEntries.map(([id, win]) => {
          const isActive = activeWindowId === id && !win.isMinimized
          return (
            <button
              key={id}
              onClick={() => {
                if (isActive) {
                  minimizeWindow(id)
                } else {
                  focusWindow(id)
                }
              }}
              className={`h-9 px-2.5 sm:px-3 flex items-center gap-2 rounded-md text-xs font-medium max-w-[140px] transition-all duration-200 group ${
                isActive 
                  ? 'bg-white/15 text-white border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)]'
                  : 'bg-transparent text-white/60 hover:bg-white/10 hover:text-white border border-transparent'
              }`}
              aria-label={`${win.title}${isActive ? ', active' : ', minimized'}`}
              aria-current={isActive ? 'true' : undefined}
            >
              <span className="text-sm shrink-0 flex items-center justify-center">
                {(() => {
                  const app = systemApps.find(a => a.appId === win.appId)
                  if (app?.iconMediaUrl) {
                    return <img src={app.iconMediaUrl} alt="" className="w-4 h-4 object-contain" />
                  }
                  return app?.iconName || '💻'
                })()}
              </span>
              <span className="truncate hidden sm:block">{win.title}</span>
              {/* Indicator dot */}
              <div className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-t-full transition-all ${isActive ? 'bg-gold' : 'bg-transparent group-hover:bg-white/30'}`} />
            </button>
          )
        })}
      </div>

      {/* ── System Tray ── */}
      <div className="flex items-center space-x-2 sm:space-x-3 text-xs text-white/80 h-full relative">
        
        {/* Expand system tray on desktop */}
        <div className="hidden md:flex items-center space-x-3 mr-2">
          {/* Network */}
          <button 
            className="flex items-center text-sm opacity-80 hover:opacity-100 transition-opacity" 
            title="Network: Connected"
            onClick={() => addNotification({ type: 'info', title: 'Network Status', message: 'Connected to ALLINET Secure Network.' })}
          >
            🛜
          </button>
          
          {/* Battery */}
          <button 
            className="flex items-center text-sm opacity-80 hover:opacity-100 transition-opacity" 
            title="Battery: 100%"
            onClick={() => addNotification({ type: 'info', title: 'Power Management', message: 'Battery at 100%. Power adapter connected.' })}
          >
            🔋
          </button>

          {/* Volume */}
          <div className="relative flex items-center">
            <button 
              className="text-sm opacity-80 hover:opacity-100 transition-opacity"
              onClick={() => setShowVolume(!showVolume)}
              title="Volume"
            >
              {volume > 50 ? '🔊' : volume > 0 ? '🔉' : '🔇'}
            </button>
            <AnimatePresence>
              {showVolume && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full right-0 mb-2 p-3 bg-black/90 backdrop-blur-md border border-white/10 rounded-xl shadow-xl w-32 flex flex-col gap-2 z-50"
                >
                  <div className="text-[10px] text-white/50 uppercase tracking-wider">Volume</div>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-full accent-gold h-1 bg-white/20 rounded-full appearance-none outline-none cursor-pointer" 
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Notifications */}
        <button 
          className="relative w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors"
          title="Notification Center"
          onClick={() => addNotification({ type: 'info', title: 'Notifications', message: `You have ${unreadNotifs} unread notifications.` })}
        >
          <span className="text-sm opacity-80">🔔</span>
          {unreadNotifs > 0 && (
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-lg border border-black animate-pulse">
              {unreadNotifs}
            </span>
          )}
        </button>

        {/* Clock */}
        <button 
          className="group relative px-2.5 py-1.5 hover:bg-white/10 rounded-md transition-colors border border-transparent hover:border-white/5 text-right flex flex-col justify-center min-w-[70px] cursor-pointer"
          onClick={() => addNotification({ type: 'info', title: 'Date & Time', message: time.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) })}
        >
          <div className="font-mono text-[11px] font-medium leading-none mb-0.5">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="font-sans text-[9px] opacity-50 leading-none">
            {time.toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 bg-black/90 border border-white/10 text-white text-[11px] py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
            {time.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </button>
      </div>
    </div>
  )
}
