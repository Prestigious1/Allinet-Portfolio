'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useOSStore } from '@/store/os.store'

// ── Floating selection copy toolbar (shared design with AION) ───────────────
function SelectionToolbar({ x, y, text, onCopied }: { x: number; y: number; text: string; onCopied: () => void }) {
  return (
    <div
      className="fixed z-[9999] flex flex-col items-center pointer-events-auto"
      style={{ left: x, top: y, transform: 'translateX(-50%) translateY(-100%)' }}
      onMouseDown={e => e.preventDefault()}
    >
      <button
        onClick={() =>
          navigator.clipboard.writeText(text).then(onCopied)
        }
        className="
          flex items-center gap-1.5 px-2.5 py-1
          bg-black/95 border border-gold/50
          text-gold text-[11px] font-mono font-medium
          rounded-full shadow-[0_0_12px_rgba(212,175,55,0.35)]
          hover:border-gold hover:bg-gold/10
          transition-all duration-150 whitespace-nowrap
        "
      >
        <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Copy selection
      </button>
      <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-gold/50 mt-[-1px]" />
    </div>
  )
}

type HistoryEntry = {
  command: string
  output: string | React.ReactNode
  type?: 'error' | 'success' | 'info' | 'warning'
}

const BANNER = `
╔═══════════════════════════════════════════════════════╗
║         ALLINET OS — Terminal v2.0.26                 ║
║         © 2026 Ajibade Alli-Akinkunmi                 ║
╚═══════════════════════════════════════════════════════╝
Type "help" for available commands.`

const HELP_TEXT = `
Available commands:
  about       Open the About application
  projects    Browse my project portfolio  
  resume      View my CV & work experience
  skills      View technical skills
  contact     Get in touch
  github      Open GitHub profile
  aion        Launch AION AI assistant
  settings    Open system settings

  whoami      Display visitor identity
  date        Current date and time
  uptime      System uptime info
  version     OS version information
  motd        Message of the day
  
  ls          List desktop applications
  cat [file]  Display file contents
  ping        Check network status
  theme       Display current theme
  clear       Clear terminal screen
  history     Show command history
  exit        Close terminal window

Easter eggs: Try "sudo rm -rf /", "hack", "matrix", or the Konami code on the desktop!`

const MOTD_MESSAGES = [
  '"The best way to predict the future is to invent it." — Alan Kay',
  '"Any sufficiently advanced technology is indistinguishable from magic." — Arthur C. Clarke',
  '"First, solve the problem. Then, write the code." — John Johnson',
  '"Code is poetry." — WordPress',
  '"In the beginning was the command line." — Neal Stephenson',
]

const FILES: Record<string, string> = {
  'README.txt': `ALLINET OS v2.0.26
Built by Ajibade Alli-Akinkunmi
An award-winning digital operating system portfolio.

Technologies: Next.js 15, React Three Fiber, GSAP, Zustand, TypeScript
Contact: hello@allinet.dev`,
  'bio.txt': `Ajibade Alli-Akinkunmi
Role: Senior Full-Stack Engineer & AI Architect
Specialties: Agentic AI, 3D Web, Cloud Architecture
Years of experience: 8+
Location: Lagos, Nigeria`,
}

// ── Public autocomplete list — hidden commands MUST NOT appear here ──
const PUBLIC_COMMANDS = [
  'help','about','projects','resume','skills','contact','github','aion',
  'settings','whoami','date','uptime','version','motd','ls','cat','ping',
  'theme','history','clear','exit','neofetch','screenfetch','hack','matrix',
]

// ── Developer/Admin mode detection ──
const isDevMode = (): boolean => {
  if (typeof window === 'undefined') return false
  return process.env.NODE_ENV === 'development'
}

const hasAdminSession = (): boolean => {
  if (typeof window === 'undefined') return false
  // Check for Supabase auth token in localStorage
  try {
    const keys = Object.keys(localStorage)
    return keys.some(k => k.includes('supabase') && k.includes('auth-token'))
  } catch {
    return false
  }
}

const isPrivileged = (): boolean => isDevMode() || hasAdminSession()

export default function TerminalApp() {
  const [history, setHistory] = useState<HistoryEntry[]>([
    { command: '', output: BANNER, type: 'info' }
  ])
  const [input, setInput] = useState('')
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const [showDevtools, setShowDevtools] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const { openApp, setTheme, addNotification, closeWindow, openDevtools } = useOSStore()
  const startTime = useRef(Date.now())

  // ── Selection copy toolbar state ──
  const [selToolbar, setSelToolbar] = useState<{ x: number; y: number; text: string } | null>(null)

  const handleOutputMouseUp = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setSelToolbar(null)
      return
    }
    if (!outputRef.current?.contains(sel.anchorNode)) {
      setSelToolbar(null)
      return
    }
    const range = sel.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    setSelToolbar({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      text: sel.toString(),
    })
  }, [])

  // Hide toolbar when selection is cleared
  useEffect(() => {
    const hide = () => {
      const s = window.getSelection()
      if (!s || s.isCollapsed) setSelToolbar(null)
    }
    document.addEventListener('selectionchange', hide)
    return () => document.removeEventListener('selectionchange', hide)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const addOutput = useCallback((command: string, output: string | React.ReactNode, type?: HistoryEntry['type']) => {
    setHistory(prev => [...prev, { command, output, type }])
  }, [])

  const getDebugInfo = (): string => {
    const mem = (performance as any).memory
    const heapUsed = mem ? `${(mem.usedJSHeapSize / 1048576).toFixed(1)} MB` : 'N/A'
    const heapTotal = mem ? `${(mem.totalJSHeapSize / 1048576).toFixed(1)} MB` : 'N/A'
    const windows = useOSStore.getState().windows
    const windowCount = Object.keys(windows).length

    return `
╔══════════════════════════════════════╗
║   ALLINET OS — DEVELOPER DIAGNOSTICS ║
╚══════════════════════════════════════╝

  Environment   : ${process.env.NODE_ENV?.toUpperCase() ?? 'UNKNOWN'}
  Admin session : ${hasAdminSession() ? '[ ACTIVE ]' : '[ NONE ]'}
  JS Heap Used  : ${heapUsed}
  JS Heap Total : ${heapTotal}
  Open Windows  : ${windowCount}
  Theme         : ${useOSStore.getState().theme}
  Viewport      : ${window.innerWidth}×${window.innerHeight}
  Pixel Ratio   : ${window.devicePixelRatio}x
  User Agent    : ${navigator.userAgent.slice(0, 60)}...
  Timestamp     : ${new Date().toISOString()}

  [PRIVILEGED] This output is only visible in dev mode.`
  }

  const processCommand = useCallback((raw: string) => {
    const cmd = raw.trim().toLowerCase()
    const parts = cmd.split(' ')
    const base = parts[0]
    const args = parts.slice(1)

    switch (base) {
      case 'help': return { out: HELP_TEXT, type: 'info' as const }

      case 'about':       openApp('about');    return { out: '[ OK ] Opening About...', type: 'success' as const }
      case 'projects':    openApp('projects'); return { out: '[ OK ] Opening Projects...', type: 'success' as const }
      case 'resume':      openApp('resume');   return { out: '[ OK ] Opening Resume...', type: 'success' as const }
      case 'skills':      openApp('skills');   return { out: '[ OK ] Opening Skills...', type: 'success' as const }
      case 'contact':     openApp('contact');  return { out: '[ OK ] Opening Contact...', type: 'success' as const }
      case 'github':      openApp('github');   return { out: '[ OK ] Opening GitHub...', type: 'success' as const }
      case 'aion':
      case 'ai':          openApp('ai');       return { out: '[ OK ] Initializing AION AI core...', type: 'success' as const }
      case 'settings':    openApp('settings'); return { out: '[ OK ] Opening Settings...', type: 'success' as const }

      case 'whoami':
        return { out: 'visitor_01@allinet-os\nRole: Guest\nClearance: LEVEL_1\nSession: ACTIVE', type: 'info' as const }

      case 'date':
        return { out: new Date().toString(), type: 'info' as const }

      case 'uptime': {
        const ms = Date.now() - startTime.current
        const s = Math.floor(ms / 1000)
        const m = Math.floor(s / 60)
        return { out: `System uptime: ${m}m ${s % 60}s\nAll systems nominal.`, type: 'info' as const }
      }

      case 'version':
        return { out: 'ALLINET OS v2.0.26\nKernel: React 19 / Next.js 16\nUI Engine: Framer Motion + GSAP\nRenderer: Three.js r185', type: 'info' as const }

      case 'motd':
        return { out: `\n  ${MOTD_MESSAGES[Math.floor(Math.random() * MOTD_MESSAGES.length)]}\n`, type: 'info' as const }

      case 'ls':
        return {
          out: `drwxr-xr-x  About/\ndrwxr-xr-x  Projects/\ndrwxr-xr-x  Resume/\ndrwxr-xr-x  Skills/\ndrwxr-xr-x  Contact/\ndrwxr-xr-x  GitHub/\ndrwxr-xr-x  AION/\ndrwxr-xr-x  Settings/\n-rw-r--r--  README.txt\n-rw-r--r--  bio.txt`,
          type: 'info' as const
        }

      case 'cat': {
        const filename = args.join(' ')
        if (!filename) return { out: 'Usage: cat [filename]', type: 'warning' as const }
        const content = FILES[filename]
        if (!content) return { out: `cat: ${filename}: No such file or directory`, type: 'error' as const }
        return { out: content, type: 'info' as const }
      }

      case 'ping':
        return { out: 'PING allinet.dev: 64 bytes\nRTT: 12ms\nStatus: ONLINE ✓\nAll APIs: NOMINAL', type: 'success' as const }

      case 'theme':
        return { out: `Current theme: ${useOSStore.getState().theme}\nAvailable: cyber-gold | midnight | matrix | ice-station | void`, type: 'info' as const }

      case 'history':
        return { out: cmdHistory.slice(-20).map((c, i) => `  ${i + 1}  ${c}`).join('\n') || 'No history.', type: 'info' as const }

      case 'clear':
        setHistory([{ command: '', output: BANNER, type: 'info' }])
        return null

      case 'exit':
      case 'quit': {
        const wins = useOSStore.getState().windows
        const terminalWin = Object.entries(wins).find(([, w]) => w.appId === 'terminal')
        if (terminalWin) closeWindow(terminalWin[0])
        return null
      }

      // ══════════════════════════════════════════════════
      // ── HIDDEN DEVELOPER / ADMIN COMMANDS ──
      // These MUST NOT appear in help, autocomplete, or UI.
      // Gated to dev mode OR authenticated admin session.
      // ══════════════════════════════════════════════════

      case 'admin': {
        const privileged = isPrivileged()
        if (!privileged) {
          // Deliberately ambiguous — looks like a failed command to outsiders
          return { out: `command not found: admin\nType "help" for available commands.`, type: 'error' as const }
        }
        const authenticated = hasAdminSession()
        const target = '/admin'
        addNotification({
          type: 'info',
          title: '🔐 Admin Access',
          message: authenticated ? 'Opening CMS dashboard...' : 'Redirecting to admin login...',
        })
        setTimeout(() => window.open(target, '_blank'), 300)
        return {
          out: authenticated
            ? `[ GRANTED ] Authenticated session detected.\n[ OK ] Opening CMS dashboard...`
            : `[ AUTH ] No active session.\n[ OK ] Redirecting to admin login...\n\nHint: Authenticate at /admin/login`,
          type: 'success' as const,
        }
      }

      case 'debug': {
        if (!isPrivileged()) {
          return { out: `command not found: debug\nType "help" for available commands.`, type: 'error' as const }
        }
        return { out: getDebugInfo(), type: 'info' as const }
      }

      case 'devtools': {
        if (!isPrivileged()) {
          return { out: `command not found: devtools\nType "help" for available commands.`, type: 'error' as const }
        }
        // Signal the OS store to show devtools overlay
        if (typeof openDevtools === 'function') {
          openDevtools()
        }
        return { out: '[ OK ] Opening Developer Tools overlay...\n[ INFO ] Press ESC to close.', type: 'success' as const }
      }

      // ── Easter Eggs ──
      case 'sudo':
        if (raw.trim() === 'sudo rm -rf /') {
          return {
            out: `Permission denied.\n\n  (Did you really think that would work? 😄)\n  This IS a sandboxed environment, visitor.\n  Your machine is safe.`,
            type: 'warning' as const
          }
        }
        return { out: 'sudo: invalid command. This is not your system.', type: 'error' as const }

      case 'hack':
        addNotification({ type: 'warning', title: '⚠ INTRUSION DETECTED', message: 'Just kidding. Welcome, hacker.' })
        return {
          out: `Initializing exploit sequence...\n[▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%\n\nJust kidding 😄 There's nothing to hack here.\nBut your curiosity is noted, visitor_01.`,
          type: 'warning' as const
        }

      case 'matrix':
        setTheme('matrix')
        addNotification({ type: 'success', title: '💚 Matrix Mode', message: 'You are now inside the Matrix.' })
        return { out: 'Wake up, Neo...\nThe Matrix has you.\n\nTheme switched to Matrix mode.', type: 'success' as const }

      case 'neofetch':
      case 'screenfetch':
        return {
          out: `                 ████████         allinet@os\n              ████      ████       -----------------\n           ███              ███    OS: ALLINET OS v2.0.26\n         ██     ▄▄▄▄▄▄▄▄    ██     Kernel: React 19\n        ██    ██        ██   ██    Uptime: ${Math.floor((Date.now() - startTime.current) / 60000)}m\n       ██    ██  ALLINET  ██   ██   Shell: ALLINET CLI\n       ██    ██          ██   ██   Resolution: ${typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '1920x1080'}\n        ██    ██▄▄▄▄▄▄▄▄██   ██    Theme: ${useOSStore.getState().theme}\n         ██              ██  ██    Language: TypeScript\n           ███          ███       Memory: Managed by React\n              ████████████        CPU: Your processor 😄`,
          type: 'info' as const
        }

      case '':
        return { out: '', type: 'info' as const }

      default:
        return { out: `command not found: ${base}\nType "help" for available commands.`, type: 'error' as const }
    }
  }, [openApp, setTheme, addNotification, closeWindow, cmdHistory, openDevtools])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const result = processCommand(input)
      if (input.trim()) {
        setCmdHistory(prev => [...prev, input.trim()])
        setHistoryIdx(-1)
      }
      if (result !== null) {
        addOutput(input, result.out, result.type)
      }
      setInput('')
    } else if (e.key === 'ArrowUp') {
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
      // ── Tab completion only uses PUBLIC_COMMANDS — hidden commands never autocompleted ──
      const match = PUBLIC_COMMANDS.find(c => c.startsWith(input))
      if (match) setInput(match)
    }
  }

  const typeColor = {
    error: 'text-red-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    info: 'text-green-400/80',
  }

  return (
    <div
      className="w-full h-full bg-black/90 font-mono text-sm flex flex-col"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Floating selection toolbar */}
      {selToolbar && (
        <SelectionToolbar
          x={selToolbar.x}
          y={selToolbar.y}
          text={selToolbar.text}
          onCopied={() => {
            setSelToolbar(null)
            window.getSelection()?.removeAllRanges()
          }}
        />
      )}

      {/* Scrollable Output */}
      <div
        ref={outputRef}
        onMouseUp={handleOutputMouseUp}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5 select-text"
      >
        {history.map((entry, i) => (
          <div key={i}>
            {entry.command && (
              <div className="flex items-center gap-1">
                <span className="text-purple-400 shrink-0 select-none">visitor@allinet:~$</span>
                <span className="text-white">{entry.command}</span>
              </div>
            )}
            {entry.output !== '' && (
              <div className={`whitespace-pre-wrap mt-0.5 pl-2 leading-relaxed ${typeColor[entry.type ?? 'info']}`}>
                {entry.output}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Row */}
      <div className="border-t border-white/5 px-4 py-2.5 flex items-center gap-2 bg-black/60">
        <span className="text-purple-400 shrink-0 select-none">visitor@allinet:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none text-white caret-gold"
          autoComplete="off"
          spellCheck={false}
        />
        <motion.div
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.7, repeat: Infinity, repeatType: 'reverse' }}
          className="w-2 h-4 bg-gold shrink-0"
        />
      </div>
    </div>
  )
}
