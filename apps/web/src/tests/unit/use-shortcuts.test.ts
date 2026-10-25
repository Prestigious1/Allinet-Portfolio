import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useShortcuts, isShortcutBlocked } from '@/features/shortcuts/useShortcuts'

// ---------------------------------------------------------------------------
// isShortcutBlocked unit tests (pure function, no DOM needed)
// ---------------------------------------------------------------------------

function makeKeyboardEvent(target: Partial<HTMLElement>): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: '?' })
  Object.defineProperty(event, 'target', { value: target, writable: false })
  return event
}

describe('TASK-P11-03: isShortcutBlocked guard', () => {
  it('blocks inside INPUT elements', () => {
    const event = makeKeyboardEvent({ tagName: 'INPUT', isContentEditable: false, parentElement: null } as any)
    expect(isShortcutBlocked(event)).toBe(true)
  })

  it('blocks inside TEXTAREA elements', () => {
    const event = makeKeyboardEvent({ tagName: 'TEXTAREA', isContentEditable: false, parentElement: null } as any)
    expect(isShortcutBlocked(event)).toBe(true)
  })

  it('blocks inside SELECT elements', () => {
    const event = makeKeyboardEvent({ tagName: 'SELECT', isContentEditable: false, parentElement: null } as any)
    expect(isShortcutBlocked(event)).toBe(true)
  })

  it('blocks inside contenteditable elements', () => {
    const event = makeKeyboardEvent({ tagName: 'DIV', isContentEditable: true, parentElement: null } as any)
    expect(isShortcutBlocked(event)).toBe(true)
  })

  it('blocks when ancestor has data-os-shell="true"', () => {
    const shell = { tagName: 'DIV', isContentEditable: false, dataset: { osShell: 'true' }, parentElement: null }
    const child = { tagName: 'SPAN', isContentEditable: false, dataset: {}, parentElement: shell }
    const event = makeKeyboardEvent(child as any)
    expect(isShortcutBlocked(event)).toBe(true)
  })

  it('does NOT block for regular non-input elements', () => {
    const event = makeKeyboardEvent({ tagName: 'BODY', isContentEditable: false, dataset: {}, parentElement: null } as any)
    expect(isShortcutBlocked(event)).toBe(false)
  })

  it('returns false when event target is null', () => {
    const event = makeKeyboardEvent(null as any)
    expect(isShortcutBlocked(event)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// useShortcuts hook tests
// ---------------------------------------------------------------------------

describe('TASK-P11-03: useShortcuts hook', () => {
  const dispatchSpy = vi.fn()
  let origDispatch: typeof window.dispatchEvent

  beforeEach(() => {
    origDispatch = window.dispatchEvent.bind(window)
    window.dispatchEvent = dispatchSpy
    dispatchSpy.mockReset()
  })

  afterEach(() => {
    window.dispatchEvent = origDispatch
    vi.restoreAllMocks()
  })

  it('fires custom handler when a custom shortcut key is pressed', () => {
    const handler = vi.fn()
    renderHook(() =>
      useShortcuts({
        shortcuts: [{ key: 'g', label: 'Go to GitHub', handler }],
      })
    )

    act(() => {
      window.dispatchEvent = origDispatch
      const event = new KeyboardEvent('keydown', { key: 'g', bubbles: true })
      window.dispatchEvent(event)
    })

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('does NOT fire when shortcuts are disabled', () => {
    const handler = vi.fn()
    const { result } = renderHook(() =>
      useShortcuts({
        shortcuts: [{ key: 'g', label: 'Go', handler }],
        enabled: true,
      })
    )

    act(() => result.current.disableShortcuts())

    act(() => {
      window.dispatchEvent = origDispatch
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'g', bubbles: true }))
    })

    expect(handler).not.toHaveBeenCalled()
  })

  it('toggleShortcuts flips enabled state', () => {
    const { result } = renderHook(() => useShortcuts())
    expect(result.current.shortcutsEnabled).toBe(true)
    act(() => result.current.toggleShortcuts())
    expect(result.current.shortcutsEnabled).toBe(false)
    act(() => result.current.toggleShortcuts())
    expect(result.current.shortcutsEnabled).toBe(true)
  })

  it('never registers SPACE as a shortcut', () => {
    const spaceHandler = vi.fn()
    renderHook(() =>
      useShortcuts({
        shortcuts: [{ key: ' ', label: 'Space (forbidden)', handler: spaceHandler }],
      })
    )

    act(() => {
      window.dispatchEvent = origDispatch
      window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }))
    })

    // SPACE should be ignored even if someone tries to register it
    expect(spaceHandler).not.toHaveBeenCalled()
  })

  it('? key opens help modal', () => {
    const { result } = renderHook(() => useShortcuts())
    expect(result.current.helpVisible).toBe(false)

    act(() => {
      window.dispatchEvent = origDispatch
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '?', bubbles: true }))
    })

    expect(result.current.helpVisible).toBe(true)
  })

  it('closeHelp() hides the help modal', () => {
    const { result } = renderHook(() => useShortcuts())

    act(() => {
      window.dispatchEvent = origDispatch
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '?', bubbles: true }))
    })

    act(() => result.current.closeHelp())
    expect(result.current.helpVisible).toBe(false)
  })
})
