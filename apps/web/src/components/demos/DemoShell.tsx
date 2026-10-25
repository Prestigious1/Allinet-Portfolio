'use client';

import React, { useState, useEffect } from 'react';

export interface WalkthroughStep {
  title: string;
  description: string;
  tip?: string;
}

export interface DemoShellProps {
  title: string;
  badge?: string;
  subtitle?: string;
  storageKey: string;
  onReset: () => void;
  walkthroughSteps?: WalkthroughStep[];
  challengeTitle?: string;
  challengeCompleted?: boolean;
  challengeTimeSeconds?: number;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
}

export const DemoShell: React.FC<DemoShellProps> = ({
  title,
  badge = 'LIVE PROOF DEMO',
  subtitle,
  storageKey,
  onReset,
  walkthroughSteps = [],
  challengeTitle,
  challengeCompleted = false,
  challengeTimeSeconds,
  children,
  headerActions,
}) => {
  const [showWalkthrough, setShowWalkthrough] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [resetConfirmOpen, setResetConfirmOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (challengeCompleted && challengeTitle) {
      setToastMessage(
        `🏆 Challenge Completed: "${challengeTitle}"${
          challengeTimeSeconds !== undefined ? ` in ${challengeTimeSeconds}s!` : '!'
        }`
      );
      const timer = setTimeout(() => setToastMessage(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [challengeCompleted, challengeTitle, challengeTimeSeconds]);

  const handleReset = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(storageKey);
      }
    } catch {
      // Storage access error handling
    }
    onReset();
    setResetConfirmOpen(false);
    setToastMessage('🔄 Demo sandbox reset to initial seed state.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="relative min-h-screen bg-[#08090C] text-slate-100 font-sans selection:bg-amber-500/20 selection:text-amber-200">
      {/* Top Warning Banner */}
      <aside
        aria-label="Demo environment notice"
        className="w-full bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs tracking-wider uppercase font-mono text-amber-300"
      >
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>DEMO SANDBOX — NO REAL CHARGES • SYNTHETIC DEMO DATA</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-amber-400/70">
          <span>ALL TRANSACTIONS ARE SIMULATED</span>
        </div>
      </aside>

      {/* Header Bar */}
      <header className="border-b border-white/10 bg-[#0B0D13]/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
              {badge}
            </span>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-white">
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2.5">
          {headerActions}

          {walkthroughSteps.length > 0 && (
            <button
              type="button"
              id="btn-tour-toggle"
              aria-label="Toggle guided tour"
              onClick={() => {
                setShowWalkthrough(!showWalkthrough);
                setCurrentStepIndex(0);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-white/15 bg-white/5 hover:bg-white/10 hover:border-amber-400/40 text-slate-200 transition-colors"
            >
              <span>💡</span>
              <span>{showWalkthrough ? 'Close Tour' : 'Guided Tour'}</span>
            </button>
          )}

          <button
            type="button"
            id="btn-reset-demo"
            aria-label="Reset demo sandbox"
            onClick={() => setResetConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors"
          >
            <span>🔄</span>
            <span>Reset Demo Data</span>
          </button>
        </div>
      </header>

      {/* Reset Confirmation Modal */}
      {resetConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <div className="bg-[#12151F] border border-white/15 rounded-xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3
              id="reset-modal-title"
              className="text-base font-bold text-white flex items-center gap-2"
            >
              <span className="text-amber-400">⚠️</span> Reset Sandbox State?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will clear all changes made in this session and restore the default Lagos venue bookings and seed records.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                id="btn-cancel-reset"
                onClick={() => setResetConfirmOpen(false)}
                className="px-3 py-1.5 rounded text-xs font-medium text-slate-300 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-reset"
                onClick={handleReset}
                className="px-3.5 py-1.5 rounded text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-sm"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Walkthrough Tour Drawer / Panel */}
      {showWalkthrough && walkthroughSteps.length > 0 && (
        <div
          id="walkthrough-panel"
          className="bg-amber-950/40 border-b border-amber-500/30 px-4 py-3 text-xs"
        >
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-300 font-bold font-mono">
                <span>Step {currentStepIndex + 1} of {walkthroughSteps.length}:</span>
                <span className="text-white">
                  {walkthroughSteps[currentStepIndex]?.title}
                </span>
              </div>
              <p className="text-slate-300">
                {walkthroughSteps[currentStepIndex]?.description}
              </p>
              {walkthroughSteps[currentStepIndex]?.tip && (
                <p className="text-amber-300/80 italic text-[11px]">
                  💡 Pro-tip: {walkthroughSteps[currentStepIndex]?.tip}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={currentStepIndex === 0}
                onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                className="px-2.5 py-1 rounded bg-white/5 border border-white/10 disabled:opacity-30 text-slate-200 hover:bg-white/10"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentStepIndex === walkthroughSteps.length - 1}
                onClick={() =>
                  setCurrentStepIndex((prev) =>
                    Math.min(walkthroughSteps.length - 1, prev + 1)
                  )
                }
                className="px-2.5 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-200 font-semibold hover:bg-amber-500/30 disabled:opacity-30"
              >
                Next
              </button>
              <button
                type="button"
                onClick={() => setShowWalkthrough(false)}
                className="px-2.5 py-1 text-slate-400 hover:text-white"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Sandbox Content */}
      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">{children}</main>

      {/* Global Interactive Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          id="demo-shell-toast"
          className="fixed bottom-6 right-6 z-50 bg-[#161B26] border border-amber-500/40 text-amber-200 px-4 py-3 rounded-lg shadow-2xl text-xs font-medium flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
