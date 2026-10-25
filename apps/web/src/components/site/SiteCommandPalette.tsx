'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  searchCommands,
  getAllCommands,
  CommandItem,
  CommandContext,
} from '@/core/commands/registry'

interface SiteCommandPaletteProps {
  isOpen?: boolean
  onClose?: () => void
}

export function SiteCommandPalette({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
}: SiteCommandPaletteProps = {}) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledIsOpen !== undefined
  const isOpen = isControlled ? controlledIsOpen : internalOpen

  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  const handleClose = useCallback(() => {
    if (isControlled) {
      controlledOnClose?.()
    } else {
      setInternalOpen(false)
    }
    setQuery('')
    setSelectedIndex(0)
    // Return focus to previously active element
    setTimeout(() => {
      previousActiveElement.current?.focus()
    }, 50)
  }, [isControlled, controlledOnClose])

  const context: CommandContext = {
    router,
    close: handleClose,
  }

  // Filter commands via central search registry
  const filteredCommands = searchCommands(query, context)

  // Listen for Cmd+K / Ctrl+K and open-site-command-palette event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (isOpen) {
          handleClose()
        } else {
          previousActiveElement.current = document.activeElement as HTMLElement
          if (isControlled) {
            // Controlled parent handler
          } else {
            setInternalOpen(true)
          }
        }
      }
    }

    const handleCustomOpen = () => {
      previousActiveElement.current = document.activeElement as HTMLElement
      if (isControlled) {
        // Controlled parent
      } else {
        setInternalOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('open-site-command-palette', handleCustomOpen)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('open-site-command-palette', handleCustomOpen)
    }
  }, [isOpen, isControlled, handleClose])

  // Focus input and reset on open
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0)
      setQuery('')
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }, [isOpen])

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Auto-scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return
    const activeItem = listRef.current.querySelector<HTMLElement>(`[data-index="${selectedIndex}"]`)
    if (activeItem && typeof activeItem.scrollIntoView === 'function') {
      activeItem.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  // Execute selected command
  const executeCommand = useCallback(
    (command: CommandItem) => {
      handleClose()
      command.run(context)
    },
    [context, handleClose]
  )

  // Keyboard navigation inside palette
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (filteredCommands.length > 0 ? (prev + 1) % filteredCommands.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) =>
        filteredCommands.length > 0 ? (prev - 1 + filteredCommands.length) % filteredCommands.length : 0
      )
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredCommands[selectedIndex]) {
        executeCommand(filteredCommands[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleClose()
    }
  }

  // Focus trap inside modal
  const handleKeyDownModal = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      inputRef.current?.focus()
    }
  }

  if (!isOpen) return null

  // Group commands for clear display
  const groupedCommands = filteredCommands.reduce<Record<string, CommandItem[]>>((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = []
    acc[cmd.group].push(cmd)
    return acc
  }, {})

  let itemCounter = 0

  return (
    <div
      id="site-command-palette-backdrop"
      className="fixed inset-0 z-[200] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-md transition-opacity duration-200"
      onClick={handleClose}
      onKeyDown={handleKeyDownModal}
      role="presentation"
    >
      <div
        id="site-command-palette-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Site Command Palette"
        className="w-full max-w-xl rounded-2xl bg-slate-900/95 border border-amber-500/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.15)] overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-800">
          <span className="text-amber-400 mr-3 text-lg" aria-hidden="true">
            ⌕
          </span>
          <input
            ref={inputRef}
            id="site-command-palette-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Type a command or search (e.g. 'brief', 'projects', 'demos', 'cv')..."
            className="w-full bg-transparent text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none"
            aria-autocomplete="list"
            aria-controls="site-command-palette-list"
            aria-activedescendant={filteredCommands[selectedIndex]?.id}
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
            >
              Clear
            </button>
          ) : (
            <span className="hidden sm:inline-flex items-center text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              ESC
            </span>
          )}
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          id="site-command-palette-list"
          role="listbox"
          className="flex-1 overflow-y-auto p-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-700"
        >
          {filteredCommands.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              No matching commands found for &quot;<span className="text-slate-300">{query}</span>&quot;
            </div>
          ) : (
            Object.entries(groupedCommands).map(([groupName, items]) => (
              <div key={groupName} className="space-y-1">
                <div className="px-3 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-400/80">
                  {groupName}
                </div>
                {items.map((cmd) => {
                  const currentIndex = itemCounter++
                  const isSelected = selectedIndex === currentIndex

                  return (
                    <div
                      key={cmd.id}
                      id={cmd.id}
                      data-index={currentIndex}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => executeCommand(cmd)}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-all duration-150 ${
                        isSelected
                          ? 'bg-amber-500/15 text-white border border-amber-500/40 shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <span className="text-base shrink-0" aria-hidden="true">
                          {cmd.icon}
                        </span>
                        <div className="flex flex-col truncate">
                          <span className={`font-medium truncate ${isSelected ? 'text-amber-300' : 'text-slate-200'}`}>
                            {cmd.title}
                          </span>
                          {cmd.description && (
                            <span className="text-xs text-slate-400 truncate">{cmd.description}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {cmd.shortcut && (
                          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {cmd.shortcut.toUpperCase()}
                          </kbd>
                        )}
                        <span
                          className={`text-xs transition-transform ${
                            isSelected ? 'text-amber-400 translate-x-0.5' : 'text-transparent'
                          }`}
                          aria-hidden="true"
                        >
                          ↵
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="hidden sm:inline">ALLINET Command Registry</span>
        </div>
      </div>
    </div>
  )
}
