'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BootSequenceProps {
  onComplete: () => void
}

type Phase = 'power' | 'bios' | 'hardware' | 'kernel' | 'ai' | 'services' | 'logo'

const BIOS_TEXT = `ALLINET BIOS (C)2026 Ajibade Alli-Akinkunmi
System RAM: 64512 OK
Loading OS from Quantum Core...`

const HARDWARE_LOGS = [
  { text: 'Checking CPU [Core 0-15]', delay: 200 },
  { text: 'Checking Memory [64GB ECC]', delay: 400 },
  { text: 'Checking GPU [Neural Engine Active]', delay: 600 },
  { text: 'Mounting File System [Ext4]', delay: 800 },
  { text: 'Hardware Diagnostics: PASSED', delay: 1000 },
]

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [phase, setPhase] = useState<Phase>('power')
  const [biosLines, setBiosLines] = useState<string[]>([])
  const [hwLogs, setHwLogs] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  
  const isSkipped = useRef(false)

  const handleSkip = useCallback(() => {
    if (isSkipped.current) return
    isSkipped.current = true
    onComplete()
  }, [onComplete])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (['Escape', 'Enter', ' '].includes(e.key)) handleSkip()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleSkip])

  useEffect(() => {
    if (isSkipped.current) return

    let timeoutIds: NodeJS.Timeout[] = []

    const runSequence = async () => {
      // Phase 0: Power (1.5s)
      await new Promise(r => {
        const id = setTimeout(r, 1500)
        timeoutIds.push(id)
      })
      if (isSkipped.current) return
      setPhase('bios')

      // Phase 1: BIOS (1.5s)
      const lines = BIOS_TEXT.split('\n')
      for (let i = 0; i < lines.length; i++) {
        await new Promise(r => {
          const id = setTimeout(() => {
            setBiosLines(prev => [...prev, lines[i]])
            r(null)
          }, 300)
          timeoutIds.push(id)
        })
        if (isSkipped.current) return
      }
      
      await new Promise(r => {
        const id = setTimeout(r, 500)
        timeoutIds.push(id)
      })
      if (isSkipped.current) return
      setPhase('hardware')

      // Phase 2: Hardware (1s)
      for (const log of HARDWARE_LOGS) {
        await new Promise(r => {
          const id = setTimeout(() => {
            setHwLogs(prev => [...prev, log.text])
            r(null)
          }, log.delay / 5) // Speed up
          timeoutIds.push(id)
        })
        if (isSkipped.current) return
      }

      await new Promise(r => {
        const id = setTimeout(r, 400)
        timeoutIds.push(id)
      })
      if (isSkipped.current) return
      setPhase('kernel')

      // Phase 3: Kernel Progress (1s)
      for (let i = 0; i <= 100; i += 5) {
        await new Promise(r => {
          const id = setTimeout(() => {
            setProgress(i)
            r(null)
          }, 40)
          timeoutIds.push(id)
        })
        if (isSkipped.current) return
      }

      setPhase('ai')

      // Phase 4 & 5: Text flashes (1.5s)
      await new Promise(r => {
        const id = setTimeout(r, 1500)
        timeoutIds.push(id)
      })
      if (isSkipped.current) return
      
      setPhase('services')
      await new Promise(r => {
        const id = setTimeout(r, 1200)
        timeoutIds.push(id)
      })
      if (isSkipped.current) return

      setPhase('logo')
      await new Promise(r => {
        const id = setTimeout(r, 2500)
        timeoutIds.push(id)
      })
      if (isSkipped.current) return

      onComplete()
    }

    runSequence()

    return () => timeoutIds.forEach(clearTimeout)
  }, [onComplete])

  return (
    <div 
      className="fixed inset-0 w-full h-full bg-black z-[100] cursor-pointer flex flex-col items-center justify-center font-mono select-none overflow-hidden"
      onClick={handleSkip}
      onTouchStart={handleSkip}
    >
      <AnimatePresence mode="wait">
        
        {/* Power Phase */}
        {phase === 'power' && (
          <motion.div
            key="power"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, textShadow: '0 0 20px rgba(255,255,255,0.8)' }}
            exit={{ opacity: 0, scale: 2, filter: 'blur(10px)' }}
            transition={{ duration: 1 }}
            className="text-white/20 text-6xl"
          >
            ⏻
          </motion.div>
        )}

        {/* BIOS / Terminal Phases */}
        {(phase === 'bios' || phase === 'hardware' || phase === 'kernel') && (
          <motion.div
            key="terminal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 left-0 w-full p-8 text-amber-500/90 text-sm md:text-base text-shadow-glow flex flex-col items-start gap-1"
          >
            {biosLines.map((l, i) => <div key={i}>{l}</div>)}
            
            {phase !== 'bios' && <div className="mt-4 text-green-400">--- KERNEL INIT ---</div>}
            {hwLogs.map((l, i) => <div key={i} className="text-gray-300">{l}</div>)}
            
            {phase === 'kernel' && (
              <div className="w-full max-w-md mt-8">
                <div className="mb-2 text-gold">Loading Core OS Modules [{progress}%]</div>
                <div className="w-full h-2 bg-white/10 rounded overflow-hidden">
                  <div className="h-full bg-gold transition-all duration-75" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* AI & Services Phases */}
        {phase === 'ai' && (
          <motion.div
            key="ai"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(5px)' }}
            className="text-cyan-400 text-xl md:text-3xl tracking-[0.2em] uppercase font-display text-shadow-glow"
          >
            Neural Core Initializing...
          </motion.div>
        )}

        {phase === 'services' && (
          <motion.div
            key="services"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, filter: 'blur(5px)' }}
            className="text-purple-400 text-lg md:text-2xl tracking-[0.3em] uppercase font-display"
          >
            Decrypting Portfolio Matrix
          </motion.div>
        )}

        {/* Logo Particle Phase */}
        {phase === 'logo' && (
          <motion.div
            key="logo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
            transition={{ duration: 1.5 }}
            className="relative flex items-center justify-center"
          >
            <div className="text-5xl md:text-7xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-gold via-purple to-gold animate-border-flow filter drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]">
              ALLINET OS
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-8 right-8 text-xs text-white/30 uppercase tracking-[0.2em] font-sans">
        Skip [Space / Click]
      </div>
    </div>
  )
}
