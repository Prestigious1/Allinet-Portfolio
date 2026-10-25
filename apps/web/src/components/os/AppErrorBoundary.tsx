'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface AppErrorBoundaryProps {
  children: ReactNode
  appTitle?: string
  appId?: string
  onClose?: () => void
}

interface AppErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public state: AppErrorBoundaryState = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[AppErrorBoundary] Crash intercepted in "${this.props.appTitle || 'App'}":`, error, errorInfo)
  }

  public handleRestart = () => {
    this.setState({ hasError: false, error: null })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 p-6 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md text-white select-none overflow-hidden">
          {/* Cyberpunk warning glow */}
          <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
          
          <div className="relative z-10 max-w-md w-full glassmorphism p-6 rounded-2xl border border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.2)] text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-2xl font-mono">
              ⚠️
            </div>

            <div>
              <h3 className="text-base font-bold font-display text-white tracking-wide">
                Process Terminated Unexpectedly
              </h3>
              <p className="text-xs font-mono text-red-300/80 mt-1">
                {this.props.appTitle ? `Module: ${this.props.appTitle}` : 'Window Process'}
              </p>
            </div>

            <div className="bg-black/60 p-3 rounded-lg border border-white/10 text-left font-mono text-[11px] text-white/70 max-h-24 overflow-y-auto break-words">
              {this.state.error?.message || 'An unexpected exception occurred during execution.'}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleRestart}
                className="px-4 py-2 rounded-lg bg-gold/20 hover:bg-gold/30 border border-gold/40 text-gold text-xs font-mono font-semibold transition-all hover:scale-105 active:scale-95"
              >
                ↻ Relaunch Process
              </button>

              {this.props.onClose && (
                <button
                  onClick={this.props.onClose}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 text-xs font-mono transition-all"
                >
                  ✕ Close Window
                </button>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
