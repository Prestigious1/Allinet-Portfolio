'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BriefFormData,
  INITIAL_BRIEF_FORM_DATA,
  MODULE_OPTIONS,
  ORG_TYPES,
  INDUSTRIES,
  TIMELINE_OPTIONS,
  BUDGET_OPTIONS,
  SCALE_OPTIONS,
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
} from './brief-schema'

const STORAGE_KEY = 'allinet_brief_draft_v1'

const STEP_TITLES = [
  { step: 1, title: 'Business', desc: 'Organization profile' },
  { step: 2, title: 'Problem', desc: 'Core operational pain' },
  { step: 3, title: 'Modules', desc: 'System capabilities' },
  { step: 4, title: 'Scope', desc: 'Timeline & budget' },
  { step: 5, title: 'Contact', desc: 'Details & consent' },
]

export function BriefWizard() {
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [formData, setFormData] = useState<BriefFormData>(INITIAL_BRIEF_FORM_DATA)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false)
  const [submittedData, setSubmittedData] = useState<BriefFormData | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)

  // Load draft from sessionStorage on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const saved = window.sessionStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed && typeof parsed === 'object') {
            setFormData((prev) => ({ ...prev, ...parsed.formData }))
            if (typeof parsed.step === 'number' && parsed.step >= 1 && parsed.step <= 5) {
              setCurrentStep(parsed.step)
            }
          }
        }
      }
    } catch (e) {
      console.warn('[BriefWizard] Could not restore draft from sessionStorage', e)
    }
  }, [])

  // Auto-save to sessionStorage when formData or currentStep changes
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage && !submitSuccess) {
        window.sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ formData, step: currentStep })
        )
      }
    } catch (e) {
      console.warn('[BriefWizard] Could not save draft to sessionStorage', e)
    }
  }, [formData, currentStep, submitSuccess])

  const clearDraft = () => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(STORAGE_KEY)
      }
    } catch {}
    setFormData(INITIAL_BRIEF_FORM_DATA)
    setCurrentStep(1)
    setErrors({})
    setSubmitError(null)
  }

  const updateField = <K extends keyof BriefFormData>(key: K, value: BriefFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors((prev) => {
        const copy = { ...prev }
        delete copy[key]
        return copy
      })
    }
  }

  const toggleModule = (moduleId: string) => {
    const current = formData.modules || []
    const updated = current.includes(moduleId)
      ? current.filter((id) => id !== moduleId)
      : [...current, moduleId]
    updateField('modules', updated)
  }

  // Validate only the current step before advancing
  const validateStep = (step: number): boolean => {
    setErrors({})
    let result

    switch (step) {
      case 1:
        result = step1Schema.safeParse({
          businessName: formData.businessName,
          orgType: formData.orgType,
          industry: formData.industry,
        })
        break
      case 2:
        result = step2Schema.safeParse({
          problemSummary: formData.problemSummary,
          currentTools: formData.currentTools,
        })
        break
      case 3:
        result = step3Schema.safeParse({
          modules: formData.modules,
        })
        break
      case 4:
        result = step4Schema.safeParse({
          timeline: formData.timeline,
          budgetRange: formData.budgetRange,
          targetScale: formData.targetScale,
        })
        break
      case 5:
        result = step5Schema.safeParse({
          contactName: formData.contactName,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,
          notes: formData.notes,
          consentGiven: formData.consentGiven,
          honeypot: formData.honeypot,
        })
        break
      default:
        return true
    }

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((err) => {
        const path = err.path[0] as string
        if (path) fieldErrors[path] = err.message
      })
      setErrors(fieldErrors)
      return false
    }

    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5))
    }
  }

  const handleBack = () => {
    setErrors({})
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(5)) return

    if (!formData.consentGiven) {
      setErrors((prev) => ({
        ...prev,
        consentGiven: 'You must agree to data processing to continue',
      }))
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          turnstileToken:
            (typeof document !== 'undefined' &&
              document.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]')?.value) ||
            'dev-bypass',
        }),
      })

      if (res.ok) {
        const json = await res.json()
        setSubmittedData(formData)
        setSubmitSuccess(true)
        if (json?.data?.shareUrl) {
          setShareUrl(json.data.shareUrl)
        }
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.removeItem(STORAGE_KEY)
        }
      } else {
        // If /api/brief endpoint is not yet created (404/500) during phase P10-01,
        // provide client-side graceful fallback so user can inspect their generated brief
        if (res.status === 404) {
          setSubmittedData(formData)
          setSubmitSuccess(true)
          if (typeof window !== 'undefined' && window.sessionStorage) {
            window.sessionStorage.removeItem(STORAGE_KEY)
          }
        } else {
          const json = await res.json().catch(() => null)
          setSubmitError(json?.error?.message || 'Submission failed. Please check your network and try again.')
        }
      }
    } catch {
      // Offline / network failure fallback
      setSubmittedData(formData)
      setSubmitSuccess(true)
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(STORAGE_KEY)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // -------------------------------------------------------------------------
  // Render Success State
  // -------------------------------------------------------------------------
  if (submitSuccess && submittedData) {
    return (
      <div id="brief-success-view" className="site-glass-card p-8 sm:p-10 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            ✓
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 font-display">
            Project Brief Received!
          </h2>
          <p className="text-slate-300 max-w-lg mx-auto text-sm leading-relaxed">
            Thank you, <strong className="text-white">{submittedData.contactName}</strong>. Your project specification for{' '}
            <strong className="text-amber-400">{submittedData.businessName}</strong> has been structured.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 mb-6 space-y-4 text-sm">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="text-slate-400">Organization & Industry</span>
            <span className="text-white font-medium">{submittedData.businessName} ({submittedData.industry})</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="text-slate-400">Target Timeline</span>
            <span className="text-white font-medium">
              {TIMELINE_OPTIONS.find((t) => t.value === submittedData.timeline)?.label || submittedData.timeline}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="text-slate-400">Budget Guidance</span>
            <span className="text-white font-medium">
              {BUDGET_OPTIONS.find((b) => b.value === submittedData.budgetRange)?.label || 'To be scoped'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-2">Selected Modules ({submittedData.modules.length}):</span>
            <div className="flex flex-wrap gap-1.5">
              {submittedData.modules.map((modId) => {
                const opt = MODULE_OPTIONS.find((m) => m.id === modId)
                return (
                  <span
                    key={modId}
                    className="px-2.5 py-1 rounded-md text-xs bg-amber-500/10 border border-amber-500/30 text-amber-300"
                  >
                    {opt?.label || modId}
                  </span>
                )
              })}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed mb-8">
          <strong>Notice:</strong> This proposal preview is an architectural estimate for scoping purposes only, not a binding quote or legal contract. A formal agreement will follow discovery verification.
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {shareUrl ? (
            <Link
              href={shareUrl}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold text-center hover:opacity-95 transition-opacity"
            >
              Open Full Proposal Page →
            </Link>
          ) : (
            <button
              type="button"
              onClick={clearDraft}
              className="px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition-colors"
            >
              Start Another Brief
            </button>
          )}
          <Link
            href="/contact"
            className="px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-medium text-center hover:bg-slate-700 transition-colors"
          >
            Direct Consultation / Book Call
          </Link>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Main Multi-Step Form
  // -------------------------------------------------------------------------
  return (
    <div id="brief-wizard-container" className="site-glass-card p-6 sm:p-10 max-w-4xl mx-auto">
      {/* Top Stepper Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Step {currentStep} of 5: {STEP_TITLES[currentStep - 1].title}
          </span>
          <button
            type="button"
            onClick={clearDraft}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors underline"
          >
            Reset Form
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="grid grid-cols-5 gap-2 mb-2" role="tablist" aria-label="Brief builder steps">
          {STEP_TITLES.map((st) => {
            const isCompleted = currentStep > st.step
            const isCurrent = currentStep === st.step
            return (
              <div
                key={st.step}
                className="flex flex-col"
                role="tab"
                aria-selected={isCurrent}
                aria-label={`Step ${st.step}: ${st.title}`}
              >
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500'
                      : isCurrent
                      ? 'bg-amber-400'
                      : 'bg-slate-800'
                  }`}
                />
                <span
                  className={`text-[11px] mt-1.5 hidden sm:block truncate transition-colors ${
                    isCurrent
                      ? 'text-amber-300 font-semibold'
                      : isCompleted
                      ? 'text-slate-300'
                      : 'text-slate-600'
                  }`}
                >
                  {st.step}. {st.title}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <form id="brief-builder-form" onSubmit={handleSubmit} noValidate aria-label="Project Brief Builder">
        {/* Step 1: Business details & organization type */}
        {currentStep === 1 && (
          <div className="space-y-6" role="region" aria-label="Step 1: Business details">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5 font-display">
                Tell us about your organization
              </h2>
              <p className="text-sm text-slate-400">
                This helps tailor architecture recommendations to your company stage.
              </p>
            </div>

            {/* Business / Project Name */}
            <div>
              <label htmlFor="brief-business-name" className="block text-sm font-medium text-slate-200 mb-1.5">
                Business or Project Name <span className="text-red-400" aria-hidden="true">*</span>
              </label>
              <input
                id="brief-business-name"
                type="text"
                value={formData.businessName}
                onChange={(e) => updateField('businessName', e.target.value)}
                placeholder="e.g. PayFlow Global or Acme Logistics"
                className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 text-sm"
                aria-describedby={errors.businessName ? 'brief-business-name-error' : undefined}
                aria-invalid={!!errors.businessName}
              />
              {errors.businessName && (
                <p id="brief-business-name-error" role="alert" className="text-xs text-red-400 mt-1">
                  {errors.businessName}
                </p>
              )}
            </div>

            {/* Organization Type */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Organization Stage / Profile <span className="text-red-400" aria-hidden="true">*</span>
              </label>
              <div className="grid sm:grid-cols-2 gap-3">
                {ORG_TYPES.map((org) => {
                  const isSelected = formData.orgType === org.value
                  return (
                    <label
                      key={org.value}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/60 text-white ring-1 ring-amber-500/30'
                          : 'bg-slate-850/60 border-slate-700/60 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="orgType"
                        value={org.value}
                        checked={isSelected}
                        onChange={() => updateField('orgType', org.value)}
                        className="sr-only"
                      />
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-amber-400 bg-amber-400' : 'border-slate-500'
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                      </span>
                      <span>{org.label}</span>
                    </label>
                  )
                })}
              </div>
              {errors.orgType && (
                <p role="alert" className="text-xs text-red-400 mt-1">
                  {errors.orgType}
                </p>
              )}
            </div>

            {/* Industry */}
            <div>
              <label htmlFor="brief-industry" className="block text-sm font-medium text-slate-200 mb-1.5">
                Primary Industry Sector <span className="text-red-400" aria-hidden="true">*</span>
              </label>
              <select
                id="brief-industry"
                value={formData.industry}
                onChange={(e) => updateField('industry', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-100 text-sm focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40"
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind} className="bg-slate-900 text-slate-100">
                    {ind}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Core operational problem */}
        {currentStep === 2 && (
          <div className="space-y-6" role="region" aria-label="Step 2: Operational problem">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5 font-display">
                What problem are you solving?
              </h2>
              <p className="text-sm text-slate-400">
                Detail the friction in your current operations or what you want the new system to achieve.
              </p>
            </div>

            {/* Problem Summary */}
            <div>
              <label htmlFor="brief-problem" className="block text-sm font-medium text-slate-200 mb-1.5">
                Core Operational Problem & Objective <span className="text-red-400" aria-hidden="true">*</span>
              </label>
              <textarea
                id="brief-problem"
                rows={5}
                value={formData.problemSummary}
                onChange={(e) => updateField('problemSummary', e.target.value)}
                placeholder="Example: We manually reconcile orders across WhatsApp and Excel sheets, causing delayed shipments and revenue leakage. We need an automated web dashboard with order intake, Paystack billing, and automated customer SMS alerts."
                className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 text-sm resize-none"
                aria-describedby={errors.problemSummary ? 'brief-problem-error' : undefined}
                aria-invalid={!!errors.problemSummary}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.problemSummary ? (
                  <p id="brief-problem-error" role="alert" className="text-xs text-red-400">
                    {errors.problemSummary}
                  </p>
                ) : (
                  <span className="text-xs text-slate-500">Minimum 15 characters</span>
                )}
                <span className="text-xs text-slate-500">{formData.problemSummary.length}/2000</span>
              </div>
            </div>

            {/* Current Tools */}
            <div>
              <label htmlFor="brief-tools" className="block text-sm font-medium text-slate-200 mb-1.5">
                Current Tools, Spreadsheets or Workflow <span className="text-slate-500 text-xs font-normal">(optional)</span>
              </label>
              <input
                id="brief-tools"
                type="text"
                value={formData.currentTools || ''}
                onChange={(e) => updateField('currentTools', e.target.value)}
                placeholder="e.g. Google Sheets, WhatsApp Business, Notion, Zoho CRM"
                className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 text-sm"
              />
            </div>
          </div>
        )}

        {/* Step 3: System modules required */}
        {currentStep === 3 && (
          <div className="space-y-6" role="region" aria-label="Step 3: Required modules">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5 font-display">
                  Select System Modules
                </h2>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  {formData.modules.length} selected
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Choose the architectural building blocks your software needs. You can choose one or multiple.
              </p>
            </div>

            {errors.modules && (
              <p role="alert" className="text-xs text-red-400 font-medium">
                {errors.modules}
              </p>
            )}

            <div className="grid sm:grid-cols-2 gap-3.5">
              {MODULE_OPTIONS.map((module) => {
                const isSelected = formData.modules.includes(module.id)
                return (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => toggleModule(module.id)}
                    className={`p-4 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/60 text-white ring-1 ring-amber-500/30 shadow-lg shadow-amber-500/5'
                        : 'bg-slate-850/60 border-slate-750/70 text-slate-300 hover:border-slate-600 hover:bg-slate-800/60'
                    }`}
                    role="checkbox"
                    aria-checked={isSelected}
                    aria-label={module.label}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-semibold text-sm text-slate-100">{module.label}</span>
                      <span
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                          isSelected
                            ? 'bg-amber-400 border-amber-400 text-slate-950'
                            : 'border-slate-600 text-transparent'
                        }`}
                      >
                        ✓
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{module.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 4: Timeline & budget range */}
        {currentStep === 4 && (
          <div className="space-y-6" role="region" aria-label="Step 4: Timeline and budget">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5 font-display">
                Timeline, Scope & Budget
              </h2>
              <p className="text-sm text-slate-400">
                Realistic pacing helps structure your milestones into Phase 1 MVP and Phase 2 Polish.
              </p>
            </div>

            {/* Timeline */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Estimated Delivery Window <span className="text-red-400" aria-hidden="true">*</span>
              </label>
              <div className="grid sm:grid-cols-2 gap-3">
                {TIMELINE_OPTIONS.map((item) => {
                  const isSelected = formData.timeline === item.value
                  return (
                    <label
                      key={item.value}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/60 text-white ring-1 ring-amber-500/30'
                          : 'bg-slate-850/60 border-slate-750/70 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="timeline"
                        value={item.value}
                        checked={isSelected}
                        onChange={() => updateField('timeline', item.value)}
                        className="sr-only"
                      />
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-amber-400 bg-amber-400' : 'border-slate-500'
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                      </span>
                      <span>{item.label}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Budget Range */}
            <div>
              <label htmlFor="brief-budget" className="block text-sm font-medium text-slate-200 mb-1.5">
                Budget Range Guidance <span className="text-slate-500 text-xs font-normal">(optional / scoping)</span>
              </label>
              <select
                id="brief-budget"
                value={formData.budgetRange}
                onChange={(e) => updateField('budgetRange', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-100 text-sm focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40"
              >
                {BUDGET_OPTIONS.map((bg) => (
                  <option key={bg.value} value={bg.value} className="bg-slate-900 text-slate-100">
                    {bg.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                If uncertain, leave as &quot;To be scoped&quot; and we will propose an MVP modular breakdown.
              </p>
            </div>

            {/* Scale */}
            <div>
              <label htmlFor="brief-scale" className="block text-sm font-medium text-slate-200 mb-1.5">
                Expected Initial User Scale <span className="text-slate-500 text-xs font-normal">(optional)</span>
              </label>
              <select
                id="brief-scale"
                value={formData.targetScale || 'mvp'}
                onChange={(e) => updateField('targetScale', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-100 text-sm focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40"
              >
                {SCALE_OPTIONS.map((sc) => (
                  <option key={sc.value} value={sc.value} className="bg-slate-900 text-slate-100">
                    {sc.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 5: Contact info & consent */}
        {currentStep === 5 && (
          <div className="space-y-6" role="region" aria-label="Step 5: Contact information">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5 font-display">
                Your Contact Information
              </h2>
              <p className="text-sm text-slate-400">
                Where should we send the proposal preview and direct link?
              </p>
            </div>

            {/* Honeypot field */}
            <input
              type="text"
              name="honeypot"
              value={formData.honeypot || ''}
              onChange={(e) => updateField('honeypot', e.target.value)}
              className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden"
              tabIndex={-1}
              aria-hidden="true"
            />

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label htmlFor="brief-contact-name" className="block text-sm font-medium text-slate-200 mb-1.5">
                  Full Name <span className="text-red-400" aria-hidden="true">*</span>
                </label>
                <input
                  id="brief-contact-name"
                  type="text"
                  autoComplete="name"
                  value={formData.contactName}
                  onChange={(e) => updateField('contactName', e.target.value)}
                  placeholder="e.g. Tunde Balogun"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 text-sm"
                  aria-describedby={errors.contactName ? 'brief-name-error' : undefined}
                  aria-invalid={!!errors.contactName}
                />
                {errors.contactName && (
                  <p id="brief-name-error" role="alert" className="text-xs text-red-400 mt-1">
                    {errors.contactName}
                  </p>
                )}
              </div>

              {/* Work Email */}
              <div>
                <label htmlFor="brief-contact-email" className="block text-sm font-medium text-slate-200 mb-1.5">
                  Email Address <span className="text-red-400" aria-hidden="true">*</span>
                </label>
                <input
                  id="brief-contact-email"
                  type="email"
                  autoComplete="email"
                  value={formData.contactEmail}
                  onChange={(e) => updateField('contactEmail', e.target.value)}
                  placeholder="tunde@company.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 text-sm"
                  aria-describedby={errors.contactEmail ? 'brief-email-error' : undefined}
                  aria-invalid={!!errors.contactEmail}
                />
                {errors.contactEmail && (
                  <p id="brief-email-error" role="alert" className="text-xs text-red-400 mt-1">
                    {errors.contactEmail}
                  </p>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* WhatsApp / Phone */}
              <div>
                <label htmlFor="brief-contact-phone" className="block text-sm font-medium text-slate-200 mb-1.5">
                  Phone / WhatsApp <span className="text-slate-500 text-xs font-normal">(optional)</span>
                </label>
                <input
                  id="brief-contact-phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.contactPhone || ''}
                  onChange={(e) => updateField('contactPhone', e.target.value)}
                  placeholder="+234 801 234 5678"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 text-sm"
                />
              </div>

              {/* Additional Notes */}
              <div>
                <label htmlFor="brief-notes" className="block text-sm font-medium text-slate-200 mb-1.5">
                  Additional Notes or Links <span className="text-slate-500 text-xs font-normal">(optional)</span>
                </label>
                <input
                  id="brief-notes"
                  type="text"
                  value={formData.notes || ''}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="e.g. Figma links, repository or legacy system link"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 text-sm"
                />
              </div>
            </div>

            {/* Mandatory Consent Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  id="brief-consent"
                  type="checkbox"
                  checked={formData.consentGiven}
                  onChange={(e) => updateField('consentGiven', e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500/40 focus:ring-offset-0 cursor-pointer"
                  aria-describedby={errors.consentGiven ? 'brief-consent-error' : undefined}
                />
                <span className="text-xs text-slate-400 leading-relaxed">
                  I agree to data processing in accordance with the{' '}
                  <Link href="/privacy" className="text-amber-400 hover:underline">
                    Privacy Policy
                  </Link>{' '}
                  for the purpose of generating, reviewing, and discussing this project brief.{' '}
                  <span className="text-red-400" aria-hidden="true">*</span>
                </span>
              </label>
              {errors.consentGiven && (
                <p id="brief-consent-error" role="alert" className="text-xs text-red-400 mt-1">
                  {errors.consentGiven}
                </p>
              )}
            </div>

            {submitError && (
              <div role="alert" className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                {submitError}
              </div>
            )}
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between pt-8 border-t border-slate-800/80 mt-8">
          <div>
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-750 text-sm font-medium transition-all"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}
          </div>

          <div>
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold text-sm hover:opacity-95 transition-all shadow-md shadow-amber-500/10"
              >
                Continue to Step {currentStep + 1} →
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm hover:opacity-95 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Generating Proposal...
                  </>
                ) : (
                  'Generate Project Proposal →'
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
