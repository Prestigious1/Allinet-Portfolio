'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  useRoleStore,
  ROLE_OPTIONS,
  type VisitorRole,
} from './role.store'

interface RolePickerProps {
  /** Called after the user confirms a role selection */
  onRoleSelected?: (role: VisitorRole) => void
  /** If true renders as a compact horizontal strip instead of the full panel */
  compact?: boolean
}

export function RolePicker({ onRoleSelected, compact = false }: RolePickerProps) {
  const { role: currentRole, setRole } = useRoleStore()
  const [selected, setSelected] = useState<VisitorRole | null>(currentRole)
  const [confirmed, setConfirmed] = useState(false)
  const [mounted, setMounted] = useState(false)

  /* Hydrate client-side to avoid SSR mismatch */
  useEffect(() => {
    setMounted(true)
    setSelected(useRoleStore.getState().role)
  }, [])

  const handleSelect = (id: VisitorRole) => {
    setSelected(id)
    setConfirmed(false)
  }

  const handleConfirm = () => {
    if (!selected) return
    setRole(selected)
    setConfirmed(true)
    onRoleSelected?.(selected)
  }

  const selectedOption = ROLE_OPTIONS.find((o) => o.id === selected)

  if (!mounted) {
    // Render nothing on the server to prevent hydration mismatch
    return null
  }

  if (compact) {
    return (
      <div
        id="role-picker-compact"
        className="flex items-center gap-2 flex-wrap"
        aria-label="Select your mission profile"
        role="group"
      >
        {ROLE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            id={`role-compact-${opt.id}`}
            onClick={() => { setRole(opt.id); onRoleSelected?.(opt.id) }}
            aria-pressed={currentRole === opt.id}
            className={[
              'px-3 py-1.5 rounded-full text-xs font-medium font-mono transition-all duration-150',
              'border',
              currentRole === opt.id
                ? 'border-amber-500/60 bg-amber-500/15 text-amber-300'
                : 'border-slate-700/60 bg-slate-800/40 text-slate-400 hover:border-amber-500/30 hover:text-slate-200',
            ].join(' ')}
          >
            {opt.emoji} {opt.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <section
      id="role-picker"
      aria-labelledby="role-picker-title"
      className="w-full max-w-2xl mx-auto"
    >
      <p
        id="role-picker-title"
        className="text-center text-xs font-mono tracking-widest text-amber-400/70 uppercase mb-4"
      >
        ▸ Select Mission Profile
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" role="group" aria-label="Mission profiles">
        {ROLE_OPTIONS.map((opt) => {
          const isSelected = selected === opt.id
          return (
            <button
              key={opt.id}
              id={`role-card-${opt.id}`}
              onClick={() => handleSelect(opt.id)}
              aria-pressed={isSelected}
              className={[
                'relative flex flex-col items-center gap-2 p-4 rounded-2xl border text-center',
                'transition-all duration-200 cursor-pointer group',
                isSelected
                  ? 'border-amber-400/60 bg-amber-500/10 shadow-[0_0_20px_rgba(212,175,55,0.15)]'
                  : 'border-slate-700/60 bg-slate-800/30 hover:border-amber-500/30 hover:bg-slate-700/40',
              ].join(' ')}
            >
              {/* Selection ring */}
              {isSelected && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-2xl ring-1 ring-amber-400/40 animate-pulse"
                />
              )}

              <span className="text-2xl" aria-hidden="true">{opt.emoji}</span>
              <span
                className={[
                  'text-sm font-semibold font-mono tracking-wide transition-colors duration-150',
                  isSelected ? 'text-amber-300' : 'text-slate-300 group-hover:text-white',
                ].join(' ')}
              >
                {opt.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Confirm bar */}
      {selected && !confirmed && (
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-3 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <p className="text-sm text-slate-300 flex-1 text-center sm:text-left">
            <span className="text-amber-400 font-mono">{selectedOption?.emoji} {selectedOption?.label}</span>
            {' — '}{selectedOption?.tagline}
          </p>
          <div className="flex gap-2 shrink-0">
            <button
              id="role-picker-confirm"
              onClick={handleConfirm}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 transition-all duration-150 shadow-lg shadow-amber-500/20"
            >
              Confirm →
            </button>
          </div>
        </div>
      )}

      {/* Post-confirm action */}
      {confirmed && selectedOption && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="text-sm text-emerald-400 font-mono">✓ Profile set: {selectedOption.label}</span>
          {selectedOption.id !== 'explorer' && (
            <Link
              href={selectedOption.href}
              id="role-picker-go-deep"
              className="px-4 py-2 rounded-xl text-sm font-medium border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 transition-all duration-150"
            >
              View {selectedOption.label} page →
            </Link>
          )}
        </div>
      )}
    </section>
  )
}
