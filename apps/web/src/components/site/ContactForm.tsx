'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Schema (mirrors server-side validation — no Turnstile in client schema)
// ---------------------------------------------------------------------------

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  whatsapp: z.string().max(20).optional(),
  company: z.string().max(200).optional(),
  need: z.string().min(20, 'Please describe your need (min 20 chars)').max(2000),
  budgetRange: z.string().optional(),
  consentGiven: z.boolean().refine((v) => v === true, {
    message: 'You must agree to data processing to continue',
  }),
  honeypot: z.string().max(0).optional(),
})

type ContactFormData = z.infer<typeof contactFormSchema>

const BUDGET_OPTIONS = [
  { value: '', label: 'Select budget range (optional)' },
  { value: '<500k-ngn', label: 'Under ₦500k (under $600)' },
  { value: '500k-1.5m-ngn', label: '₦500k – ₦1.5m ($600 – $1.8k)' },
  { value: '1.5m-3m-ngn', label: '₦1.5m – ₦3m ($1.8k – $3.6k)' },
  { value: '>3m-ngn', label: 'Over ₦3m (over $3.6k)' },
  { value: 'discuss', label: 'Prefer to discuss' },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [serverMessage, setServerMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { consentGiven: false },
  })

  async function onSubmit(data: ContactFormData) {
    setStatus('submitting')
    setServerMessage(null)

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          // In dev/test Turnstile bypasses; in prod the widget injects a real token
          // The widget places the token into a hidden input with name cf-turnstile-response
          turnstileToken: (document.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]')?.value) || 'dev-bypass',
          sourcePage: '/contact',
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        setStatus('error')
        setServerMessage(json?.error?.message || 'Something went wrong. Please try again.')
        return
      }

      setStatus('success')
      setServerMessage(json.data?.message || 'Thank you! We will be in touch within 24 hours.')
      reset()
    } catch {
      setStatus('error')
      setServerMessage('A network error occurred. Please check your connection and try again.')
    }
  }

  return (
    <form
      id="contact-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Contact form"
    >
      {/* Honeypot — hidden from real users */}
      <input
        type="text"
        {...register('honeypot')}
        aria-hidden="true"
        tabIndex={-1}
        className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden"
      />

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        {/* Name */}
        <div>
          <label htmlFor="contact-name" className="block text-sm font-medium text-slate-300 mb-1.5">
            Full Name <span className="text-red-400" aria-hidden="true">*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            autoComplete="name"
            {...register('name')}
            className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition-all duration-200 text-sm"
            placeholder="Amaka Okonkwo"
            aria-describedby={errors.name ? 'contact-name-error' : undefined}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p id="contact-name-error" role="alert" className="text-xs text-red-400 mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium text-slate-300 mb-1.5">
            Email Address <span className="text-red-400" aria-hidden="true">*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition-all duration-200 text-sm"
            placeholder="amaka@company.com"
            aria-describedby={errors.email ? 'contact-email-error' : undefined}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p id="contact-email-error" role="alert" className="text-xs text-red-400 mt-1">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        {/* WhatsApp */}
        <div>
          <label htmlFor="contact-whatsapp" className="block text-sm font-medium text-slate-300 mb-1.5">
            WhatsApp <span className="text-slate-500 text-xs font-normal">(optional)</span>
          </label>
          <input
            id="contact-whatsapp"
            type="tel"
            autoComplete="tel"
            {...register('whatsapp')}
            className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition-all duration-200 text-sm"
            placeholder="+234 801 234 5678"
          />
        </div>

        {/* Company */}
        <div>
          <label htmlFor="contact-company" className="block text-sm font-medium text-slate-300 mb-1.5">
            Company / Organisation <span className="text-slate-500 text-xs font-normal">(optional)</span>
          </label>
          <input
            id="contact-company"
            type="text"
            autoComplete="organization"
            {...register('company')}
            className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition-all duration-200 text-sm"
            placeholder="Acme Ltd."
          />
        </div>
      </div>

      {/* Need / Message */}
      <div className="mb-4">
        <label htmlFor="contact-need" className="block text-sm font-medium text-slate-300 mb-1.5">
          What do you need? <span className="text-red-400" aria-hidden="true">*</span>
        </label>
        <textarea
          id="contact-need"
          rows={5}
          {...register('need')}
          className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition-all duration-200 text-sm resize-none"
          placeholder="Describe what you are trying to build or fix. Be specific — the more detail, the faster I can help."
          aria-describedby={errors.need ? 'contact-need-error' : undefined}
          aria-invalid={!!errors.need}
        />
        {errors.need && (
          <p id="contact-need-error" role="alert" className="text-xs text-red-400 mt-1">
            {errors.need.message}
          </p>
        )}
      </div>

      {/* Budget */}
      <div className="mb-6">
        <label htmlFor="contact-budget" className="block text-sm font-medium text-slate-300 mb-1.5">
          Approximate Budget <span className="text-slate-500 text-xs font-normal">(optional)</span>
        </label>
        <select
          id="contact-budget"
          {...register('budgetRange')}
          className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-100 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition-all duration-200 text-sm"
        >
          {BUDGET_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value} className="bg-slate-900">
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Consent */}
      <div className="mb-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            id="contact-consent"
            type="checkbox"
            {...register('consentGiven')}
            className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500/40 focus:ring-offset-0"
            aria-describedby={errors.consentGiven ? 'contact-consent-error' : 'contact-consent-desc'}
            aria-invalid={!!errors.consentGiven}
          />
          <span id="contact-consent-desc" className="text-xs text-slate-400 leading-relaxed">
            I agree to ALLINET storing my contact details to respond to this enquiry.
            I have read the{' '}
            <a href="/privacy" className="text-amber-400 hover:text-amber-300 transition-colors underline" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>.
          </span>
        </label>
        {errors.consentGiven && (
          <p id="contact-consent-error" role="alert" className="text-xs text-red-400 mt-1 ml-7">
            {errors.consentGiven.message}
          </p>
        )}
      </div>

      {/* TODO(owner): Add <div class="cf-turnstile" data-sitekey="YOUR_SITE_KEY"></div> here when TURNSTILE_SECRET_KEY is configured */}

      {/* Server feedback */}
      {status === 'success' && serverMessage && (
        <div
          role="status"
          aria-live="polite"
          className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm"
        >
          ✓ {serverMessage}
        </div>
      )}
      {status === 'error' && serverMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
        >
          ✕ {serverMessage}
        </div>
      )}

      <button
        id="contact-submit"
        type="submit"
        disabled={status === 'submitting'}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
        aria-label={status === 'submitting' ? 'Sending your message…' : 'Send message'}
      >
        {status === 'submitting' ? 'Sending…' : 'Send Message →'}
      </button>
    </form>
  )
}
