'use client'

/**
 * MissionMapModal — Visual Mission Map Module Navigator
 * TASK-P11-04 / F-215 / G-03
 *
 * Bird's-eye architectural blueprint of the entire ALLINET portfolio ecosystem.
 * Opens via `M` shortcut or footer link. Each node shows live status and is
 * click-to-navigate. Closes on ESC or backdrop click.
 */

import React, { useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

// ---------------------------------------------------------------------------
// Node definitions
// ---------------------------------------------------------------------------

type NodeStatus = 'live' | 'beta' | 'planned'

interface MissionNode {
  id: string
  label: string
  sublabel: string
  icon: string
  href: string
  status: NodeStatus
  description: string
  /** Grid position classes for the visual layout */
  positionClass: string
}

const NODES: MissionNode[] = [
  {
    id: 'public-site',
    label: 'Public Site',
    sublabel: 'allinet.dev',
    icon: '🌐',
    href: '/',
    status: 'live',
    description: 'Multi-persona portfolio: Recruiter, Client & Founder tracks',
    positionClass: 'col-start-2 row-start-1',
  },
  {
    id: 'demos',
    label: 'Engineering Demos',
    sublabel: '/demos',
    icon: '⚡',
    href: '/demos',
    status: 'live',
    description: 'Live functional architecture demonstrations & Hall of Fame',
    positionClass: 'col-start-3 row-start-2',
  },
  {
    id: 'ai-engine',
    label: 'AI Concierge Engine',
    sublabel: '/concierge',
    icon: '🤖',
    href: '/concierge',
    status: 'live',
    description: 'RAG-grounded AI assistant with verified knowledge base',
    positionClass: 'col-start-2 row-start-3',
  },
  {
    id: 'os-shell',
    label: 'ALLINET Desktop OS',
    sublabel: '/os',
    icon: '💻',
    href: '/os',
    status: 'live',
    description: 'Web operating system: terminal, apps, command palette',
    positionClass: 'col-start-1 row-start-2',
  },
  {
    id: 'brief',
    label: 'Brief & Proposal Engine',
    sublabel: '/brief',
    icon: '📝',
    href: '/brief',
    status: 'live',
    description: 'Automated project scoping & AI-powered proposal generation',
    positionClass: 'col-start-3 row-start-4',
  },
  {
    id: 'cms',
    label: 'CMS Control Plane',
    sublabel: '/admin',
    icon: '🗄️',
    href: '/admin',
    status: 'live',
    description: 'Payload CMS: content, knowledge base, leads management',
    positionClass: 'col-start-1 row-start-4',
  },
]

const STATUS_CONFIG: Record<NodeStatus, { label: string; dot: string; text: string }> = {
  live:    { label: 'LIVE',    dot: 'bg-emerald-400', text: 'text-emerald-400' },
  beta:    { label: 'BETA',    dot: 'bg-amber-400',   text: 'text-amber-400'   },
  planned: { label: 'PLANNED', dot: 'bg-slate-500',   text: 'text-slate-400'   },
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface MissionMapModalProps {
  isOpen: boolean
  onClose: () => void
}

export function MissionMapModal({ isOpen, onClose }: MissionMapModalProps) {
  const router = useRouter()
  const dialogRef = useRef<HTMLDivElement>(null)

  // Restore focus on close
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
      setTimeout(() => dialogRef.current?.focus(), 50)
    } else {
      previousFocusRef.current?.focus()
    }
  }, [isOpen])

  // ESC to close
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    },
    [onClose]
  )

  const handleNodeClick = useCallback(
    (href: string) => {
      onClose()
      router.push(href)
    },
    [onClose, router]
  )

  if (!isOpen) return null

  return (
    <div
      id="mission-map-backdrop"
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        id="mission-map-modal"
        role="dialog"
        aria-modal="true"
        aria-label="ALLINET Mission Map"
        tabIndex={-1}
        className="w-full max-w-4xl rounded-2xl bg-slate-950/98 border border-amber-500/25 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95),0_0_40px_rgba(212,175,55,0.08)] overflow-hidden flex flex-col outline-none"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white font-mono tracking-tight">
              🗺️ ALLINET Ecosystem Map
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Bird's-eye architectural blueprint · Click any node to navigate
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">ESC</kbd>
              to close
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-500 hover:text-white transition-colors text-xl leading-none"
              aria-label="Close mission map"
            >
              ×
            </button>
          </div>
        </div>

        {/* Grid Map */}
        <div className="p-6 overflow-auto">
          {/* Central hub label */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              ALLINET PORTFOLIO v2.0 · ALL SYSTEMS OPERATIONAL
            </div>
          </div>

          {/* Nodes grid */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {NODES.map((node) => {
              const status = STATUS_CONFIG[node.status]
              return (
                <button
                  key={node.id}
                  id={`mission-node-${node.id}`}
                  type="button"
                  onClick={() => handleNodeClick(node.href)}
                  className={`
                    ${node.positionClass}
                    group relative flex flex-col items-center text-center p-4 rounded-xl
                    bg-slate-900/80 border border-slate-700/60
                    hover:border-amber-500/50 hover:bg-slate-800/80
                    transition-all duration-200 hover:shadow-[0_0_20px_rgba(212,175,55,0.12)]
                    focus:outline-none focus:ring-2 focus:ring-amber-500/50
                  `}
                  aria-label={`Navigate to ${node.label} (${node.status})`}
                >
                  {/* Status indicator */}
                  <span
                    className={`absolute top-2.5 right-2.5 flex items-center gap-1 text-[9px] font-mono font-bold ${status.text}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>

                  {/* Icon */}
                  <span className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">
                    {node.icon}
                  </span>

                  {/* Label */}
                  <span className="text-sm font-semibold text-slate-200 group-hover:text-amber-300 transition-colors leading-tight">
                    {node.label}
                  </span>

                  {/* Sublabel */}
                  <span className="text-[10px] font-mono text-slate-500 mt-0.5 group-hover:text-amber-400/70 transition-colors">
                    {node.sublabel}
                  </span>

                  {/* Description (hover reveal) */}
                  <span className="text-[10px] text-slate-400 mt-2 leading-snug opacity-0 group-hover:opacity-100 transition-opacity duration-200 line-clamp-2">
                    {node.description}
                  </span>

                  {/* Arrow indicator */}
                  <span className="mt-2 text-amber-500/0 group-hover:text-amber-400 transition-colors text-xs" aria-hidden="true">
                    → Navigate
                  </span>
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-slate-500">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <span key={key} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-600">
          <span>Press <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700">M</kbd> to toggle · <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700">ESC</kbd> to close</span>
          <span>ALLINET Systems · {new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  )
}
