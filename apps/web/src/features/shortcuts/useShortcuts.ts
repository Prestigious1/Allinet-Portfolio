'use client'

/**
 * useShortcuts — WCAG 2.1.4 Compliant Single-Key Shortcut System
 * TASK-P11-03 / D-05 / F-210
 *
 * Rules:
 * - SPACE is never registered as a shortcut (violates WCAG 2.1.4).
 * - `?` opens the shortcut help modal.
 * - `ESC` closes any open overlay (dispatches 'close-all-overlays' event).
 * - All single-key shortcuts are silenced when:
 *     - focus is inside <input>, <textarea>, <select>, [contenteditable]
 *     - the element or any ancestor has data-os-shell="true"
 *     - shortcuts are disabled via the returned `disableShortcuts` toggle
 * - Cmd+K / Ctrl+K for command palette is handled by SiteCommandPalette itself.
 */

import { useEffect, useCallback, useRef, useState } from 'react'

export type ShortcutHandler = (event: KeyboardEvent) => void

export interface ShortcutDefinition {
  /** Single printable key (never 'Space' or ' '). */
  key: string
  /** Human-readable label for the help modal. */
  label: string
  /** Handler invoked when the shortcut fires. */
  handler: ShortcutHandler
}

/**
 * Returns true when the keyboard event target is an interactive text control
 * or is inside an OS shell context -- per WCAG 2.1.4 requirement.
 */
export function isShortcutBlocked(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement | null
  if (!target) return false

  // Block inside editable controls
  const tag = target.tagName
  if (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  ) {
    return true
  }

  // Block inside OS shell (any ancestor with data-os-shell="true")
  let node: HTMLElement | null = target
  while (node) {
    if (node.dataset?.osShell === 'true') return true
    node = node.parentElement
  }

  return false
}

export interface UseShortcutsOptions {
  /** Additional custom shortcut definitions beyond the built-ins. */
  shortcuts?: ShortcutDefinition[]
  /** Whether shortcuts are globally enabled. Defaults to true. */
  enabled?: boolean
}

export interface UseShortcutsReturn {
  /** Whether shortcuts are currently active. */
  shortcutsEnabled: boolean
  /** Disable all single-key shortcuts (WCAG toggle). */
  disableShortcuts: () => void
  /** Re-enable shortcuts. */
  enableShortcuts: () => void
  /** Toggle shortcuts on/off. */
  toggleShortcuts: () => void
  /** True when the help modal should be visible. */
  helpVisible: boolean
  /** Close the help modal. */
  closeHelp: () => void
}

export function useShortcuts({
  shortcuts = [],
  enabled = true,
}: UseShortcutsOptions = {}): UseShortcutsReturn {
  const [shortcutsEnabled, setShortcutsEnabled] = useState(enabled)
  const [helpVisible, setHelpVisible] = useState(false)

  // Keep a ref to the current shortcut list so the event listener closure stays stable
  const shortcutsRef = useRef(shortcuts)
  useEffect(() => {
    shortcutsRef.current = shortcuts
  }, [shortcuts])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignore if shortcuts are disabled
      if (!shortcutsEnabled) return

      // Ignore modifier combos handled elsewhere (Cmd+K / Ctrl+K)
      if (event.metaKey || event.ctrlKey || event.altKey) return

      // WCAG 2.1.4 guard -- never fire in text controls or OS shell
      if (isShortcutBlocked(event)) return

      const key = event.key

      // SPACE is forbidden as a shortcut per WCAG 2.1.4
      if (key === ' ' || key === 'Space') return

      // Built-in: ESC closes all overlays
      if (key === 'Escape') {
        window.dispatchEvent(new CustomEvent('close-all-overlays'))
        return
      }

      // Built-in: ? opens help modal
      if (key === '?') {
        event.preventDefault()
        setHelpVisible(true)
        return
      }

      // Custom shortcuts
      for (const def of shortcutsRef.current) {
        if (def.key === ' ' || def.key === 'Space') continue // guard
        if (def.key === key) {
          event.preventDefault()
          def.handler(event)
          return
        }
      }
    },
    [shortcutsEnabled]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return {
    shortcutsEnabled,
    disableShortcuts: () => setShortcutsEnabled(false),
    enableShortcuts: () => setShortcutsEnabled(true),
    toggleShortcuts: () => setShortcutsEnabled((prev) => !prev),
    helpVisible,
    closeHelp: () => setHelpVisible(false),
  }
}
