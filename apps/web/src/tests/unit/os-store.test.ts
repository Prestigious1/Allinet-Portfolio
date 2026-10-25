import { describe, it, expect, beforeEach } from 'vitest'
import { useOSStore } from '@/store/os.store'

describe('OS Store (useOSStore)', () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    useOSStore.setState({
      windows: {},
      activeWindowId: null,
      theme: 'cyber-gold',
      volume: 80,
      isBooting: true,
      notifications: [],
    })
  })

  it('initializes with default state', () => {
    const state = useOSStore.getState()
    expect(state.windows).toEqual({})
    expect(state.theme).toBe('cyber-gold')
    expect(state.isBooting).toBe(true)
  })

  it('can open an application and register window instance', () => {
    useOSStore.getState().openApp('projects')
    const state = useOSStore.getState()

    const windowIds = Object.keys(state.windows)
    expect(windowIds.length).toBe(1)
    const win = state.windows[windowIds[0]]
    expect(win.appId).toBe('projects')
    expect(win.isMinimized).toBe(false)
    expect(win.isMaximized).toBe(false)
    expect(state.activeWindowId).toBe(win.id)
  })

  it('reuses existing window if app is opened again', () => {
    useOSStore.getState().openApp('terminal')
    const firstState = useOSStore.getState()
    const firstWindowId = Object.keys(firstState.windows)[0]

    useOSStore.getState().openApp('terminal')
    const secondState = useOSStore.getState()
    const secondWindowIds = Object.keys(secondState.windows)

    expect(secondWindowIds.length).toBe(1)
    expect(secondWindowIds[0]).toBe(firstWindowId)
  })

  it('can minimize and unminimize window', () => {
    useOSStore.getState().openApp('about')
    const state = useOSStore.getState()
    const winId = Object.keys(state.windows)[0]

    useOSStore.getState().minimizeWindow(winId)
    expect(useOSStore.getState().windows[winId].isMinimized).toBe(true)

    // Opening it again unminimizes and focuses it
    useOSStore.getState().openApp('about')
    expect(useOSStore.getState().windows[winId].isMinimized).toBe(false)
    expect(useOSStore.getState().activeWindowId).toBe(winId)
  })

  it('can maximize and restore window state', () => {
    useOSStore.getState().openApp('skills')
    const state = useOSStore.getState()
    const winId = Object.keys(state.windows)[0]

    useOSStore.getState().maximizeWindow(winId)
    expect(useOSStore.getState().windows[winId].isMaximized).toBe(true)

    useOSStore.getState().maximizeWindow(winId)
    expect(useOSStore.getState().windows[winId].isMaximized).toBe(false)
  })

  it('can close a window', () => {
    useOSStore.getState().openApp('contact')
    const state = useOSStore.getState()
    const winId = Object.keys(state.windows)[0]

    useOSStore.getState().closeWindow(winId)
    expect(useOSStore.getState().windows[winId]).toBeUndefined()
  })

  it('can switch themes dynamically', () => {
    expect(useOSStore.getState().theme).toBe('cyber-gold')
    useOSStore.getState().setTheme('matrix')
    expect(useOSStore.getState().theme).toBe('matrix')
    useOSStore.getState().setTheme('midnight')
    expect(useOSStore.getState().theme).toBe('midnight')
  })

  it('can manage notifications lifecycle', () => {
    useOSStore.getState().addNotification({
      title: 'System Alert',
      message: 'All systems operational.',
      type: 'success',
    })

    const state = useOSStore.getState()
    expect(state.notifications.length).toBe(1)
    expect(state.notifications[0].title).toBe('System Alert')

    const notifId = state.notifications[0].id
    useOSStore.getState().removeNotification(notifId)
    expect(useOSStore.getState().notifications.length).toBe(0)
  })
})
