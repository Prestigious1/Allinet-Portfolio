'use client'

import React, { useEffect, useRef } from 'react'
import { useOSStore } from '@/store/os.store'
import dynamic from 'next/dynamic'
import WindowManager from './WindowManager'
import Taskbar from './Taskbar'
import Dock from './Dock'
import ContextMenu from './ContextMenu'
import DesktopIcon from './DesktopIcon'
import CommandPalette from './CommandPalette'
import NotificationCenter from './NotificationCenter'
import DevtoolsOverlay from './DevtoolsOverlay'
import AmbientEffects from './AmbientEffects'

// Lazy-load heavy 3D background — not SSR compatible
const ThreeBackground = dynamic(() => import('@/components/three/ThreeBackground'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-bg-deep" />,
})

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']

export default function Desktop() {
  const {
    isBooting,
    theme,
    systemApps,
    windows,
    activeWindowId,
    openContextMenu,
    openApp,
    focusWindow,
    openCommandPalette,
    addNotification,
  } = useOSStore()

  // ── Konami Code Easter Egg & Keyboard Shortcuts ──
  const konamiBuffer = useRef<string[]>([])
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K → Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        openCommandPalette()
        return
      }

      // Alt + Tab window cycling
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault()
        const winList = Object.entries(windows).filter(([, w]) => !w.isMinimized)
        if (winList.length === 0) return

        const currentIndex = winList.findIndex(([id]) => id === activeWindowId)
        const nextIndex = e.shiftKey
          ? (currentIndex - 1 + winList.length) % winList.length
          : (currentIndex + 1) % winList.length
        
        focusWindow(winList[nextIndex][0])
        return
      }

      // Konami code sequence
      konamiBuffer.current = [...konamiBuffer.current, e.key].slice(-KONAMI.length)
      if (konamiBuffer.current.join(',') === KONAMI.join(',')) {
        konamiBuffer.current = []
        addNotification({
          type: 'success',
          title: '🎮 KONAMI CODE ACTIVATED',
          message: 'You unlocked a secret! Matrix mode engaged.',
        })
        useOSStore.getState().setTheme('matrix')
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [openCommandPalette, addNotification, windows, activeWindowId, focusWindow])

  // During boot sequence, Desktop should be hidden
  if (isBooting) return null

  // Removed local Add/Remove shortcuts functionality since it is dynamic from CMS

  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    openContextMenu(
      { x: e.clientX, y: e.clientY },
      [
        { label: '⌘  Command Palette', action: openCommandPalette },
        { label: '🖼  Personalize', action: () => openApp('settings') },
        { label: '💻  Terminal', action: () => openApp('terminal') },
        { label: '🗂  File Explorer', action: () => openApp('explorer') },
        { label: '-', divider: true, action: () => {} },
        { label: '🔄  Refresh Desktop', action: () => window.location.reload() },
      ]
    )
  }

  return (
    <div
      className="relative w-full h-full overflow-hidden text-white font-sans bg-black select-none"
      data-theme={theme}
      onContextMenu={handleDesktopContextMenu}
    >
      {/* ── Layer 0: Ambient Effects & 3D Background ── */}
      <div className="absolute inset-0 z-0">
        <AmbientEffects />
        <ThreeBackground />
      </div>

      {/* ── Layer 1: Desktop Icons ── */}
      <div className="absolute inset-0 z-10 p-4 pointer-events-none">
        <div className="desktop-grid h-full w-full">
          {systemApps.filter(app => app.showOnDesktop).map(icon => (
            <div key={icon.id} className="pointer-events-auto h-24 w-20 flex justify-center">
              <DesktopIcon icon={icon} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Layer 2: Window Manager — above dock so apps cover it ── */}
      <div className="absolute inset-0 z-[46] pointer-events-none">
        <WindowManager />
      </div>

      {/* ── Layer 3: Dock ── */}
      <Dock />

      {/* ── Layer 4: Taskbar (below WindowManager) ── */}
      <div className="absolute bottom-0 left-0 right-0 z-40">
        <Taskbar />
      </div>

      {/* ── Layer 5: Context Menu ── */}
      <ContextMenu />

      {/* ── Layer 6: Command Palette ── */}
      <CommandPalette />

      {/* ── Layer 7: Notifications ── */}
      <NotificationCenter />

      {/* ── Layer 8: Devtools Overlay ── */}
      <DevtoolsOverlay />
    </div>
  )
}
