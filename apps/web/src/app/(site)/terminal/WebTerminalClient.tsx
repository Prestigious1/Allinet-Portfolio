'use client'

/**
 * WebTerminalClient — Standalone public-site CRT terminal
 * TASK-P11-05 / F-027 / F-211
 *
 * Self-contained terminal emulator (no OS store dependency).
 * Green/amber phosphor CRT styling with scanline effect.
 * Commands: demos, now, brief, role, exit (plus help, about, clear, history, date).
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

type HistoryEntry = {
  command: string
  output: string | React.ReactNode
  type?: 'error' | 'success' | 'info' | 'warning'
}

const BANNER = `
╔══════════════════════════════════════════════════════════╗
║   ALLINET Web Terminal v1.0                              ║
║   © 2026 Ajibade Alli-Akinkunmi  ·  allinet.dev          ║
╚══════════════════════════════════════════════════════════╝

Welcome. Type "help" for available commands, or navigate freely.
Tip: Use ↑↓ arrow keys to browse command history.`

const HELP_TEXT = `
  ┌─ Navigation ───────────────────────────────────────────┐
  │  home       Go to the portfolio home (/)               │
  │  demos      Browse interactive engineering demos       │
  │  now        Current sprint priorities & availability   │
  │  brief      Start a project scoping & proposal wizard  │
  │  role       Switch visitor persona (recruiter/client)  │
  │  projects   Explore production case studies            │
  │  concierge  Ask the ALLI AI Concierge anything         │
  │  os         Launch the full ALLINET Desktop OS         │
  └────────────────────────────────────────────────────────┘
  ┌─ System ───────────────────────────────────────────────┐
  │  help       Show this help message                     │
  │  about      About this portfolio                       │
  │  date       Current date and time                      │
  │  history    Show command history                       │
  │  clear      Clear the terminal screen                  │
  │  exit       Navigate back to home (/)                  │
  └────────────────────────────────────────────────────────┘`

const ABOUT_TEXT = `
  Ajibade Alli-Akinkunmi
  ─────────────────────────────────────────────────────────
  Role    : Senior Full-Stack Engineer & AI Architect
  Stack   : Next.js 15 · React 19 · TypeScript · Payload CMS
  Focus   : Agentic AI · Cloud Architecture · 3D Web
  Contact : hello@allinet.dev
  GitHub  : github.com/Allinet-1
  ─────────────────────────────────────────────────────────
  This portfolio is a live system — not a mockup.
  Every feature shown is production-grade engineering.`

const DEMOS_TEXT = `
  ⚡ Interactive Engineering Demos — /demos
  ─────────────────────────────────────────────────────────
  Hall of Operational Fame:

  → Laundry Operations AI     Full-stack SASS operations platform
  → Hall Booking System        Enterprise event venue management
  → ALLINET Concierge AI       RAG-grounded AI with verified KB
  → Project Brief Wizard       Automated scoping & proposal gen

  Navigating to /demos...`

const NOW_TEXT = `
  ⏱  Current Sprint — /now
  ─────────────────────────────────────────────────────────
  Status    : OPEN TO OPPORTUNITIES
  Priority  : Portfolio v2.0 completion & launch
  Timezone  : WAT (UTC+1) · Lagos, Nigeria
  Response  : < 24h guaranteed

  Navigating to /now...`

const BRIEF_TEXT = `
  📝 Project Brief & Proposal Generator — /brief
  ─────────────────────────────────────────────────────────
  Build a project specification in 7 steps.
  Get an instant AI-powered proposal with:
  · Architecture recommendations
  · Phased milestone plan
  · Transparent pricing estimate
  · PDF download + WhatsApp share

  Navigating to /brief...`

const ROLE_TEXT = `
  🔄 Visitor Persona Selector — /#roles
  ─────────────────────────────────────────────────────────
  → 👔 Recruiter Track    Skills matrix, CV, stack deep-dive
  → 🏢 Client Track       ROI metrics, outcomes, case studies
  → 🚀 Founder Track      Architecture, automation, systems

  Navigating to role selector...`

const PUBLIC_COMMANDS = [
  'help', 'about', 'home', 'demos', 'now', 'brief', 'role',
  'projects', 'concierge', 'os', 'date', 'history', 'clear', 'exit',
]

const TYPE_COLOR: Record<string, string> = {
  error:   'text-red-400',
  success: 'text-emerald-400',
  warning: 'text-amber-300',
  info:    'text-green-300/90',
}

export function WebTerminalClient() {
  const router = useRouter()
  const [history, setHistory] = useState<HistoryEntry[]>([
    { command: '', output: BANNER, type: 'info' }
  ])
  const [input, setInput] = useState('')
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const startTime = useRef(Date.now())

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const navigate = useCallback(
    (href: string, delayMs = 800) => {
      setTimeout(() => router.push(href), delayMs)
    },
    [router]
  )

  const processCommand = useCallback(
    (raw: string): { out: string | React.ReactNode; type?: HistoryEntry['type'] } | null => {
      const cmd = raw.trim().toLowerCase()

      switch (cmd) {
        case 'help':
          return { out: HELP_TEXT, type: 'info' }

        case 'about':
          return { out: ABOUT_TEXT, type: 'info' }

        case 'home':
        case 'exit':
        case 'quit':
          navigate('/')
          return { out: '[ OK ] Navigating to home...', type: 'success' }

        case 'demos': {
          navigate('/demos')
          return { out: DEMOS_TEXT, type: 'success' }
        }

        case 'now': {
          navigate('/now')
          return { out: NOW_TEXT, type: 'success' }
        }

        case 'brief': {
          navigate('/brief')
          return { out: BRIEF_TEXT, type: 'success' }
        }

        case 'role': {
          navigate('/#roles')
          return { out: ROLE_TEXT, type: 'success' }
        }

        case 'projects': {
          navigate('/projects')
          return { out: '[ OK ] Loading production case studies... Navigating to /projects', type: 'success' }
        }

        case 'concierge': {
          navigate('/concierge')
          return { out: '[ OK ] Initializing ALLI AI Concierge... Navigating to /concierge', type: 'success' }
        }

        case 'os': {
          navigate('/os')
          return { out: '[ OK ] Booting ALLINET Desktop OS... Navigating to /os', type: 'success' }
        }

        case 'date':
          return { out: new Date().toLocaleString('en-GB', { timeZoneName: 'short' }), type: 'info' }

        case 'history':
          return {
            out: cmdHistory.slice(-20).map((c, i) => `  ${(i + 1).toString().padStart(3)}  ${c}`).join('\n') || '  (empty)',
            type: 'info',
          }

        case 'clear':
          setHistory([{ command: '', output: BANNER, type: 'info' }])
          return null

        case '':
          return null

        default:
          return {
            out: `command not found: ${raw.trim()}\nType "help" for available commands.`,
            type: 'error',
          }
      }
    },
    [cmdHistory, navigate]
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!input.trim() && input === '') return

      const result = processCommand(input)
      setCmdHistory((prev) => (input.trim() ? [...prev, input.trim()] : prev))
      setHistoryIdx(-1)

      if (result === null) {
        setInput('')
        return
      }

      setHistory((prev) => [
        ...prev,
        { command: input, output: result.out, type: result.type },
      ])
      setInput('')
    },
    [input, processCommand]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        const newIdx = historyIdx + 1
        if (newIdx < cmdHistory.length) {
          setHistoryIdx(newIdx)
          setInput(cmdHistory[cmdHistory.length - 1 - newIdx])
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        const newIdx = historyIdx - 1
        if (newIdx < 0) {
          setHistoryIdx(-1)
          setInput('')
        } else {
          setHistoryIdx(newIdx)
          setInput(cmdHistory[cmdHistory.length - 1 - newIdx])
        }
      } else if (e.key === 'Tab') {
        e.preventDefault()
        const match = PUBLIC_COMMANDS.find((c) => c.startsWith(input))
        if (match) setInput(match)
      }
    },
    [historyIdx, cmdHistory, input]
  )

  return (
    <div
      className="w-full h-full flex flex-col bg-black overflow-hidden"
      style={{ fontFamily: '"Fira Code", "Courier New", monospace' }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* CRT scanline overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-10 opacity-[0.04]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,255,0,0.15) 0px, rgba(0,255,0,0.15) 1px, transparent 1px, transparent 3px)',
        }}
      />

      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-black border-b border-green-500/20 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500/70" />
          <span className="w-3 h-3 rounded-full bg-amber-400/70" />
          <span className="w-3 h-3 rounded-full bg-green-500/70" />
          <span className="ml-3 text-xs text-green-400/60 font-mono">ALLINET Web Terminal — visitor@allinet.dev:~</span>
        </div>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="text-xs text-green-400/40 hover:text-green-300 transition-colors font-mono"
          aria-label="Exit terminal and go home"
        >
          [exit]
        </button>
      </div>

      {/* Scrollable output */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 z-20">
        {history.map((entry, i) => (
          <div key={i}>
            {entry.command && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-amber-400/80 shrink-0 select-none text-sm">
                  visitor@allinet:~$
                </span>
                <span className="text-green-100 text-sm">{entry.command}</span>
              </div>
            )}
            {entry.output !== '' && (
              <div
                className={`whitespace-pre-wrap mt-0.5 pl-0 leading-relaxed text-sm ${
                  TYPE_COLOR[entry.type ?? 'info'] ?? TYPE_COLOR.info
                }`}
              >
                {entry.output}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-green-500/15 px-4 py-2.5 flex items-center gap-2 bg-black/80 z-20"
      >
        <span className="text-amber-400/80 shrink-0 select-none text-sm font-mono">
          visitor@allinet:~$
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none text-green-100 text-sm font-mono caret-green-400 placeholder-green-900/60"
          autoComplete="off"
          spellCheck={false}
          aria-label="Terminal command input"
          placeholder=""
          id="web-terminal-input"
        />
        {/* Blinking cursor */}
        <span
          aria-hidden="true"
          className="w-2 h-4 bg-green-400 shrink-0 animate-pulse"
        />
      </form>

      {/* Status bar */}
      <div className="shrink-0 px-4 py-1 bg-green-950/20 border-t border-green-500/10 flex items-center justify-between text-[10px] font-mono text-green-400/40 z-20">
        <span>ALLINET Terminal · {new Date().getFullYear()}</span>
        <span>Type "help" for commands · "exit" to leave</span>
      </div>
    </div>
  )
}
