'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOSStore } from '@/store/os.store'
import { Theme } from '@/types/os.types'

const THEMES: { id: Theme; label: string; icon: string; description: string; preview: string[] }[] = [
  {
    id: 'cyber-gold',
    label: 'Cyber Gold',
    icon: '🌟',
    description: 'The signature ALLINET OS aesthetic — deep purple and gold.',
    preview: ['#0d0618', '#7c3aed', '#d4af37'],
  },
  {
    id: 'midnight',
    label: 'Midnight',
    icon: '🌑',
    description: 'Indigo and deep blue for a focused, professional look.',
    preview: ['#050510', '#4f46e5', '#818cf8'],
  },
  {
    id: 'matrix',
    label: 'Matrix',
    icon: '💚',
    description: 'Green terminal aesthetic inspired by The Matrix.',
    preview: ['#000800', '#008f11', '#00ff41'],
  },
  {
    id: 'ice-station',
    label: 'Ice Station',
    icon: '🧊',
    description: 'Cool cyan and arctic blue — cold, crisp, futuristic.',
    preview: ['#020b18', '#0369a1', '#00d4ff'],
  },
  {
    id: 'void',
    label: 'Void',
    icon: '⬛',
    description: 'Minimal monochrome — pure black with white accents.',
    preview: ['#000000', '#333333', '#ffffff'],
  },
]

const SECTIONS = ['Appearance', 'Display', 'AION Memory', 'About OS'] as const
type Section = typeof SECTIONS[number]

interface AIONMemory {
  id: string
  title: string
  content: string
  category: string
  importance: string
}

function AIMemoryManager() {
  const { addNotification } = useOSStore()
  const [memories, setMemories] = useState<AIONMemory[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', content: '', category: 'general', importance: 'medium' })
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchMemories = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/ai/memory')
      if (res.ok) {
        const data = await res.json()
        setMemories(data.memories || [])
      }
    } catch (err) {
      console.error('[AIMemoryManager] fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMemories() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/ai/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setForm({ title: '', content: '', category: 'general', importance: 'medium' })
        addNotification({ type: 'success', title: 'Memory Saved', message: 'AION now knows this permanently.' })
        fetchMemories()
      }
    } catch {
      addNotification({ type: 'error', title: 'Error', message: 'Failed to save memory.' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/ai/memory/${id}`, { method: 'DELETE' })
      if (res.ok) {
        addNotification({ type: 'info', title: 'Memory Deleted', message: 'AION has forgotten this.' })
        setMemories(prev => prev.filter(m => m.id !== id))
      }
    } catch {
      addNotification({ type: 'error', title: 'Error', message: 'Failed to delete memory.' })
    } finally {
      setDeletingId(null)
    }
  }

  const categoryColors: Record<string, string> = {
    bio: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
    project: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
    experience: 'text-green-400 border-green-400/30 bg-green-400/10',
    trading: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
    general: 'text-white/50 border-white/10 bg-white/5',
    other: 'text-white/50 border-white/10 bg-white/5',
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">AION Memory Manager</h2>
        <p className="text-white/40 text-sm mt-0.5">
          Teach AION permanent facts about you. Changes take effect immediately — no redeployment needed.
        </p>
      </div>

      {/* Create Form */}
      <form onSubmit={handleCreate} className="glassmorphism rounded-xl p-5 border border-gold/20 space-y-3">
        <p className="text-xs font-mono text-gold uppercase tracking-widest">Add New Memory</p>
        <input
          type="text"
          placeholder="Title (e.g. New AWS Certificate)"
          value={form.title}
          onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold/50 text-white placeholder-white/30"
        />
        <textarea
          placeholder="Content — write exactly what AION should know..."
          value={form.content}
          onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
          rows={3}
          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold/50 text-white placeholder-white/30 resize-none"
        />
        <div className="flex gap-3">
          <select
            value={form.category}
            onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold/50 text-white"
          >
            {['general', 'bio', 'project', 'experience', 'trading', 'other'].map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <select
            value={form.importance}
            onChange={e => setForm(p => ({ ...p, importance: e.target.value }))}
            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold/50 text-white"
          >
            {['high', 'medium', 'low'].map(i => (
              <option key={i} value={i}>{i.charAt(0).toUpperCase() + i.slice(1)} Importance</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={saving || !form.title.trim() || !form.content.trim()}
            className="px-4 py-2 bg-gold/20 border border-gold/40 hover:bg-gold/30 text-gold text-sm rounded-lg transition-all disabled:opacity-40"
          >
            {saving ? '...' : '+ Save'}
          </button>
        </div>
      </form>

      {/* Memories List */}
      <div className="space-y-2">
        <p className="text-xs font-mono text-white/30 uppercase tracking-widest">
          Stored Memories ({memories.length})
        </p>
        {loading ? (
          <div className="text-white/30 text-sm py-4 text-center animate-pulse">Loading memories...</div>
        ) : memories.length === 0 ? (
          <div className="text-white/20 text-sm py-4 text-center">
            No memories stored yet. Add one above to teach AION about you.
          </div>
        ) : (
          <AnimatePresence>
            {memories.map(mem => (
              <motion.div
                key={mem.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glassmorphism rounded-xl p-4 border border-white/5 flex gap-3 items-start"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white truncate">{mem.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono uppercase tracking-wider ${categoryColors[mem.category] || categoryColors.general}`}>
                      {mem.category}
                    </span>
                    <span className={`text-[10px] font-mono ${mem.importance === 'high' ? 'text-red-400' : mem.importance === 'medium' ? 'text-yellow-400' : 'text-white/30'}`}>
                      {mem.importance}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 mt-1 line-clamp-2">{mem.content}</p>
                </div>
                <button
                  onClick={() => handleDelete(mem.id)}
                  disabled={deletingId === mem.id}
                  className="shrink-0 text-white/20 hover:text-red-400 transition-colors text-sm px-2 py-1 rounded hover:bg-red-400/10"
                  title="Delete memory"
                >
                  {deletingId === mem.id ? '...' : '✕'}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

export default function SettingsApp() {
  const { theme, setTheme, addNotification } = useOSStore()
  const [section, setSection] = useState<Section>('Appearance')

  const handleThemeChange = (t: Theme) => {
    setTheme(t)
    addNotification({ type: 'success', title: 'Theme Applied', message: `Switched to ${THEMES.find(th => th.id === t)?.label} theme.` })
  }

  return (
    <div className="w-full h-full flex text-white">
      {/* Sidebar */}
      <div className="w-44 border-r border-white/5 p-3 space-y-1 shrink-0 bg-black/20">
        <p className="section-header px-2">Settings</p>
        {SECTIONS.map(s => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
              section === s
                ? 'bg-purple/20 text-white border border-purple/30'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            {s === 'AION Memory' ? '🧠 AION' : s}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {section === 'Appearance' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold">Appearance</h2>
              <p className="text-white/40 text-sm mt-0.5">Customize the look and feel of ALLINET OS.</p>
            </div>

            <div>
              <h3 className="section-header">Theme</h3>
              <div className="grid grid-cols-1 gap-3">
                {THEMES.map(t => (
                  <motion.button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${
                      theme === t.id
                        ? 'border-gold/60 bg-gold/10 shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                        : 'border-white/5 bg-white/3 hover:border-white/15 hover:bg-white/5'
                    }`}
                  >
                    {/* Color Preview */}
                    <div className="flex gap-1 shrink-0">
                      {t.preview.map((c, ci) => (
                        <div
                          key={ci}
                          className="w-5 h-8 rounded-sm"
                          style={{ background: c }}
                        />
                      ))}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{t.icon}</span>
                        <span className="font-semibold text-sm">{t.label}</span>
                        {theme === t.id && (
                          <span className="text-[9px] font-mono uppercase tracking-wider text-gold border border-gold/30 bg-gold/10 px-1.5 py-0.5 rounded">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/40 mt-0.5">{t.description}</p>
                    </div>

                    {/* Check */}
                    {theme === t.id && (
                      <div className="w-5 h-5 rounded-full bg-gold flex items-center justify-center text-black text-xs font-bold shrink-0">
                        ✓
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        )}

        {section === 'Display' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold">Display</h2>
              <p className="text-white/40 text-sm mt-0.5">Monitor and resolution settings.</p>
            </div>
            <div className="glassmorphism rounded-xl p-6 border border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/70">Resolution</span>
                <span className="text-sm font-mono text-gold">
                  {typeof window !== 'undefined' ? `${window.innerWidth} × ${window.innerHeight}` : '1920 × 1080'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/70">Color Depth</span>
                <span className="text-sm font-mono text-gold">32-bit HDR</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/70">Refresh Rate</span>
                <span className="text-sm font-mono text-gold">60Hz</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/70">Renderer</span>
                <span className="text-sm font-mono text-gold">WebGL2 / Three.js</span>
              </div>
            </div>
          </div>
        )}

        {section === 'AION Memory' && <AIMemoryManager />}

        {section === 'About OS' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold">About ALLINET OS</h2>
              <p className="text-white/40 text-sm mt-0.5">System information and credits.</p>
            </div>

            <div className="glassmorphism rounded-xl p-6 border border-white/5 space-y-4 text-sm">
              {[
                { label: 'OS Name', value: 'ALLINET OS' },
                { label: 'Version', value: '2.0.26' },
                { label: 'Build', value: 'Next.js 16 + React 19' },
                { label: 'UI Framework', value: 'React + Framer Motion + GSAP' },
                { label: '3D Engine', value: 'Three.js r185 / React Three Fiber' },
                { label: 'State Manager', value: 'Zustand v5' },
                { label: 'AI Engine', value: 'AION via OpenRouter + Vercel AI SDK' },
                { label: 'Author', value: 'Ajibade Alli-Akinkunmi' },
                { label: 'License', value: 'MIT' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <span className="text-white/50">{label}</span>
                  <span className="font-mono text-gold">{value}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-white/25 text-center font-mono">
              Built with ❤️ for the web, by Ajibade Alli-Akinkunmi
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
