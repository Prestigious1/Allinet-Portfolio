'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOSStore } from '@/store/os.store'
import { AppId } from '@/types/os.types'

import { getAllCommands } from '@/core/commands/registry'

interface CommandEntry {
  id: string
  label: string
  description: string
  icon: string
  iconMediaUrl?: string
  iconColor?: string | null
  category: 'App' | 'Action' | 'System'
  action: () => void
  keywords?: string[]
}

export default function CommandPalette() {
  const { commandPaletteOpen, closeCommandPalette, openApp, setTheme, theme, systemApps } = useOSStore()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const baseCommands: CommandEntry[] = [
    // ── Actions ──
    {
      id: 'action-theme-cyber', label: 'Theme: Cyber Gold', icon: '🌟', category: 'Action',
      description: 'Switch to Cyber Gold theme',
      action: () => { setTheme('cyber-gold'); closeCommandPalette() },
    },
    {
      id: 'action-theme-midnight', label: 'Theme: Midnight', icon: '🌑', category: 'Action',
      description: 'Switch to Midnight theme',
      action: () => { setTheme('midnight'); closeCommandPalette() },
    },
    {
      id: 'action-theme-matrix', label: 'Theme: Matrix', icon: '💚', category: 'Action',
      description: 'Switch to Matrix theme',
      action: () => { setTheme('matrix'); closeCommandPalette() },
    },
    {
      id: 'action-theme-ice', label: 'Theme: Ice Station', icon: '🧊', category: 'Action',
      description: 'Switch to Ice Station theme',
      action: () => { setTheme('ice-station'); closeCommandPalette() },
    },
    {
      id: 'action-theme-void', label: 'Theme: Void', icon: '⬛', category: 'Action',
      description: 'Switch to Void theme',
      action: () => { setTheme('void'); closeCommandPalette() },
    },
  ]

  const appCommands: CommandEntry[] = systemApps
    .filter(app => app.showInSearch !== false)
    .map(app => ({
      id: `app-${app.appId}`,
      label: app.label,
      icon: app.iconName ?? '📁',
      iconMediaUrl: app.iconMediaUrl,
      iconColor: app.iconColor,
      category: 'App',
      description: `Open ${app.label}`,
      action: () => { openApp(app.appId as AppId); closeCommandPalette() },
      keywords: [app.appId, app.label.toLowerCase()],
    }))

  const sharedCommands: CommandEntry[] = getAllCommands()
    .filter(cmd => !baseCommands.some(b => b.id === cmd.id))
    .map(cmd => ({
      id: cmd.id,
      label: cmd.title,
      description: cmd.description || '',
      icon: cmd.icon,
      category: cmd.group === 'System' ? 'System' : 'Action',
      action: () => {
        cmd.run({
          setTheme: (t) => setTheme(t as any),
          openApp: (appId) => openApp(appId as AppId),
          close: closeCommandPalette,
        })
      },
      keywords: cmd.keywords,
    }))

  const commands = [...appCommands, ...baseCommands, ...sharedCommands]

  const filteredCommands = query.trim() === ''
    ? commands
    : commands.filter(cmd => {
        const q = query.toLowerCase()
        return (
          cmd.label.toLowerCase().includes(q) ||
          cmd.description.toLowerCase().includes(q) ||
          cmd.keywords?.some(kw => kw.includes(q))
        )
      })

  // Reset selection when query changes
  useEffect(() => setSelectedIndex(0), [query])

  // Focus input when opened + focus trap
  const panelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [commandPaletteOpen])

  // Focus trap: keep Tab/Shift+Tab inside the panel while open
  const handleFocusTrap = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return
    const panel = panelRef.current
    if (!panel) return
    const focusable = panel.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus() }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus() }
    }
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      filteredCommands[selectedIndex]?.action()
    } else if (e.key === 'Escape') {
      closeCommandPalette()
    }
  }, [filteredCommands, selectedIndex, closeCommandPalette])

  const categoryColors: Record<string, string> = {
    App: 'text-purple-light bg-purple/20 border-purple/30',
    Action: 'text-gold-light bg-gold/20 border-gold/30',
    System: 'text-white/60 bg-white/10 border-white/20',
  }

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
            onClick={closeCommandPalette}
          />

          {/* Palette Panel */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[201] w-full max-w-xl"
            onKeyDown={handleFocusTrap}
            role="dialog"
            aria-modal="true"
            aria-label="Command Palette — search for apps and actions"
          >
            <div className="glassmorphism-strong rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(124,58,237,0.2)] border border-purple/30">
              {/* Search Input */}
              <div className="flex items-center px-4 py-4 border-b border-white/5">
                <span className="text-white/40 mr-3 text-xl">⌘</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search commands, apps, actions..."
                  className="flex-1 bg-transparent outline-none text-white text-sm placeholder-white/25 font-mono"
                />
                <kbd className="text-white/20 text-xs font-mono border border-white/10 rounded px-1.5 py-0.5">ESC</kbd>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto py-2">
                {filteredCommands.length === 0 ? (
                  <div className="px-4 py-8 text-center text-white/30 text-sm font-mono">
                    No commands found for &quot;{query}&quot;
                  </div>
                ) : (
                  filteredCommands.map((cmd, i) => (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 relative ${
                        selectedIndex === i
                          ? 'bg-purple/10 border-l-2 border-purple-light'
                          : 'border-l-2 border-transparent hover:bg-white/5'
                      }`}
                    >
                      {/* ── Icon ── */}
                      <div
                        className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden"
                        style={{
                          background: cmd.iconMediaUrl
                            ? (cmd.iconColor ? `${cmd.iconColor}22` : 'rgba(255,255,255,0.07)')
                            : 'transparent',
                          border: cmd.iconMediaUrl
                            ? `1px solid ${cmd.iconColor ? `${cmd.iconColor}44` : 'rgba(255,255,255,0.1)'}`
                            : 'none',
                          boxShadow: (selectedIndex === i && cmd.iconMediaUrl)
                            ? `0 0 12px ${cmd.iconColor ?? 'rgba(124,58,237,0.6)'}55`
                            : undefined,
                        }}
                      >
                        {cmd.iconMediaUrl ? (
                          <img
                            src={cmd.iconMediaUrl}
                            alt={cmd.label}
                            className="w-5 h-5 object-contain"
                            style={{
                              filter: cmd.iconColor
                                ? `drop-shadow(0 0 5px ${cmd.iconColor}99)`
                                : 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))',
                            }}
                          />
                        ) : (
                          <span className="text-xl leading-none">{cmd.icon}</span>
                        )}
                      </div>

                      {/* ── Text ── */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white truncate">{cmd.label}</span>
                          <span className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${categoryColors[cmd.category]}`}>
                            {cmd.category}
                          </span>
                        </div>
                        <p className="text-xs text-white/40 truncate mt-0.5">{cmd.description}</p>
                      </div>

                      {/* ── Enter hint ── */}
                      {selectedIndex === i && (
                        <kbd className="text-white/30 text-xs border border-white/10 rounded px-1.5 py-0.5 font-mono shrink-0">↵</kbd>
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Footer hint */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 text-[10px] text-white/25 font-mono">
                <span>↑↓ navigate</span>
                <span>↵ select</span>
                <span>ESC close</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
