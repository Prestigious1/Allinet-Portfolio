'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOSStore } from '@/store/os.store'

type DragState = {
  isDragging: boolean
  startX: number
  startY: number
  winStartX: number
  winStartY: number
}

type ResizeState = {
  isResizing: boolean
  direction: string
  startX: number
  startY: number
  startWidth: number
  startHeight: number
  startPosX: number
  startPosY: number
}

// Window size constraints
const MIN_WIDTH = 320
const MIN_HEIGHT = 200

// Work-area layout constants (must match Taskbar h-12 + Dock height)
// Taskbar = 48px. Dock sits at bottom-12 (48px) with ~60px height = 108px total clearance.
// We use TASKBAR_H for the hard floor (taskbar always visible),
// and DOCK_CLEARANCE for soft drag/resize limits so windows don't hide behind the dock.
const TASKBAR_H = 48       // px — height of Taskbar bar
const DOCK_CLEARANCE = 108 // px — taskbar + dock height + gap

export default function WindowManager() {
  const { windows, activeWindowId, moveWindow, resizeWindow, focusWindow, closeWindow, minimizeWindow, maximizeWindow } = useOSStore()
  const dragRef = useRef<Record<string, DragState>>({})
  const resizeRef = useRef<Record<string, ResizeState>>({})
  const [snapPreview, setSnapPreview] = useState<{ x: number; y: number; w: string; h: string } | null>(null)
  
  // Mobile check
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Lazy-load app components
  const [AppRegistry, setAppRegistry] = useState<Record<string, React.ComponentType<any>>>({})
  const [appsLoaded, setAppsLoaded] = useState(false)

  useEffect(() => {
    const loadApps = async () => {
      const [
        { default: AboutApp },
        { default: TerminalApp },
        { default: ProjectsApp },
        { default: AIApp },
        { default: FileExplorerApp },
        { default: SettingsApp },
        { default: ContactApp },
        { default: ResumeApp },
        { default: SkillsApp },
        { default: GitHubApp },
        { default: BlogApp },
        { default: AchievementsApp },
        { default: TimelineApp },
        { default: EducationApp },
        { default: CertificatesApp },
        { default: TestimonialsApp },
      ] = await Promise.all([
        import('@/apps/AboutApp'),
        import('@/apps/TerminalApp'),
        import('@/apps/ProjectsApp'),
        import('@/apps/AIApp'),
        import('@/apps/FileExplorerApp'),
        import('@/apps/SettingsApp'),
        import('@/apps/ContactApp'),
        import('@/apps/ResumeApp'),
        import('@/apps/SkillsApp'),
        import('@/apps/GitHubApp'),
        import('@/apps/BlogApp'),
        import('@/apps/AchievementsApp'),
        import('@/apps/TimelineApp'),
        import('@/apps/EducationApp'),
        import('@/apps/CertificatesApp'),
        import('@/apps/TestimonialsApp'),
      ])
      setAppRegistry({
        about: AboutApp,
        terminal: TerminalApp,
        projects: ProjectsApp,
        ai: AIApp,
        explorer: FileExplorerApp,
        settings: SettingsApp,
        contact: ContactApp,
        resume: ResumeApp,
        skills: SkillsApp,
        github: GitHubApp,
        blog: BlogApp,
        achievements: AchievementsApp,
        timeline: TimelineApp,
        education: EducationApp,
        certificates: CertificatesApp,
        testimonials: TestimonialsApp,
      })
      setAppsLoaded(true)
    }
    loadApps()
  }, [])

  // ── Drag Logic ──
  const handleTitleBarMouseDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent, id: string, currentPos: { x: number; y: number }) => {
      if (isMobile) return // No drag on mobile
      
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

      focusWindow(id)
      
      // If maximized, restore on drag
      const win = useOSStore.getState().windows[id]
      if (win.isMaximized) {
        maximizeWindow(id)
        // Adjust start coordinates to feel natural when detaching from maximize
        currentPos = { x: clientX - win.size.width / 2, y: 0 }
      }

      dragRef.current[id] = {
        isDragging: true,
        startX: clientX,
        startY: clientY,
        winStartX: currentPos.x,
        winStartY: currentPos.y,
      }

      let animationFrameId: number

      const onMove = (ev: MouseEvent | TouchEvent) => {
        const drag = dragRef.current[id]
        if (!drag?.isDragging) return
        
        const cx = 'touches' in ev ? ev.touches[0].clientX : ev.clientX
        const cy = 'touches' in ev ? ev.touches[0].clientY : ev.clientY

        const dx = cx - drag.startX
        const dy = cy - drag.startY
        
        // Clamp dragging: keep title bar reachable, prevent going behind taskbar/dock
        const maxW = window.innerWidth - 40
        const maxH = window.innerHeight - DOCK_CLEARANCE
        const newX = Math.max(-win.size.width + 40, Math.min(drag.winStartX + dx, maxW))
        const newY = Math.max(0, Math.min(drag.winStartY + dy, maxH))

        // Snap zone preview
        if (cy <= 5) {
          setSnapPreview({ x: 0, y: 0, w: '100%', h: `calc(100dvh - ${TASKBAR_H}px)` }) // Maximize
        } else if (cx <= 5) {
          setSnapPreview({ x: 0, y: 0, w: '50%', h: `calc(100dvh - ${TASKBAR_H}px)` }) // Snap Left
        } else if (cx >= window.innerWidth - 5) {
          setSnapPreview({ x: window.innerWidth / 2, y: 0, w: '50%', h: `calc(100dvh - ${TASKBAR_H}px)` }) // Snap Right
        } else {
          setSnapPreview(null)
        }

        cancelAnimationFrame(animationFrameId)
        animationFrameId = requestAnimationFrame(() => {
          moveWindow(id, { x: newX, y: newY })
        })
      }

      const onUp = (ev: MouseEvent | TouchEvent) => {
        if (dragRef.current[id]) dragRef.current[id].isDragging = false
        
        const cx = 'changedTouches' in ev ? ev.changedTouches[0].clientX : ev.clientX
        const cy = 'changedTouches' in ev ? ev.changedTouches[0].clientY : ev.clientY

        // Apply Snap on mouse-up
        if (cy <= 5) {
          maximizeWindow(id)
        } else if (cx <= 5) {
          moveWindow(id, { x: 0, y: 0 })
          resizeWindow(id, { width: window.innerWidth / 2, height: window.innerHeight - TASKBAR_H })
        } else if (cx >= window.innerWidth - 5) {
          moveWindow(id, { x: window.innerWidth / 2, y: 0 })
          resizeWindow(id, { width: window.innerWidth / 2, height: window.innerHeight - TASKBAR_H })
        }
        
        setSnapPreview(null)

        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
        window.removeEventListener('touchmove', onMove)
        window.removeEventListener('touchend', onUp)
      }

      window.addEventListener('mousemove', onMove, { passive: true })
      window.addEventListener('mouseup', onUp)
      window.addEventListener('touchmove', onMove, { passive: true })
      window.addEventListener('touchend', onUp)
    },
    [focusWindow, moveWindow, maximizeWindow, resizeWindow, isMobile]
  )

  // ── Resize Logic ──
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, id: string, dir: string) => {
      e.stopPropagation()
      e.preventDefault()
      if (isMobile) return

      focusWindow(id)
      const win = useOSStore.getState().windows[id]
      if (win.isMaximized) return

      resizeRef.current[id] = {
        isResizing: true,
        direction: dir,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: win.size.width,
        startHeight: win.size.height,
        startPosX: win.position.x,
        startPosY: win.position.y,
      }

      let animationFrameId: number

      const onMouseMove = (ev: MouseEvent) => {
        const resize = resizeRef.current[id]
        if (!resize?.isResizing) return
        
        const dx = ev.clientX - resize.startX
        const dy = ev.clientY - resize.startY

        let newW = resize.startWidth
        let newH = resize.startHeight
        let newX = resize.startPosX
        let newY = resize.startPosY

        if (resize.direction.includes('e')) newW = Math.max(MIN_WIDTH, resize.startWidth + dx)
        if (resize.direction.includes('s')) {
          // Cap height so bottom edge never goes behind taskbar/dock
          const maxAllowedH = window.innerHeight - DOCK_CLEARANCE - resize.startPosY
          newH = Math.min(maxAllowedH, Math.max(MIN_HEIGHT, resize.startHeight + dy))
        }
        if (resize.direction.includes('w')) {
          newW = Math.max(MIN_WIDTH, resize.startWidth - dx)
          if (newW > MIN_WIDTH) newX = resize.startPosX + dx
        }
        if (resize.direction.includes('n')) {
          newH = Math.max(MIN_HEIGHT, resize.startHeight - dy)
          if (newH > MIN_HEIGHT) newY = Math.max(0, resize.startPosY + dy)
        }

        cancelAnimationFrame(animationFrameId)
        animationFrameId = requestAnimationFrame(() => {
          resizeWindow(id, { width: newW, height: newH })
          if (newX !== resize.startPosX || newY !== resize.startPosY) {
            moveWindow(id, { x: newX, y: newY })
          }
        })
      }

      const onMouseUp = () => {
        if (resizeRef.current[id]) resizeRef.current[id].isResizing = false
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
      }

      window.addEventListener('mousemove', onMouseMove, { passive: true })
      window.addEventListener('mouseup', onMouseUp)
    },
    [focusWindow, resizeWindow, moveWindow, isMobile]
  )

  const windowEntries = Object.entries(windows)

  return (
    <>
      {/* Snap Preview Highlight */}
      <AnimatePresence>
        {snapPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute snap-zone-preview"
            style={{
              left: snapPreview.x,
              top: snapPreview.y,
              width: snapPreview.w,
              height: snapPreview.h,
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {windowEntries.map(([id, win]) => {
          if (win.isMinimized) return null

          const AppContent = AppRegistry[win.appId]
          const isActive = activeWindowId === id
          const isMaxed = win.isMaximized || isMobile

          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className={`absolute pointer-events-auto rounded-xl flex flex-col select-none transition-shadow duration-300 ${
                isActive ? 'window-chrome window-chrome-active z-50' : 'window-chrome'
              }`}
              role="dialog"
              aria-label={win.title}
              aria-modal="false"
              style={{
                width: isMaxed ? '100vw' : win.size.width,
                height: isMaxed ? `calc(100dvh - ${TASKBAR_H}px)` : win.size.height,
                top: isMaxed ? 0 : win.position.y,
                left: isMaxed ? 0 : win.position.x,
                zIndex: win.zIndex,
                transition: isMaxed ? 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : undefined,
              }}
              onPointerDown={() => focusWindow(id)}
            >
              {/* ── Resize Handles (Only if not maximized/mobile) ── */}
              {!isMaxed && (
                <>
                  <div className="absolute top-0 left-0 right-0 h-1.5 cursor-n-resize -translate-y-1/2 z-10" onMouseDown={(e) => handleResizeMouseDown(e, id, 'n')} />
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 cursor-s-resize translate-y-1/2 z-10" onMouseDown={(e) => handleResizeMouseDown(e, id, 's')} />
                  <div className="absolute top-0 bottom-0 left-0 w-1.5 cursor-w-resize -translate-x-1/2 z-10" onMouseDown={(e) => handleResizeMouseDown(e, id, 'w')} />
                  <div className="absolute top-0 bottom-0 right-0 w-1.5 cursor-e-resize translate-x-1/2 z-10" onMouseDown={(e) => handleResizeMouseDown(e, id, 'e')} />
                  
                  <div className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize -translate-x-1/2 -translate-y-1/2 z-20" onMouseDown={(e) => handleResizeMouseDown(e, id, 'nw')} />
                  <div className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize translate-x-1/2 -translate-y-1/2 z-20" onMouseDown={(e) => handleResizeMouseDown(e, id, 'ne')} />
                  <div className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize -translate-x-1/2 translate-y-1/2 z-20" onMouseDown={(e) => handleResizeMouseDown(e, id, 'sw')} />
                  <div className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize translate-x-1/2 translate-y-1/2 z-20" onMouseDown={(e) => handleResizeMouseDown(e, id, 'se')} />
                </>
              )}

              {/* ── Window Title Bar ── */}
              <div
                className={`h-9 flex items-center px-3 border-b border-white/5 bg-black/50 shrink-0 ${isMaxed ? 'cursor-default' : 'cursor-move'} rounded-t-xl overflow-hidden`}
                onMouseDown={(e) => handleTitleBarMouseDown(e, id, win.position)}
                onTouchStart={(e) => handleTitleBarMouseDown(e, id, win.position)}
                onDoubleClick={() => !isMobile && maximizeWindow(id)}
              >
                {/* Traffic Light Buttons */}
                <div className="flex items-center space-x-2 mr-4 relative z-10">
                  <button
                    className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors flex items-center justify-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                    onClick={(e) => { e.stopPropagation(); closeWindow(id) }}
                    aria-label={`Close ${win.title}`}
                  >
                    <span className="text-red-900 text-[8px] opacity-0 group-hover:opacity-100">✕</span>
                  </button>
                  <button
                    className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors flex items-center justify-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300"
                    onClick={(e) => { e.stopPropagation(); minimizeWindow(id) }}
                    aria-label={`Minimize ${win.title}`}
                  >
                    <span className="text-yellow-900 text-[8px] opacity-0 group-hover:opacity-100">−</span>
                  </button>
                  {!isMobile && (
                    <button
                      className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors flex items-center justify-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
                      onClick={(e) => { e.stopPropagation(); maximizeWindow(id) }}
                      aria-label={win.isMaximized ? `Restore ${win.title}` : `Maximize ${win.title}`}
                    >
                      <span className="text-green-900 text-[8px] opacity-0 group-hover:opacity-100">+</span>
                    </button>
                  )}
                </div>

                {/* Title */}
                <div
                  className={`text-xs font-medium mx-auto tracking-wide font-sans absolute inset-x-0 text-center pointer-events-none ${
                    isActive ? 'text-white/90' : 'text-white/40'
                  }`}
                >
                  {win.title}
                </div>

                {/* Active indicator dot */}
                <div className="flex-1" />
                <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-gold animate-pulse shadow-[0_0_8px_rgba(212,175,55,0.8)]' : 'bg-transparent'}`} />
              </div>

              {/* ── Window Content ── */}
              <div className="flex-1 overflow-hidden bg-black/10 select-auto rounded-b-xl relative">
                {AppContent ? (
                  <AppContent {...win.props} />
                ) : appsLoaded ? (
                  <div className="absolute inset-0 p-8 flex flex-col items-center justify-center gap-4 bg-black/40 backdrop-blur-sm text-center">
                    <div className="text-white/80 text-lg font-semibold">Unable to load &quot;{win.title}&quot;</div>
                    <div className="text-white/40 text-sm max-w-xs">
                      This app is not registered or failed to initialize. Try another desktop shortcut or open a supported app.
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 p-8 flex flex-col items-center justify-center gap-6 bg-black/40 backdrop-blur-sm">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 rounded-full border-t-2 border-r-2 border-gold/50"
                    />
                    <div className="space-y-3 w-48 max-w-full">
                      <div className="h-2 bg-white/10 rounded overflow-hidden relative">
                        <motion.div
                          animate={{ x: ["-100%", "200%"] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-1/2"
                        />
                      </div>
                      <div className="h-2 bg-white/10 rounded w-3/4 overflow-hidden relative">
                        <motion.div
                          animate={{ x: ["-100%", "200%"] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-1/2"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </>
  )
}
