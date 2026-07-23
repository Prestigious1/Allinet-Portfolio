'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { services } from '@/core/providers'
import { useOSStore } from '@/store/os.store'

interface FormData {
  name: string
  email: string
  subject: string
  message: string
}

const socials = [
  { label: 'GitHub', icon: '🐙', url: 'https://github.com/Prestigious1', color: '#6e5494' },
  { label: 'LinkedIn', icon: '💼', url: 'https://linkedin.com/in/ajibade-alli-akinkunmi', color: '#0077B5' },
  { label: 'Twitter / X', icon: '𝕏', url: 'https://twitter.com/allinet', color: '#1da1f2' },
  { label: 'Email', icon: '✉️', url: 'mailto:hello@allinet.dev', color: '#d4af37' },
]

export default function ContactApp() {
  const { addNotification } = useOSStore()
  const [form, setForm] = useState<FormData>({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)

    try {
      const { success, error } = await services.email.send({
        to: 'hello@allinet.dev',
        from: form.email,
        subject: `[Contact] ${form.subject}`,
        body: `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`,
      })

      if (success) {
        setSent(true)
        addNotification({ type: 'success', title: 'Message Sent!', message: 'I\'ll get back to you soon.' })
      } else {
        addNotification({ type: 'error', title: 'Send Failed', message: 'Please try again or use direct email.' })
      }
    } catch {
      addNotification({ type: 'error', title: 'Network Error', message: 'Check your connection.' })
    }
    setSending(false)
  }

  return (
    <div className="w-full h-full text-white overflow-y-auto p-6">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold font-display gradient-brand-text">Get In Touch</h2>
          <p className="text-white/50 text-sm">Available for freelance projects, full-time roles, and collaboration.</p>
        </div>

        {/* Socials */}
        <div className="grid grid-cols-2 gap-3">
          {socials.map(s => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group glassmorphism rounded-xl p-3 flex items-center gap-3 border border-white/5 hover:border-white/20 transition-all duration-200 hover:scale-[1.02]"
            >
              <span className="text-xl">{s.icon}</span>
              <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">{s.label}</span>
              <span className="ml-auto text-white/20 group-hover:text-white/50 text-xs">↗</span>
            </a>
          ))}
        </div>

        {/* Form */}
        {!sent ? (
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="glassmorphism rounded-xl p-5 border border-white/5 space-y-4">
              <h3 className="section-header">Send a Message</h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/40 mb-1 block font-mono">Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                    className="input-os"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block font-mono">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="input-os"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/40 mb-1 block font-mono">Subject</label>
                <input
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  placeholder="What is this about?"
                  className="input-os"
                />
              </div>

              <div>
                <label className="text-xs text-white/40 mb-1 block font-mono">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Tell me about your project, opportunity, or just say hi..."
                  className="input-os resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="btn-gold w-full py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                    Transmitting...
                  </span>
                ) : 'Send Message ✉️'}
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glassmorphism rounded-xl p-8 text-center border border-green-500/30 space-y-3"
          >
            <div className="text-5xl">✅</div>
            <h3 className="text-xl font-bold text-white">Message Received!</h3>
            <p className="text-white/50 text-sm">I&apos;ll respond within 24 hours. Looking forward to connecting.</p>
            <button onClick={() => setSent(false)} className="btn-os mt-2">Send another</button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
