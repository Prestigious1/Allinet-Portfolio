import { create } from 'zustand'
import { AppId, Notification, Position, Size, Theme, WindowInstance } from '../types/os.types'
import { DesktopAppData } from '../core/providers/portfolio/PortfolioProvider'
const APP_TITLES: Record<string, string> = {
  about: 'About Me',
  projects: 'Projects',
  resume: 'Resume & CV',
  skills: 'Skills',
  terminal: 'Terminal',
  ai: 'AION — AI Assistant',
  contact: 'Contact',
  github: 'GitHub Activity',
  blog: 'Blog',
  gallery: 'Gallery',
  settings: 'Settings',
  explorer: 'File Explorer',
  achievements: 'Achievements',
  education: 'Education',
  certificates: 'Certificates',
  testimonials: 'Testimonials',
  timeline: 'Career Timeline',
  music: 'Music Player',
}

export interface ContextMenuItem {
  label: string
  action: () => void
  disabled?: boolean
  divider?: boolean
}

interface ContextMenuState {
  isOpen: boolean
  position: Position
  items: ContextMenuItem[]
}

interface OSState {
  windows: Record<string, WindowInstance>
  activeWindowId: string | null
  systemApps: DesktopAppData[]
  theme: Theme
  volume: number
  isBooting: boolean
  notifications: Notification[]
  contextMenu: ContextMenuState
  commandPaletteOpen: boolean
  devtoolsOpen: boolean
  
  // Actions
  setSystemApps: (apps: DesktopAppData[]) => void
  openApp: (appId: AppId, props?: Record<string, any>) => void
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  moveWindow: (id: string, position: Position) => void
  resizeWindow: (id: string, size: Size) => void
  setTheme: (theme: Theme) => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  finishBoot: () => void
  openContextMenu: (position: Position, items: ContextMenuItem[]) => void
  closeContextMenu: () => void
  openCommandPalette: () => void
  closeCommandPalette: () => void
  openDevtools: () => void
  closeDevtools: () => void
}

let nextZIndex = 100

export const useOSStore = create<OSState>((set, get) => ({
  windows: {},
  activeWindowId: null,
  systemApps: [],
  theme: 'cyber-gold',
  volume: 80,
  isBooting: true,
  notifications: [],
  contextMenu: { isOpen: false, position: { x: 0, y: 0 }, items: [] },
  commandPaletteOpen: false,
  devtoolsOpen: false,

  setSystemApps: (apps) => set({ systemApps: apps }),

  openApp: (appId, props) => {
    // If there's already a non-minimized window of this app, focus it
    const existingEntry = Object.entries(get().windows).find(([, w]) => w.appId === appId && !w.isMinimized)
    if (existingEntry) {
      get().focusWindow(existingEntry[0])
      return
    }
    // Restore if minimized
    const minimizedEntry = Object.entries(get().windows).find(([, w]) => w.appId === appId && w.isMinimized)
    if (minimizedEntry) {
      get().focusWindow(minimizedEntry[0])
      return
    }

    const id = `win-${appId}-${Date.now()}`
    const openCount = Object.keys(get().windows).length
    
    // Sizes per app
    const SIZES: Partial<Record<AppId, Size>> = {
      terminal: { width: 700, height: 460 },
      about:    { width: 620, height: 720 },
      resume:   { width: 750, height: 680 },
      skills:   { width: 760, height: 640 },
      contact:  { width: 560, height: 580 },
      github:   { width: 880, height: 640 },
      ai:       { width: 540, height: 680 },
      settings: { width: 700, height: 560 },
      projects: { width: 900, height: 640 },
      explorer: { width: 820, height: 560 },
    }
    
    // Check session storage for saved size/pos
    let savedSize: Size | null = null
    let savedPos: Position | null = null
    try {
      const saved = sessionStorage.getItem(`win-${appId}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.size) savedSize = parsed.size
        if (parsed.position) savedPos = parsed.position
      }
    } catch {}

    const isMobile = window.innerWidth <= 768
    const rawSize = savedSize ?? SIZES[appId] ?? { width: 800, height: 600 }
    
    // Clamp size so it doesn't open larger than the available work-area (minus taskbar/dock)
    const DOCK_CLEARANCE = 108 // Taskbar (48) + Dock (~60)
    const size = {
      width: Math.min(rawSize.width, window.innerWidth - 40),
      height: Math.min(rawSize.height, window.innerHeight - DOCK_CLEARANCE)
    }

    // Center with slight cascade offset, or use saved position
    const cascade = openCount * 24
    let centerX = savedPos?.x ?? Math.max(20, (window.innerWidth / 2) - (size.width / 2) + cascade)
    let centerY = savedPos?.y ?? Math.max(20, (window.innerHeight / 2) - (size.height / 2) + cascade)
    
    // Clamp to viewport bounds to ensure title bar is always grabbable
    centerX = Math.max(0, Math.min(centerX, window.innerWidth - 60))
    centerY = Math.max(0, Math.min(centerY, window.innerHeight - DOCK_CLEARANCE - 40))
    
    const newWindow: WindowInstance = {
      id,
      appId,
      title: APP_TITLES[appId] ?? appId,
      isMinimized: false,
      isMaximized: isMobile, // Auto maximize on mobile
      position: { x: centerX, y: centerY },
      size,
      zIndex: nextZIndex++,
      props
    }

    set((state) => ({
      windows: { ...state.windows, [id]: newWindow },
      activeWindowId: id
    }))
  },

  closeWindow: (id) => {
    set((state) => {
      const newWindows = { ...state.windows }
      delete newWindows[id]
      
      // Focus another window if available
      const remainingIds = Object.keys(newWindows)
      const nextActiveId = remainingIds.length > 0 ? remainingIds[remainingIds.length - 1] : null
      
      return { windows: newWindows, activeWindowId: nextActiveId }
    })
  },

  focusWindow: (id) => {
    set((state) => {
      const window = state.windows[id]
      if (!window) return state
      if (state.activeWindowId === id && !window.isMinimized) return state

      return {
        windows: {
          ...state.windows,
          [id]: { ...window, zIndex: nextZIndex++, isMinimized: false }
        },
        activeWindowId: id
      }
    })
  },

  minimizeWindow: (id) => {
    set((state) => {
      const window = state.windows[id]
      if (!window) return state
      
      return {
        windows: {
          ...state.windows,
          [id]: { ...window, isMinimized: true }
        },
        activeWindowId: state.activeWindowId === id ? null : state.activeWindowId
      }
    })
  },

  maximizeWindow: (id) => {
    set((state) => {
      const window = state.windows[id]
      if (!window) return state
      
      return {
        windows: {
          ...state.windows,
          [id]: { ...window, isMaximized: !window.isMaximized }
        }
      }
    })
  },

  moveWindow: (id, position) => {
    set((state) => {
      const window = state.windows[id]
      if (!window) return state
      
      try {
        sessionStorage.setItem(`win-${window.appId}`, JSON.stringify({ size: window.size, position }))
      } catch {}

      return { windows: { ...state.windows, [id]: { ...window, position } } }
    })
  },

  resizeWindow: (id, size) => {
    set((state) => {
      const window = state.windows[id]
      if (!window) return state
      
      try {
        sessionStorage.setItem(`win-${window.appId}`, JSON.stringify({ size, position: window.position }))
      } catch {}

      return { windows: { ...state.windows, [id]: { ...window, size } } }
    })
  },

  setTheme: (theme) => set({ theme }),

  addNotification: (notification) => {
    const id = `notif-${Date.now()}`
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id, timestamp: Date.now() }]
    }))
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }))
  },

  finishBoot: () => set({ isBooting: false }),

  openContextMenu: (position, items) => {
    set({ contextMenu: { isOpen: true, position, items } })
  },

  closeContextMenu: () => {
    set((state) => ({ contextMenu: { ...state.contextMenu, isOpen: false } }))
  },

  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  openDevtools: () => set({ devtoolsOpen: true }),
  closeDevtools: () => set({ devtoolsOpen: false }),
}))
