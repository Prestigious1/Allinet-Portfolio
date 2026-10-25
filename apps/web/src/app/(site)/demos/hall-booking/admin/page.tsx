'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { DemoShell } from '@/components/demos/DemoShell';
import {
  useHallBookingStore,
  STORAGE_KEY,
} from '@/domains/hall-booking/store';
import {
  UserRole,
  formatKoboToNgn,
  calculateCancellationRefund,
  Booking,
  Customer,
} from '@/domains/hall-booking/engine';

export default function HallBookingAdminPage() {
  const {
    halls,
    bookings,
    customers,
    currentRole,
    setRole,
    resetSandbox,
    confirmDeposit,
    cancelBooking,
    markNoShow,
    resolveAppeal,
    challengeActive,
    challengeStartTime,
    challengeElapsedSeconds,
    challengeCompleted,
    challengeSteps,
    startChallenge,
    stopChallenge,
  } = useHallBookingStore();

  const [activeTab, setActiveTab] = useState<'calendar' | 'bookings' | 'appeals' | 'notifications'>('bookings');
  const [selectedBookingForAction, setSelectedBookingForAction] = useState<Booking | null>(null);
  const [cancellationReason, setCancellationReason] = useState<string>('Client schedule conflict');
  const [appealNotes, setAppealNotes] = useState<string>('Discretionary waiver applied by operations desk');
  const [whatsappSentNotice, setWhatsappSentNotice] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);

  // Challenge live stopwatch
  useEffect(() => {
    let interval: any = null;
    if (challengeActive && challengeStartTime && !challengeCompleted) {
      interval = setInterval(() => {
        setTimerSeconds(Math.round((Date.now() - challengeStartTime) / 1000));
      }, 500);
    } else {
      setTimerSeconds(0);
    }
    return () => clearInterval(interval);
  }, [challengeActive, challengeStartTime, challengeCompleted]);

  // Aggregate KPIs
  const kpis = useMemo(() => {
    const totalRevenueKobo = bookings.reduce((acc, b) => {
      if (b.status === 'confirmed' || b.status === 'completed') {
        return acc + b.depositPaidKobo;
      }
      return acc;
    }, 0);

    const pendingCount = bookings.filter(
      (b) => b.status === 'pending_deposit' || b.status === 'pending_approval'
    ).length;

    const confirmedCount = bookings.filter(
      (b) => b.status === 'confirmed' || b.status === 'completed'
    ).length;

    const bannedCount = customers.filter(
      (c) => c.bannedUntil && new Date(c.bannedUntil).getTime() > Date.now()
    ).length;

    return {
      revenueNgn: formatKoboToNgn(totalRevenueKobo),
      pendingCount,
      confirmedCount,
      bannedCount,
    };
  }, [bookings, customers]);

  // Handlers
  const handleConfirmDeposit = (bookingId: string, amountKobo: number) => {
    confirmDeposit(bookingId, amountKobo);
    setSelectedBookingForAction(null);
  };

  const handleCancelBooking = (bookingId: string) => {
    cancelBooking(bookingId, cancellationReason);
    setSelectedBookingForAction(null);
  };

  const handleMarkNoShow = (bookingId: string) => {
    markNoShow(bookingId);
    setSelectedBookingForAction(null);
  };

  const handleResolveAppeal = (bookingId: string, outcome: 'upheld' | 'forgiven') => {
    resolveAppeal(bookingId, outcome, appealNotes);
    setSelectedBookingForAction(null);
  };

  const handleSendWhatsappSimulation = (booking: Booking) => {
    const cust = customers.find((c) => c.id === booking.customerId);
    const hall = halls.find((h) => h.id === booking.hallId);
    const msg = `[SIMULATED DISPATCH] Automated WhatsApp reminder dispatched to ${cust?.phone || cust?.name}: "Your booking ${booking.id} at ${hall?.name} is confirmed. Turnaround buffer active."`;
    setWhatsappSentNotice(msg);
    setTimeout(() => setWhatsappSentNotice(null), 6000);
  };

  const walkthroughSteps = [
    {
      title: 'Switch Staff Roles',
      description:
        'Use the role picker to switch between Front-desk, Manager, Owner, or Auditor.',
      tip: 'The permission matrix restricts actions according to enterprise security standards.',
    },
    {
      title: 'Inspect Calendar & Turnaround Buffers',
      description:
        'Verify how setup and teardown buffer times prevent back-to-back hall booking collisions.',
    },
    {
      title: 'Manage Bookings & Deposits',
      description:
        'Confirm pending deposits, mark no-shows, or calculate tiered refunds automatically.',
    },
    {
      title: 'Operations Controller 60-Second Challenge',
      description:
        'Click "Start Challenge", create a booking, trigger a no-show penalty, and resolve an appeal under 60 seconds to unlock the Operations Controller achievement.',
    },
  ];

  return (
    <DemoShell
      title="Hall Booking Operations Command Center"
      badge="ADMIN CONSOLE DEMO"
      subtitle="Enterprise venue operations desk: turnaround scheduling, automated deposits, no-show sanctions & appeals"
      storageKey={STORAGE_KEY}
      onReset={resetSandbox}
      walkthroughSteps={walkthroughSteps}
      challengeTitle="Operations Controller"
      challengeCompleted={challengeCompleted}
      challengeTimeSeconds={challengeElapsedSeconds}
      headerActions={
        <div className="flex items-center gap-3">
          {/* Role Switcher */}
          <div className="flex items-center gap-1.5 bg-[#07090E] p-1 rounded-lg border border-white/10 text-xs">
            <span className="text-[11px] font-mono text-slate-400 px-1">Role:</span>
            {(['front_desk', 'manager', 'owner', 'auditor'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                id={`role-btn-${r}`}
                onClick={() => setRole(r)}
                className={`px-2 py-1 rounded text-[11px] font-medium capitalize transition-colors ${
                  currentRole === r
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r.replace('_', ' ')}
              </button>
            ))}
          </div>

          <Link
            href="/demos/hall-booking"
            id="link-customer-flow"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 transition-colors"
          >
            <span>←</span>
            <span>Customer Portal</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Challenge Control Banner (F-127) */}
        <div className="p-4 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base">⏱️</span>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Demo Challenge: Operations Controller (F-127)
              </h2>
              {challengeCompleted && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  ✓ COMPLETED ({challengeElapsedSeconds}s)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300">
              Complete: Create Booking with Promo → Mark No-Show Penalty → Forgive Appeal in under 60 seconds.
            </p>
            <div className="flex flex-wrap gap-3 text-[11px] font-mono pt-1 text-slate-400">
              <span className={challengeSteps.bookingCreated ? 'text-emerald-400 font-bold' : ''}>
                1. Booking ({challengeSteps.bookingCreated ? '✓' : '○'})
              </span>
              <span className={challengeSteps.promoApplied ? 'text-emerald-400 font-bold' : ''}>
                2. Promo ({challengeSteps.promoApplied ? '✓' : '○'})
              </span>
              <span className={challengeSteps.noShowTriggered ? 'text-emerald-400 font-bold' : ''}>
                3. No-Show Penalty ({challengeSteps.noShowTriggered ? '✓' : '○'})
              </span>
              <span className={challengeSteps.appealResolved ? 'text-emerald-400 font-bold' : ''}>
                4. Forgive Appeal ({challengeSteps.appealResolved ? '✓' : '○'})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {challengeActive && (
              <span className="text-sm font-mono font-bold text-amber-300 bg-black/40 px-3 py-1.5 rounded border border-amber-500/30">
                {timerSeconds}s / 60s
              </span>
            )}
            {!challengeActive ? (
              <button
                type="button"
                id="btn-start-challenge"
                onClick={startChallenge}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
              >
                Start 60s Challenge
              </button>
            ) : (
              <button
                type="button"
                onClick={stopChallenge}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-slate-300"
              >
                Abort
              </button>
            )}
          </div>
        </div>

        {/* Top Operational KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-white/10 bg-[#0F121C]">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Settled Deposits
            </span>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1">
              {kpis.revenueNgn}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Simulated Lagos inflow</span>
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-[#0F121C]">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Pending Approvals
            </span>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {kpis.pendingCount}
            </div>
            <span className="text-[10px] text-amber-400 mt-0.5 block">15m holds active</span>
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-[#0F121C]">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Confirmed Bookings
            </span>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
              {kpis.confirmedCount}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Turnarounds locked</span>
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-[#0F121C]">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Active Client Bans
            </span>
            <div className="text-xl font-bold font-mono text-rose-400 mt-1">
              {kpis.bannedCount}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">2 strikes (30 days)</span>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="border-b border-white/10 flex gap-2">
          <button
            type="button"
            id="tab-bookings"
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'bookings'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📋 Bookings Desk ({bookings.length})
          </button>
          <button
            type="button"
            id="tab-calendar"
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'calendar'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📅 Turnaround Calendar
          </button>
          <button
            type="button"
            id="tab-appeals"
            onClick={() => setActiveTab('appeals')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'appeals'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚖️ Sanctions & Appeals Center
          </button>
          <button
            type="button"
            id="tab-notifications"
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'notifications'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            💬 Simulated Dispatcher
          </button>
        </div>

        {/* Tab 1: Bookings Desk */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0F121C]">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-mono">
                  <tr>
                    <th className="py-3 px-4">Booking ID</th>
                    <th className="py-3 px-4">Venue</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Date & Slot</th>
                    <th className="py-3 px-4">Total (Deposit)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  {bookings.map((b) => {
                    const hall = halls.find((h) => h.id === b.hallId);
                    const cust = customers.find((c) => c.id === b.customerId);
                    const isSelected = selectedBookingForAction?.id === b.id;

                    return (
                      <tr
                        key={b.id}
                        className={`hover:bg-white/[0.02] transition-colors ${
                          isSelected ? 'bg-amber-500/10' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-medium text-amber-300">
                          {b.id}
                        </td>
                        <td className="py-3 px-4 font-semibold text-white">
                          {hall?.name.split(' (')[0]}
                        </td>
                        <td className="py-3 px-4">
                          <div>{cust?.name || b.customerId}</div>
                          <span className="text-[10px] text-slate-400 font-mono uppercase">
                            Tier: {cust?.tier}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px]">
                          <div>{b.start.split('T')[0]}</div>
                          <span className="text-slate-400 capitalize">{b.slotType}</span>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <div>{formatKoboToNgn(b.priceBreakdown.totalKobo)}</div>
                          <span className="text-[10px] text-amber-400">
                            Dep: {formatKoboToNgn(b.priceBreakdown.depositKobo)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                              b.status === 'confirmed'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : b.status === 'pending_deposit'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : b.status === 'completed'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : b.status === 'no_show'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-slate-500/20 text-slate-400'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5">
                          {b.status === 'pending_deposit' && (
                            <button
                              type="button"
                              id={`btn-approve-deposit-${b.id}`}
                              onClick={() => handleConfirmDeposit(b.id, b.priceBreakdown.depositKobo)}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                            >
                              Confirm Deposit
                            </button>
                          )}

                          {b.status === 'confirmed' && (
                            <>
                              <button
                                type="button"
                                id={`btn-noshow-${b.id}`}
                                onClick={() => handleMarkNoShow(b.id)}
                                className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-semibold text-[11px]"
                              >
                                No-Show
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSendWhatsappSimulation(b)}
                                className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 text-[11px]"
                                title="Preview WhatsApp reminder"
                              >
                                💬
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedBookingForAction(isSelected ? null : b)
                            }
                            className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-[11px]"
                          >
                            {isSelected ? 'Close' : 'Details'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Selected Booking Detail Inspector */}
            {selectedBookingForAction && (
              <div className="p-5 rounded-xl border border-white/15 bg-[#121622] space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold text-white font-mono">
                    Audit & Operations Inspection: {selectedBookingForAction.id}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedBookingForAction(null)}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    ✕ Close
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="space-y-2">
                    <span className="text-slate-400 block font-bold">Audit History:</span>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2">
                      {selectedBookingForAction.history.map((h, i) => (
                        <div key={i} className="p-2 rounded bg-white/5 border border-white/5">
                          <div className="flex justify-between text-slate-400 text-[10px]">
                            <span>{h.action}</span>
                            <span>{new Date(h.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <div className="text-white text-[11px]">
                            By {h.performedBy} ({h.role})
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="text-slate-400 block font-bold">Actions & Cancellation Rules:</span>
                    {selectedBookingForAction.status === 'confirmed' && (
                      <div className="p-3 rounded bg-black/40 border border-white/10 space-y-2">
                        <span className="text-slate-300 text-[11px] block">
                          Cancellation policy preview:
                        </span>
                        {(() => {
                          const refund = calculateCancellationRefund({
                            booking: selectedBookingForAction,
                          });
                          return (
                            <div className="text-amber-300 text-[11px]">
                              Refund eligibility: {refund.refundPercentage}% ({formatKoboToNgn(refund.refundKobo)})
                            </div>
                          );
                        })()}
                        <div className="flex gap-2 pt-1">
                          <input
                            type="text"
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                            placeholder="Reason for cancellation"
                            className="flex-1 px-2 py-1 rounded bg-[#08090C] border border-white/15 text-white text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleCancelBooking(selectedBookingForAction.id)}
                            className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                          >
                            Cancel Booking
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Turnaround Calendar */}
        {activeTab === 'calendar' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-white/10 bg-[#0F121C] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <h3 className="font-bold text-white uppercase tracking-wider font-mono">
                  Venue Turnaround Buffer Timetable (SPEC-05)
                </h3>
                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500/40 border border-emerald-400 inline-block" />
                    Confirmed Event
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-amber-500/40 border border-amber-400 inline-block" />
                    Turnaround Buffer
                  </span>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                {halls.map((hall) => {
                  const hallBookings = bookings.filter(
                    (b) => b.hallId === hall.id && b.status !== 'cancelled'
                  );
                  return (
                    <div key={hall.id} className="p-3.5 rounded-lg border border-white/5 bg-white/[0.02] space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white">{hall.name}</span>
                        <span className="text-[11px] font-mono text-slate-400">
                          Turnaround: ±{hall.bufferBeforeMin} min setup/teardown
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {hallBookings.map((b) => (
                          <div
                            key={b.id}
                            className="p-2.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-xs font-mono space-y-1"
                          >
                            <div className="flex justify-between text-[11px] text-emerald-300 font-bold">
                              <span>{b.id}</span>
                              <span className="uppercase">{b.status}</span>
                            </div>
                            <div className="text-[10px] text-slate-300">
                              Event: {b.start.replace('T', ' ').slice(0, 16)}
                            </div>
                            <div className="text-[10px] text-amber-400">
                              Turnaround Buffer: ±{hall.bufferBeforeMin}m locked
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Sanctions & Appeals Center */}
        {activeTab === 'appeals' && (
          <div className="space-y-6">
            {/* Active Strikes & Bans */}
            <div className="p-5 rounded-xl border border-white/10 bg-[#0F121C] space-y-4">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Sanctioned Customers & 30-Day Booking Bans
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {customers.map((c) => {
                  const isBanned = c.bannedUntil && new Date(c.bannedUntil).getTime() > Date.now();
                  return (
                    <div
                      key={c.id}
                      className={`p-3.5 rounded-xl border text-xs ${
                        isBanned
                          ? 'border-rose-500/40 bg-rose-500/10 text-rose-200'
                          : 'border-white/10 bg-white/5 text-slate-300'
                      }`}
                    >
                      <div className="font-bold text-white mb-1">{c.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{c.email}</div>
                      <div className="mt-2 text-[11px] font-mono flex justify-between items-center">
                        <span>Strikes: {c.strikes} / 2</span>
                        <span className={isBanned ? 'font-bold text-rose-400 uppercase' : 'text-slate-400'}>
                          {isBanned ? 'Banned' : 'Clear'}
                        </span>
                      </div>
                      {isBanned && (
                        <div className="text-[10px] text-rose-300 mt-1 font-mono">
                          Until {new Date(c.bannedUntil!).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pending Appeals Queue */}
            <div className="p-5 rounded-xl border border-white/10 bg-[#0F121C] space-y-4">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Appeals Queue (No-Show Penalties)
              </h3>
              {(() => {
                const appeals = bookings.filter((b) => b.appeal && !b.appeal.resolvedAt);
                if (appeals.length === 0) {
                  return (
                    <div className="text-xs text-slate-400 italic">
                      No pending customer appeals. Use customer flow or challenge to trigger a no-show appeal.
                    </div>
                  );
                }
                return (
                  <div className="space-y-3">
                    {appeals.map((b) => (
                      <div
                        key={b.id}
                        className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-xs space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white font-mono">Booking {b.id}</span>
                          <span className="text-[11px] text-amber-300 font-mono">
                            Submitted: {new Date(b.appeal!.submittedAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-slate-300 italic">
                          "{b.appeal!.reason}"
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
                          <input
                            type="text"
                            value={appealNotes}
                            onChange={(e) => setAppealNotes(e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded bg-[#08090C] border border-white/15 text-white text-xs font-mono"
                            placeholder="Resolution notes"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              id={`btn-forgive-appeal-${b.id}`}
                              onClick={() => handleResolveAppeal(b.id, 'forgiven')}
                              className="px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                            >
                              Forgive & Reverse Strike
                            </button>
                            <button
                              type="button"
                              onClick={() => handleResolveAppeal(b.id, 'upheld')}
                              className="px-3.5 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                            >
                              Uphold Penalty
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Tab 4: Simulated Dispatcher */}
        {activeTab === 'notifications' && (
          <div className="p-5 rounded-xl border border-white/10 bg-[#0F121C] space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Simulated WhatsApp & SMS Dispatcher (F-124)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              In accordance with F-093 and F-124, all client dispatch actions run through this simulated preview console without invoking outbound paid APIs.
            </p>
            <div className="space-y-2 pt-2">
              {bookings.map((b) => {
                const cust = customers.find((c) => c.id === b.customerId);
                const hall = halls.find((h) => h.id === b.hallId);
                return (
                  <div
                    key={b.id}
                    className="p-3 rounded-lg border border-white/5 bg-white/[0.02] flex items-center justify-between gap-4 text-xs font-mono"
                  >
                    <div>
                      <span className="text-amber-300 font-bold">{b.id}</span>
                      <span className="text-slate-400 ml-2">
                        {cust?.name} ({cust?.phone || '+234 800 000 0000'})
                      </span>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        Venue: {hall?.name.split(' (')[0]} • Status: {b.status}
                      </div>
                    </div>
                    <button
                      type="button"
                      id={`btn-send-whatsapp-${b.id}`}
                      onClick={() => handleSendWhatsappSimulation(b)}
                      className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shrink-0"
                    >
                      Dispatch Simulated WhatsApp
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dispatch notification toast */}
        {whatsappSentNotice && (
          <div
            role="status"
            className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-[#0E1B15] border border-emerald-500/40 text-emerald-200 text-xs shadow-2xl max-w-md animate-in fade-in"
          >
            {whatsappSentNotice}
          </div>
        )}
      </div>
    </DemoShell>
  );
}
