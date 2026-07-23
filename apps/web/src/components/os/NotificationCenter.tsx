'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOSStore } from '@/store/os.store'

const typeConfig = {
  info:    { icon: 'ℹ', color: 'border-blue-500/50 bg-blue-500/10', dot: 'bg-blue-400' },
  success: { icon: '✓', color: 'border-green-500/50 bg-green-500/10', dot: 'bg-green-400' },
  warning: { icon: '⚠', color: 'border-yellow-500/50 bg-yellow-500/10', dot: 'bg-yellow-400' },
  error:   { icon: '✕', color: 'border-red-500/50 bg-red-500/10', dot: 'bg-red-400' },
}

function NotificationItem({ notification }: { notification: any }) {
  const { removeNotification } = useOSStore()
  const cfg = typeConfig[notification.type as keyof typeof typeConfig] || typeConfig.info

  useEffect(() => {
    const timer = setTimeout(() => removeNotification(notification.id), 4500)
    return () => clearTimeout(timer)
  }, [notification.id, removeNotification])

  return (
    <motion.div
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      className={`relative glassmorphism-strong rounded-xl border px-4 py-3 max-w-sm w-full cursor-pointer group ${cfg.color}`}
      onClick={() => removeNotification(notification.id)}
    >
      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 4.5, ease: 'linear' }}
        className="absolute bottom-0 left-0 h-0.5 w-full origin-left rounded-full bg-current opacity-30"
      />

      <div className="flex items-start gap-3">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${cfg.dot} text-black`}>
          {cfg.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white leading-tight">{notification.title}</div>
          {notification.message && (
            <div className="text-xs text-white/60 mt-0.5 leading-relaxed">{notification.message}</div>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); removeNotification(notification.id) }}
          className="text-white/30 hover:text-white/70 transition-colors text-xs opacity-0 group-hover:opacity-100 mt-0.5"
        >
          ✕
        </button>
      </div>
    </motion.div>
  )
}

export default function NotificationCenter() {
  const { notifications } = useOSStore()

  return (
    <div className="fixed top-4 right-4 z-[180] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map(n => (
          <div key={n.id} className="pointer-events-auto">
            <NotificationItem notification={n} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
