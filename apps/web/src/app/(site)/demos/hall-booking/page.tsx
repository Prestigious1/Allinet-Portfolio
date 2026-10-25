'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { DemoShell } from '@/components/demos/DemoShell';
import {
  useHallBookingStore,
  STORAGE_KEY,
} from '@/domains/hall-booking/store';
import {
  SlotType,
  calculatePrice,
  detectConflict,
  formatKoboToNgn,
  getSlotInterval,
  Booking,
} from '@/domains/hall-booking/engine';

export default function HallBookingDemoPage() {
  const {
    halls,
    addOns,
    promos,
    bookings,
    activeCustomer,
    resetSandbox,
    createBooking,
    confirmDeposit,
    challengeCompleted,
    challengeElapsedSeconds,
  } = useHallBookingStore();

  // Selected state
  const [selectedHallId, setSelectedHallId] = useState<string>(
    halls[0]?.id || 'hall-grand-ballroom'
  );
  // Default to a date in the upcoming month to avoid past-date checks
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-18');
  const [slotType, setSlotType] = useState<SlotType>('evening');
  const [guestCount, setGuestCount] = useState<number>(200);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedHall = useMemo(
    () => halls.find((h) => h.id === selectedHallId) || halls[0],
    [halls, selectedHallId]
  );

  const { startIso, endIso } = useMemo(() => {
    return getSlotInterval(selectedDate, slotType);
  }, [selectedDate, slotType]);

  // Selected add-on objects
  const activeAddOns = useMemo(
    () => addOns.filter((a) => selectedAddOnIds.includes(a.id)),
    [addOns, selectedAddOnIds]
  );

  // Active promo
  const activePromo = useMemo(() => {
    if (!appliedPromoCode) return undefined;
    return promos.find(
      (p) => p.code.toUpperCase() === appliedPromoCode.toUpperCase()
    );
  }, [promos, appliedPromoCode]);

  // Live Price Calculation
  const priceQuote = useMemo(() => {
    if (!selectedHall) return null;
    try {
      return calculatePrice({
        hall: selectedHall,
        startIso,
        endIso,
        addOns: activeAddOns,
        promo: activePromo,
        customer: activeCustomer,
      });
    } catch {
      return null;
    }
  }, [selectedHall, startIso, endIso, activeAddOns, activePromo, activeCustomer]);

  // Live Turnaround & Conflict Check
  const conflictStatus = useMemo(() => {
    if (!selectedHall) return { hasConflict: false };
    return detectConflict({
      hall: selectedHall,
      startIso,
      endIso,
      existingBookings: bookings,
    });
  }, [selectedHall, startIso, endIso, bookings]);

  const handleToggleAddOn = (id: string) => {
    setSelectedAddOnIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoCodeInput.trim().toUpperCase();
    const found = promos.find((p) => p.code.toUpperCase() === clean);
    if (found) {
      setAppliedPromoCode(clean);
      setErrorMessage(null);
    } else {
      setErrorMessage('Invalid promo code. Try "LAGOS2026" or "WEDDINGVIP15"');
    }
  };

  const handleReserve = () => {
    setErrorMessage(null);
    if (!selectedHall) return;

    if (guestCount > selectedHall.capacity) {
      setErrorMessage(
        `Guest count (${guestCount}) exceeds hall capacity (${selectedHall.capacity})`
      );
      return;
    }

    if (conflictStatus.hasConflict) {
      setErrorMessage(
        conflictStatus.reason || 'This slot conflicts with an existing reservation.'
      );
      return;
    }

    try {
      const bk = createBooking({
        hallId: selectedHall.id,
        startIso,
        endIso,
        guestCount,
        slotType,
        addOnIds: selectedAddOnIds,
        promoCode: appliedPromoCode || undefined,
      });
      setCreatedBooking(bk);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete reservation');
    }
  };

  const handleSimulatePayment = () => {
    if (!createdBooking) return;
    try {
      const updated = confirmDeposit(
        createdBooking.id,
        createdBooking.priceBreakdown.depositKobo
      );
      setCreatedBooking(updated);
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const tourSteps = [
    {
      title: 'Select Lagos Event Hall',
      description:
        'Choose between The Eko Grand Ballroom, Lekki Banquet Pavilion, or Ikoyi Executive Lounge.',
      tip: 'Notice each venue enforces turn-around buffers before and after events.',
    },
    {
      title: 'Pick Date & Slot',
      description:
        'Select Morning (08:00-13:00), Evening (14:00-20:00), or Full-Day (08:00-22:00).',
      tip: 'The conflict engine warns you immediately if turnaround setup collides with an existing booking.',
    },
    {
      title: 'Configure Add-Ons & Pricing',
      description:
        'Toggle LED walls, diesel generator guarantees, and apply promo codes (e.g., LAGOS2026).',
      tip: 'All pricing is calculated in integer kobo in en-NG currency standards.',
    },
    {
      title: 'Reserve & Test Operations Desk',
      description:
        'Complete the reservation to get a reference ID, then open the Operations Admin to manage the booking.',
      tip: 'Everything is synchronized live in this sandbox session.',
    },
  ];

  return (
    <DemoShell
      title="Lagos Event Hall Booking Engine"
      badge="SANDBOX PROOF DEMO"
      subtitle="Interactive client booking portal with live turnaround conflict detection & integer-kobo quoting"
      storageKey={STORAGE_KEY}
      onReset={resetSandbox}
      walkthroughSteps={tourSteps}
      challengeTitle="Operations Controller"
      challengeCompleted={challengeCompleted}
      challengeTimeSeconds={challengeElapsedSeconds}
      headerActions={
        <Link
          href="/demos/hall-booking/admin"
          id="link-admin-desk"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-colors"
        >
          <span>🛡️</span>
          <span>Operations Admin Desk</span>
        </Link>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Venue Selector & Event Configuration */}
        <div className="lg:col-span-7 space-y-6">
          {/* Hall Selection Cards */}
          <section aria-labelledby="venue-heading" className="space-y-3">
            <h2 id="venue-heading" className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono">
              1. Choose Lagos Venue Preset
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {halls.map((hall) => {
                const isSelected = hall.id === selectedHallId;
                return (
                  <button
                    key={hall.id}
                    type="button"
                    onClick={() => setSelectedHallId(hall.id)}
                    className={`text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/5 ring-1 ring-amber-400/40'
                        : 'border-white/10 bg-[#0F121C] hover:border-white/20 hover:bg-[#131724]'
                    }`}
                  >
                    <div className="text-xs font-bold text-white mb-1 line-clamp-1">
                      {hall.name}
                    </div>
                    <div className="text-[11px] text-amber-300 font-mono font-medium">
                      {formatKoboToNgn(hall.baseRateKobo)}/hr
                    </div>
                    <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
                      <span>Max {hall.capacity} guests</span>
                      <span>Min {hall.minHours}h</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Venue Amenities & Buffers Pill */}
          {selectedHall && (
            <div className="p-4 rounded-xl border border-white/10 bg-[#0F121C] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-white">Included Specifications:</span>
                <span className="text-[11px] font-mono text-slate-400">
                  Buffer: {selectedHall.bufferBeforeMin}m setup • {selectedHall.bufferAfterMin}m teardown
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedHall.amenities.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 border border-white/10 text-slate-300"
                  >
                    ✓ {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Date & Slot Picker */}
          <section aria-labelledby="schedule-heading" className="p-5 rounded-xl border border-white/10 bg-[#0F121C] space-y-4">
            <h2 id="schedule-heading" className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono">
              2. Date & Time Window
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="input-event-date" className="block text-xs font-medium text-slate-400 mb-1.5">
                  Event Date
                </label>
                <input
                  id="input-event-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#08090C] border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Slot Preset
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['morning', 'evening', 'full_day'] as SlotType[]).map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      id={`slot-btn-${slot}`}
                      onClick={() => setSlotType(slot)}
                      className={`py-1.5 px-2 rounded text-xs font-medium border text-center transition-all ${
                        slotType === slot
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                          : 'bg-[#08090C] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {slot === 'morning' && 'Morning (5h)'}
                      {slot === 'evening' && 'Evening (6h)'}
                      {slot === 'full_day' && 'Full Day (14h)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Availability Status */}
            <div className="pt-2">
              {conflictStatus.hasConflict ? (
                <div
                  id="conflict-warning-badge"
                  className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2"
                >
                  <span className="text-base">⚠️</span>
                  <div>
                    <span className="font-bold">Slot Unavailable: </span>
                    <span>{conflictStatus.reason}</span>
                  </div>
                </div>
              ) : (
                <div
                  id="conflict-available-badge"
                  className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2"
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Slot is available with all hall turnaround buffers satisfied.</span>
                </div>
              )}
            </div>
          </section>

          {/* Guest Count & Add-ons */}
          <section aria-labelledby="addons-heading" className="p-5 rounded-xl border border-white/10 bg-[#0F121C] space-y-4">
            <h2 id="addons-heading" className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono">
              3. Attendance & Event Add-ons
            </h2>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <label htmlFor="input-guest-count" className="font-medium text-slate-400">
                  Guest Count: <span className="text-white font-bold">{guestCount}</span>
                </label>
                <span className="text-slate-400 text-[11px]">
                  Capacity limit: {selectedHall?.capacity}
                </span>
              </div>
              <input
                id="input-guest-count"
                type="range"
                min="10"
                max={selectedHall?.capacity || 650}
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-medium text-slate-400 block">
                Select Power & Production Add-ons:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {addOns.map((addon) => {
                  const checked = selectedAddOnIds.includes(addon.id);
                  return (
                    <label
                      key={addon.id}
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                        checked
                          ? 'border-amber-400/50 bg-amber-500/10 text-white'
                          : 'border-white/10 bg-[#08090C] text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleAddOn(addon.id)}
                        className="mt-0.5 rounded accent-amber-400"
                      />
                      <div>
                        <div className="font-semibold text-white">{addon.name}</div>
                        <div className="text-[11px] text-amber-300 font-mono mt-0.5">
                          +{formatKoboToNgn(addon.priceKobo)}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Live Instant Quote & Reservation Ticket */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="p-6 rounded-2xl border border-white/15 bg-gradient-to-b from-[#131724] to-[#0A0D15] shadow-2xl space-y-6">
            <div className="border-b border-white/10 pb-4">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Guaranteed Integer Quote
              </span>
              <h3 className="text-lg font-bold text-white mt-2">
                {selectedHall?.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedDate} • {slotType.toUpperCase()} ({priceQuote?.durationHours} hrs)
              </p>
            </div>

            {/* Price Line Items */}
            {priceQuote && (
              <div className="space-y-2.5 text-xs text-slate-300 font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">
                    Base Hall ({priceQuote.durationHours}h × {formatKoboToNgn(priceQuote.baseRateKobo)})
                  </span>
                  <span>{formatKoboToNgn(priceQuote.hallSubtotalKobo)}</span>
                </div>

                {priceQuote.addOnsTotalKobo > 0 && (
                  <div className="flex justify-between items-center text-amber-300/90">
                    <span>Add-ons Total</span>
                    <span>+{formatKoboToNgn(priceQuote.addOnsTotalKobo)}</span>
                  </div>
                )}

                {priceQuote.discountKobo > 0 && (
                  <div className="flex justify-between items-center text-emerald-400">
                    <span>Discount ({priceQuote.discountReason})</span>
                    <span>-{formatKoboToNgn(priceQuote.discountKobo)}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-white/10 flex justify-between items-center text-sm font-bold text-white">
                  <span>Total Venue Cost</span>
                  <span className="text-amber-400">{formatKoboToNgn(priceQuote.totalKobo)}</span>
                </div>

                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-1 text-xs">
                  <div className="flex justify-between items-center text-amber-300 font-bold">
                    <span>Initial Deposit (30% to confirm):</span>
                    <span>{formatKoboToNgn(priceQuote.depositKobo)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span>Balance Due Pre-Event:</span>
                    <span>{formatKoboToNgn(priceQuote.balanceDueKobo)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="pt-2">
              <label htmlFor="input-promo-code" className="block text-[11px] font-mono text-slate-400 mb-1">
                Have a Promo Code? (e.g. LAGOS2026)
              </label>
              <div className="flex gap-2">
                <input
                  id="input-promo-code"
                  type="text"
                  placeholder="Enter code"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#08090C] border border-white/15 text-xs text-white uppercase font-mono focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  id="btn-apply-promo"
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
                >
                  Apply
                </button>
              </div>
            </form>

            {/* Error Notification */}
            {errorMessage && (
              <div
                role="alert"
                id="booking-error-banner"
                className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs"
              >
                {errorMessage}
              </div>
            )}

            {/* Action Button */}
            <button
              type="button"
              id="btn-reserve-venue"
              disabled={conflictStatus.hasConflict}
              onClick={handleReserve}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Lock Reservation & Generate Hold
            </button>
          </div>

          {/* Confirmed Reservation Card */}
          {createdBooking && (
            <div
              id="booking-confirmed-card"
              className="p-6 rounded-2xl border border-emerald-500/30 bg-[#0C1713] text-emerald-200 space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  Hold Active • {createdBooking.status.toUpperCase()}
                </span>
                <span className="text-xs text-emerald-400 font-mono">
                  Ref: {createdBooking.id}
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-white">
                  Reservation Ticket Generated!
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Your reservation is held. Under SPEC-05 conflict rules, this hold prevents overlaps while deposit is pending.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-black/40 border border-emerald-500/20 text-xs font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Required Deposit:</span>
                  <span className="font-bold text-white">
                    {formatKoboToNgn(createdBooking.priceBreakdown.depositKobo)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-amber-300">
                    {createdBooking.depositPaid ? 'Deposit Confirmed' : 'Awaiting Deposit'}
                  </span>
                </div>
              </div>

              {!createdBooking.depositPaid ? (
                <button
                  type="button"
                  id="btn-simulate-payment"
                  onClick={handleSimulatePayment}
                  className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wide transition-colors"
                >
                  💳 Simulate Instant Deposit Payment ({formatKoboToNgn(createdBooking.priceBreakdown.depositKobo)})
                </button>
              ) : (
                <div className="p-2.5 rounded bg-emerald-500/20 text-center text-xs font-bold text-emerald-300">
                  ✓ Booking Confirmed & Turnaround Buffers Locked!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DemoShell>
  );
}
