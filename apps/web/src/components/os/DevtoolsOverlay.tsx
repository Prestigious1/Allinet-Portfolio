'use client'

import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOSStore } from '@/store/os.store'

export default function DevtoolsOverlay() {
  const { devtoolsOpen, closeDevtools, windows, theme } = useOSStore()
  const [fps, setFps] = useState(0)
  const [memory, setMemory] = useState<{ used: number; total: number; limit: number } | null>(null)
  const [authStatus, setAuthStatus] = useState<boolean | null>(null)
  
  const frameRef = useRef(0)
  const lastTimeRef = useRef(performance.now())
  
  useEffect(() => {
    if (!devtoolsOpen) return
    
    // FPS Counter
    let animationFrameId: number
    const calcFps = () => {
      frameRef.current++
      const now = performance.now()
      const elapsed = now - lastTimeRef.current
      if (elapsed >= 1000) {
        setFps(Math.round((frameRef.current * 1000) / elapsed))
        frameRef.current = 0
        lastTimeRef.current = now
      }
      animationFrameId = requestAnimationFrame(calcFps)
    }
    animationFrameId = requestAnimationFrame(calcFps)
    
    // Memory polling
    const memInterval = setInterval(() => {
      const perf = performance as any
      if (perf.memory) {
        setMemory({
          used: Math.round(perf.memory.usedJSHeapSize / 1048576),
          total: Math.round(perf.memory.totalJSHeapSize / 1048576),
          limit: Math.round(perf.memory.jsHeapSizeLimit / 1048576)
        })
      }
    }, 1000)

    // Auth check
    try {
      const keys = Object.keys(localStorage)
      setAuthStatus(keys.some(k => k.includes('supabase') && k.includes('auth-token')))
    } catch {
      setAuthStatus(false)
    }
    
    return () => {
      cancelAnimationFrame(animationFrameId)
      clearInterval(memInterval)
    }
  }, [devtoolsOpen])
  
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && devtoolsOpen) {
        closeDevtools()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [devtoolsOpen, closeDevtools])

  if (process.env.NODE_ENV !== 'development' && !authStatus) {
    // Failsafe: Do not render in production unless user has admin session
    return null
  }

  return (
    <AnimatePresence>
      {devtoolsOpen && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="fixed top-20 left-4 z-[9999] pointer-events-none select-none font-mono text-xs w-72"
        >
          <div className="bg-black/90 border border-gold/40 shadow-[0_0_15px_rgba(212,175,55,0.2)] rounded-lg overflow-hidden backdrop-blur-xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-gold/20 to-purple/20 px-3 py-2 border-b border-white/10 flex justify-between items-center pointer-events-auto">
              <span className="text-gold font-bold uppercase tracking-widest text-[10px]">Developer Diagnostics</span>
              <button 
                onClick={closeDevtools}
                className="text-white/40 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Body */}
            <div className="p-3 space-y-3 text-white/80">
              
              {/* Performance */}
              <div>
                <div className="text-purple-light text-[9px] uppercase tracking-wider mb-1">Performance</div>
                <div className="flex justify-between items-center">
                  <span>FPS</span>
                  <span className={fps >= 55 ? 'text-green-400' : fps >= 30 ? 'text-yellow-400' : 'text-red-400'}>
                    {fps || '--'}
                  </span>
                </div>
                {memory && (
                  <div className="flex justify-between items-center mt-1">
                    <span>JS Heap</span>
                    <span>{memory.used} / {memory.total} MB</span>
                  </div>
                )}
              </div>
              
              {/* OS State */}
              <div>
                <div className="text-purple-light text-[9px] uppercase tracking-wider mb-1">OS State</div>
                <div className="flex justify-between items-center">
                  <span>Open Windows</span>
                  <span>{Object.keys(windows).length}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span>Active Theme</span>
                  <span className="text-gold-light">{theme}</span>
                </div>
              </div>
              
              {/* Environment */}
              <div>
                <div className="text-purple-light text-[9px] uppercase tracking-wider mb-1">Environment</div>
                <div className="flex justify-between items-center">
                  <span>NODE_ENV</span>
                  <span className="text-cyan-400">{process.env.NODE_ENV}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span>Viewport</span>
                  <span>{typeof window !== 'undefined' ? `${window.innerWidth}×${window.innerHeight}` : 'SSR'}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span>Admin Session</span>
                  <span className={authStatus ? 'text-green-400' : 'text-white/40'}>
                    {authStatus ? 'ACTIVE' : 'NONE'}
                  </span>
                </div>
              </div>
              
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
