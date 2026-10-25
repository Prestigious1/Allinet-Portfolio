'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useChat, Chat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { motion } from 'framer-motion'
import { useOSStore } from '@/store/os.store'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Mutable ref shared between the transport body closure and the sessionId effect.
const _sessionIdRef = { current: '' }

// ── DIAGNOSTIC ─────────────────────────────────────────────────────────────
const _diagStart = performance.now()
console.log('[AION][DIAG] AIApp.tsx module loaded at T+0ms')

// HUD Component for AION Aesthetic
function AIONHud({ isThinking }: { isThinking: boolean }) {
  const hexPoints = (cx: number, cy: number, r: number) => {
    return Array.from({ length: 6 }).map((_, i) => {
      const angle_deg = 60 * i - 30
      const angle_rad = Math.PI / 180 * angle_deg
      return `${cx + r * Math.cos(angle_rad)},${cy + r * Math.sin(angle_rad)}`
    }).join(' ')
  }

  return (
    <div className="flex flex-col items-center justify-center py-6 w-full opacity-80 pointer-events-none">
      <motion.div
        animate={isThinking
          ? { scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }
          : { scale: 1, opacity: 0.6 }
        }
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-32 h-32 relative"
      >
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]">
          {[60, 70, 80, 90].map((r, i) => (
            <polygon
              key={i}
              points={hexPoints(100, 100, r)}
              fill="none"
              stroke="rgba(212,175,55,0.4)"
              strokeWidth="1"
              className={`ring ring-${i}`}
              strokeDasharray={i % 2 === 0 ? "4 4" : "none"}
            />
          ))}
          <text x="100" y="105" textAnchor="middle" fill="#D4AF37" fontSize="24" fontWeight="bold" letterSpacing="2" className="animate-pulse">
            AION
          </text>
        </svg>
      </motion.div>
      <div className="text-gold text-xs font-mono mt-2 tracking-widest uppercase opacity-70">
        {isThinking ? 'Processing...' : 'System Online'}
      </div>
    </div>
  )
}

// ── Markdown message bubble with copy button ────────────────────────────────
function MarkdownMessage({ content, isAssistant }: { content: string; isAssistant: boolean }) {
  const [copied, setCopied] = useState(false)
  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleCopy = useCallback((text: string, callback?: () => void) => {
    navigator.clipboard.writeText(text).then(() => {
      if (callback) callback()
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [])

  const handleSelection = () => {
    const sel = window.getSelection()
    if (sel && sel.toString().length > 0 && containerRef.current?.contains(sel.anchorNode)) {
      const range = sel.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      setSelection({
        text: sel.toString(),
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      })
    } else {
      setSelection(null)
    }
  }

  return (
    <div className="relative group max-w-[85%] select-text" ref={containerRef} onMouseUp={handleSelection}>
      {selection && (
        <div
          className="fixed z-50 flex flex-col items-center pointer-events-auto"
          style={{ left: selection.x, top: selection.y, transform: 'translateX(-50%) translateY(-100%)', zIndex: 9999 }}
          // Prevent the mousedown from clearing the browser selection before we read it
          onMouseDown={e => e.preventDefault()}
        >
          <button
            onClick={() => {
              navigator.clipboard.writeText(selection.text).then(() => {
                setSelection(null)
                window.getSelection()?.removeAllRanges()
              })
            }}
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
          {/* Down-pointing caret */}
          <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-gold/50 mt-[-1px]" />
        </div>
      )}
      <div
        className={`p-3 rounded-lg text-sm leading-relaxed ${
          isAssistant
            ? 'bg-black/40 border border-gold/20 text-gold-light rounded-bl-none shadow-[0_0_15px_rgba(212,175,55,0.1)] prose-invert'
            : 'bg-purple-900/50 border border-purple-500/30 text-white rounded-br-none'
        }`}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-gold underline underline-offset-2 hover:text-yellow-300 transition-colors break-all">
                {children}
              </a>
            ),
            pre: ({ children }) => (
              <pre className="bg-black/60 border border-gold/10 rounded p-2 my-1.5 overflow-x-auto whitespace-pre">
                {children}
              </pre>
            ),
            code: ({ children }) => (
              <code className="bg-black/50 border border-gold/10 rounded px-1 text-xs font-mono text-green-300">
                {children}
              </code>
            ),
            strong: ({ children }) => <strong className="text-gold font-semibold">{children}</strong>,
            p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
            ul: ({ children }) => <ul className="list-disc list-inside mb-1.5 space-y-0.5 pl-2">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-1.5 space-y-0.5 pl-2">{children}</ol>,
            li: ({ children }) => <li className="text-sm">{children}</li>,
            h1: ({ children }) => <h1 className="text-base font-bold text-gold mt-2 mb-1">{children}</h1>,
            h2: ({ children }) => <h2 className="text-sm font-bold text-gold mt-2 mb-1">{children}</h2>,
            h3: ({ children }) => <h3 className="text-xs font-bold text-gold/80 mt-1.5 mb-0.5">{children}</h3>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-gold/40 pl-3 italic text-white/70 my-1.5">{children}</blockquote>
            ),
            hr: () => <hr className="border-gold/20 my-2" />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      {isAssistant && (
        <button
          onClick={() => handleCopy(content)}
          title={copied ? 'Copied!' : 'Copy response'}
          className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-black/70 border border-gold/30 hover:border-gold/70 text-gold/70 hover:text-gold rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-mono shadow-md"
        >
          {copied ? (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      )}
    </div>
  )
}

export default function AIApp() {
  const openApp = useOSStore(s => s.openApp)
  const closeWindow = useOSStore(s => s.closeWindow)
  const minimizeWindow = useOSStore(s => s.minimizeWindow)
  const maximizeWindow = useOSStore(s => s.maximizeWindow)
  const setTheme = useOSStore(s => s.setTheme)
  const addNotification = useOSStore(s => s.addNotification)
  const windows = useOSStore(s => s.windows)

  const bottomRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState<string>('')

  // Generate or retrieve session ID on mount
  useEffect(() => {
    let sid = sessionStorage.getItem('aion_session_id')
    if (!sid) {
      sid = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('aion_session_id', sid)
    }
    document.cookie = `aion_session_id=${sid}; path=/; max-age=31536000; SameSite=Strict`
    setSessionId(sid)
  }, [])

  // Create Chat instance once
  const [chat] = useState(() => {
    let instance: InstanceType<typeof Chat>
    try {
      instance = new Chat({
        transport: new DefaultChatTransport({
          api: '/api/ai/chat',
          body: () => ({ sessionId: _sessionIdRef.current || undefined }),
        }),

        messages: [
          {
            id: 'aion-greeting',
            role: 'assistant',
            parts: [{ type: 'text', text: 'I am AION, the ALLINET OS AI Assistant. How can I help you today?' }],
            metadata: undefined,
          } as any,
        ],

        // Client-side UI side-effect handler triggered when tool call chunks arrive
        onToolCall: ({ toolCall }) => {
          const toolName = toolCall.toolName
          const payload: any = (toolCall as any).args || (toolCall as any).arguments || (toolCall as any).input || {}
          console.log('[AION][UI-ACTION] Triggering UI side effect for:', toolName, payload)

          try {
            if (toolName === 'open_application') {
              openApp(payload.appId)
            }
            else if (toolName === 'close_application') {
              const win = Object.values(windows).find((w: any) => w.appId === payload.appId)
              if (win) closeWindow((win as any).id)
            }
            else if (toolName === 'minimize_application') {
              const win = Object.values(windows).find((w: any) => w.appId === payload.appId)
              if (win) minimizeWindow((win as any).id)
            }
            else if (toolName === 'maximize_application') {
              const win = Object.values(windows).find((w: any) => w.appId === payload.appId)
              if (win) maximizeWindow((win as any).id)
            }
            else if (toolName === 'change_theme') {
              setTheme(payload.theme)
            }
            else if (toolName === 'add_notification') {
              addNotification({ title: payload.title, message: payload.message, type: payload.type })
            }
            else if (toolName === 'download_cv') {
              const link = document.querySelector<HTMLAnchorElement>('[data-cv-download]')
              if (link) link.click()
              else openApp('resume')
            }
            else if (toolName === 'schedule_meeting') {
              openApp('contact')
            }
          } catch (uiErr) {
            console.error('[AION][UI-ACTION] Error performing UI action:', uiErr)
          }
        },
      })
    } catch (err: any) {
      console.error('[AION][DIAG] CHAT INSTANTIATION CRASHED:', err?.message)
      throw err
    }
    return instance
  })

  useEffect(() => {
    if (sessionId) {
      _sessionIdRef.current = sessionId
    }
  }, [sessionId])

  const { messages, sendMessage, status, error, stop, clearError } = useChat({ chat })

  const isLoading = status === 'streaming' || status === 'submitted'

  // Auto-scroll to bottom
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    if (error) {
      clearError()
    }

    try {
      sendMessage({ role: 'user', parts: [{ type: 'text', text: trimmed }] })
    } catch (err: any) {
      console.error('[AION] sendMessage failed:', err?.message)
    }
    setInput('')
  }

  const handleStop = () => {
    try {
      stop()
      if (error) clearError()
    } catch (e) {
      console.error('[AION] Stop failed:', e)
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-black/60 backdrop-blur-md text-white p-4 relative font-sans">

      {/* AION Animated HUD */}
      <div className="absolute top-0 left-0 w-full flex justify-center pointer-events-none z-0">
        <AIONHud isThinking={isLoading} />
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto space-y-4 z-10 px-2 pb-4 mt-36 scrollbar-thin scrollbar-thumb-purple-900 scrollbar-track-transparent">
        {messages.map((msg, i) => {
          // Extract text from parts array
          const textContent = msg.parts
            ?.filter((p: any) => p.type === 'text')
            .map((p: any) => p.text)
            .join('') || ''

          const toolInvs = msg.parts?.filter((p: any) => p.type === 'tool-invocation') || []

          return (
            <motion.div
              key={msg.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              {textContent && (
                <MarkdownMessage
                  content={textContent}
                  isAssistant={msg.role === 'assistant'}
                />
              )}

              {/* Display tool call indicators */}
              {toolInvs?.map((tool: any, ti: number) => (
                <div key={ti} className="mt-1 text-xs text-gold/60 font-mono flex items-center gap-2 bg-black/30 px-2.5 py-1 rounded border border-gold/10">
                  <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                  Executing: {tool.toolName || tool.toolInvocation?.toolName}...
                </div>
              ))}
            </motion.div>
          )
        })}

        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-black/40 p-3 rounded-lg rounded-bl-none border border-gold/20 flex space-x-1 items-center">
              <div className="w-2 h-2 rounded-full bg-gold/70 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-gold/70 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-gold/70 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-xs text-gold/70 ml-2 font-mono">Thinking...</span>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-red-900/30 border border-red-500/30 p-3 rounded-lg text-xs text-red-300 font-mono flex items-center justify-between w-full">
              <span>⚠ AION encountered an issue: {error.message}</span>
              <button
                type="button"
                onClick={() => clearError()}
                className="ml-3 px-2 py-1 bg-red-800/50 hover:bg-red-700/60 rounded text-xs text-white border border-red-400/30 transition-all"
              >
                Reset
              </button>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="z-20 mt-2 relative">
        <div className="relative flex items-center">
          <input
            id="aion-chat-input"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={isLoading ? "AION is responding..." : "Ask AION..."}
            className="w-full bg-black/80 border border-purple-500/50 rounded-full pl-5 pr-14 py-3 text-sm focus:outline-none focus:border-gold/80 focus:shadow-[0_0_10px_rgba(212,175,55,0.3)] transition-all disabled:opacity-50 text-white placeholder-white/30"
          />
          {isLoading ? (
            <button
              type="button"
              onClick={handleStop}
              title="Cancel processing"
              className="absolute right-2 bg-red-600/80 hover:bg-red-500 text-xs px-2.5 py-1.5 rounded-full flex items-center gap-1 transition-all text-white font-mono shadow-lg"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
              <span>Stop</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-30 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-lg"
            >
              <svg className="w-4 h-4 text-white ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
