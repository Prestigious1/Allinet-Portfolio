import { describe, it, expect, beforeEach } from 'vitest';
import {
  Hall,
  AddOn,
  Customer,
  PromoCode,
  HallBookingEngine,
  calculatePrice,
  detectConflict,
  getEffectiveInterval,
  isIntervalOverlapping,
  calculateCancellationRefund,
  formatKoboToNgn,
  validateStateTransition,
  hasPermission,
  assertPermission,
  BookingDomainError,
  IllegalStateTransitionError,
  PermissionDeniedError,
} from './engine';

describe('Hall Booking Engine (TASK-P7-01 / SPEC-05)', () => {
  const sampleHall: Hall = {
    id: 'hall-grand',
    name: 'Grand Ballroom',
    capacity: 500,
    amenities: ['Chandelier', 'Stage', 'Full AC', 'Sound System'],
    baseRateKobo: 100_000_00, // ₦100,000 / hr
    minHours: 4,
    bufferBeforeMin: 60, // 1 hr setup
    bufferAfterMin: 60, // 1 hr teardown
    depositPct: 0.3, // 30%
  };

  const sampleAddOnSound: AddOn = {
    id: 'addon-sound',
    name: 'Concert Grade Line Array',
    priceKobo: 50_000_00, // ₦50,000
  };

  const sampleAddOnLighting: AddOn = {
    id: 'addon-light',
    name: 'Intelligent Beam Lighting Rig',
    priceKobo: 30_000_00, // ₦30,000
  };

  const samplePromo10Pct: PromoCode = {
    code: 'LAGOSVIP10',
    discountType: 'percentage',
    discountValue: 10,
    validFrom: '2026-01-01T00:00:00.000Z',
    validUntil: '2026-12-31T23:59:59.000Z',
    maxUses: 100,
    usedCount: 5,
  };

  const samplePromoFixed: PromoCode = {
    code: 'FLAT50K',
    discountType: 'fixed_kobo',
    discountValue: 50_000_00,
    validFrom: '2026-01-01T00:00:00.000Z',
    validUntil: '2026-12-31T23:59:59.000Z',
    maxUses: 10,
    usedCount: 1,
  };

  const sampleCustomer: Customer = {
    id: 'cust-1',
    name: 'Babatunde Adeleke',
    email: 'babatunde@example.com',
    tier: 'standard',
    strikes: 0,
  };

  let engine: HallBookingEngine;

  beforeEach(() => {
    engine = new HallBookingEngine({
      halls: [sampleHall],
      customers: [sampleCustomer],
      addOns: [sampleAddOnSound, sampleAddOnLighting],
      promos: [samplePromo10Pct, samplePromoFixed],
    });
  });

  describe('Pricing and Currency Calculations', () => {
    it('formats kobo to Nigerian Naira (en-NG) correctly', () => {
      expect(formatKoboToNgn(100_000_00)).toMatch(/₦100,000/);
      expect(formatKoboToNgn(50_000_50)).toMatch(/₦50,000\.5/);
      expect(formatKoboToNgn(0)).toMatch(/₦0/);
    });

    it('enforces minimum billable hours when event duration is shorter', () => {
      // 2 hours event, but minHours is 4
      const price = calculatePrice({
        hall: sampleHall,
        startIso: '2026-11-01T10:00:00.000Z',
        endIso: '2026-11-01T12:00:00.000Z',
      });

      expect(price.durationHours).toBe(2);
      expect(price.minHoursApplied).toBe(true);
      // billable hours = 4, base rate = 100,000 kobo * 100
      expect(price.hallSubtotalKobo).toBe(400_000_00);
      expect(price.totalKobo).toBe(400_000_00);
      expect(price.depositKobo).toBe(120_000_00); // 30% of 400,000
      expect(price.balanceDueKobo).toBe(280_000_00);
    });

    it('calculates regular hours and add-ons without discounts', () => {
      // 5 hours
      const price = calculatePrice({
        hall: sampleHall,
        startIso: '2026-11-01T10:00:00.000Z',
        endIso: '2026-11-01T15:00:00.000Z',
        addOns: [sampleAddOnSound, sampleAddOnLighting],
      });

      expect(price.durationHours).toBe(5);
      expect(price.minHoursApplied).toBe(false);
      expect(price.hallSubtotalKobo).toBe(500_000_00);
      expect(price.addOnsTotalKobo).toBe(80_000_00);
      expect(price.totalKobo).toBe(580_000_00);
      expect(price.depositKobo).toBe(174_000_00); // 30%
      expect(price.balanceDueKobo).toBe(406_000_00);
    });

    it('applies percentage promo code accurately', () => {
      const price = calculatePrice({
        hall: sampleHall,
        startIso: '2026-11-01T10:00:00.000Z',
        endIso: '2026-11-01T15:00:00.000Z',
        promo: samplePromo10Pct,
        nowIso: '2026-06-01T12:00:00.000Z',
      });

      // 5 hrs = 500,000 kobo, 10% discount = 50,000 kobo
      expect(price.discountKobo).toBe(50_000_00);
      expect(price.totalKobo).toBe(450_000_00);
      expect(price.depositKobo).toBe(135_000_00);
    });

    it('applies customer loyalty tier discount when no promo is provided', () => {
      const goldCustomer: Customer = {
        ...sampleCustomer,
        id: 'cust-gold',
        tier: 'gold', // 15% discount
      };

      const price = calculatePrice({
        hall: sampleHall,
        startIso: '2026-11-01T10:00:00.000Z',
        endIso: '2026-11-01T14:00:00.000Z',
        customer: goldCustomer,
      });

      // 4 hrs = 400,000 kobo, 15% = 60,000 kobo
      expect(price.discountKobo).toBe(60_000_00);
      expect(price.totalKobo).toBe(340_000_00);
      expect(price.discountReason).toContain('GOLD');
    });

    it('does not stack promo and loyalty discounts (promo takes precedence)', () => {
      const goldCustomer: Customer = {
        ...sampleCustomer,
        id: 'cust-gold',
        tier: 'gold',
      };

      const price = calculatePrice({
        hall: sampleHall,
        startIso: '2026-11-01T10:00:00.000Z',
        endIso: '2026-11-01T14:00:00.000Z',
        customer: goldCustomer,
        promo: samplePromo10Pct, // 10% promo
        nowIso: '2026-06-01T12:00:00.000Z',
      });

      // Promo discount applied (10% = 40,000 kobo), not 15% + 10%
      expect(price.discountKobo).toBe(40_000_00);
      expect(price.discountReason).toContain('LAGOSVIP10');
    });

    it('throws error when start time is after or equal to end time', () => {
      expect(() => {
        calculatePrice({
          hall: sampleHall,
          startIso: '2026-11-01T15:00:00.000Z',
          endIso: '2026-11-01T10:00:00.000Z',
        });
      }).toThrow(BookingDomainError);
    });
  });

  describe('Conflict Detection and Turnaround Buffers', () => {
    it('calculates effective interval including turnaround buffers', () => {
      const { effectiveStartMs, effectiveEndMs } = getEffectiveInterval(
        '2026-11-01T10:00:00.000Z',
        '2026-11-01T14:00:00.000Z',
        60, // 60 min before
        60 // 60 min after
      );

      expect(new Date(effectiveStartMs).toISOString()).toBe(
        '2026-11-01T09:00:00.000Z'
      );
      expect(new Date(effectiveEndMs).toISOString()).toBe(
        '2026-11-01T15:00:00.000Z'
      );
    });

    it('detects half-open interval overlap correctly', () => {
      // [10, 14) and [12, 16) overlap
      expect(
        isIntervalOverlapping(
          { startMs: 10, endMs: 14 },
          { startMs: 12, endMs: 16 }
        )
      ).toBe(true);

      // Adjacent half-open intervals [10, 14) and [14, 18) do NOT overlap
      expect(
        isIntervalOverlapping(
          { startMs: 10, endMs: 14 },
          { startMs: 14, endMs: 18 }
        )
      ).toBe(false);
    });

    it('flags conflict when turnaround buffer encroaches on another event', () => {
      // Existing booking: 10:00 - 14:00 with 1 hr buffer before & after => effective [09:00, 15:00)
      const existingBooking = {
        id: 'book-1',
        hallId: sampleHall.id,
        customerId: 'cust-1',
        start: '2026-11-01T10:00:00.000Z',
        end: '2026-11-01T14:00:00.000Z',
        slotType: 'custom' as const,
        guestCount: 200,
        status: 'confirmed' as const,
        addOnIds: [],
        priceBreakdown: {} as any,
        depositPaid: true,
        depositPaidKobo: 1000,
        refundedKobo: 0,
        history: [],
      };

      // Candidate booking: 15:00 - 18:00 with 1 hr buffer before & after => effective [14:00, 19:00)
      // Since existing effective ends at 15:00 and candidate effective starts at 14:00, they collide!
      const conflict = detectConflict({
        hall: sampleHall,
        startIso: '2026-11-01T15:00:00.000Z',
        endIso: '2026-11-01T18:00:00.000Z',
        existingBookings: [existingBooking],
      });

      expect(conflict.hasConflict).toBe(true);
      expect(conflict.conflictingBooking?.id).toBe('book-1');
    });

    it('permits booking when turnaround buffers are fully respected', () => {
      const existingBooking = {
        id: 'book-1',
        hallId: sampleHall.id,
        customerId: 'cust-1',
        start: '2026-11-01T10:00:00.000Z',
        end: '2026-11-01T14:00:00.000Z',
        slotType: 'custom' as const,
        guestCount: 200,
        status: 'confirmed' as const,
        addOnIds: [],
        priceBreakdown: {} as any,
        depositPaid: true,
        depositPaidKobo: 1000,
        refundedKobo: 0,
        history: [],
      };

      // Candidate booking starts at 16:00:
      // Existing effective end: 14:00 + 1 hr buffer = 15:00
      // Candidate effective start: 16:00 - 1 hr buffer = 15:00
      // [09:00, 15:00) and [15:00, 21:00) are adjacent and do NOT overlap!
      const conflict = detectConflict({
        hall: sampleHall,
        startIso: '2026-11-01T16:00:00.000Z',
        endIso: '2026-11-01T20:00:00.000Z',
        existingBookings: [existingBooking],
      });

      expect(conflict.hasConflict).toBe(false);
    });

    it('ignores cancelled or expired pending holds during conflict detection', () => {
      const cancelledBooking = {
        id: 'book-cancelled',
        hallId: sampleHall.id,
        customerId: 'cust-1',
        start: '2026-11-01T10:00:00.000Z',
        end: '2026-11-01T14:00:00.000Z',
        slotType: 'custom' as const,
        guestCount: 200,
        status: 'cancelled' as const,
        addOnIds: [],
        priceBreakdown: {} as any,
        depositPaid: false,
        depositPaidKobo: 0,
        refundedKobo: 0,
        history: [],
      };

      const conflict = detectConflict({
        hall: sampleHall,
        startIso: '2026-11-01T10:00:00.000Z',
        endIso: '2026-11-01T14:00:00.000Z',
        existingBookings: [cancelledBooking],
      });

      expect(conflict.hasConflict).toBe(false);
    });
  });

  describe('Booking State Transitions & Illegal State Guards', () => {
    it('validates allowed state transitions', () => {
      expect(() => validateStateTransition('draft', 'pending_deposit')).not.toThrow();
      expect(() => validateStateTransition('pending_deposit', 'confirmed')).not.toThrow();
      expect(() => validateStateTransition('confirmed', 'completed')).not.toThrow();
      expect(() => validateStateTransition('confirmed', 'cancelled')).not.toThrow();
      expect(() => validateStateTransition('confirmed', 'no_show')).not.toThrow();
    });

    it('throws IllegalStateTransitionError on invalid transition jumps', () => {
      expect(() => validateStateTransition('draft', 'completed')).toThrow(
        IllegalStateTransitionError
      );
      expect(() => validateStateTransition('completed', 'draft')).toThrow(
        IllegalStateTransitionError
      );
      expect(() => validateStateTransition('cancelled', 'confirmed')).toThrow(
        IllegalStateTransitionError
      );
    });
  });

  describe('Cancellation and Tiered Refunds', () => {
    const baseBooking = {
      id: 'book-refund-test',
      hallId: 'hall-grand',
      customerId: 'cust-1',
      start: '2026-11-10T12:00:00.000Z',
      end: '2026-11-10T18:00:00.000Z',
      slotType: 'custom' as const,
      guestCount: 100,
      status: 'confirmed' as const,
      addOnIds: [],
      priceBreakdown: {} as any,
      depositPaid: true,
      depositPaidKobo: 100_000_00,
      refundedKobo: 0,
      history: [],
    };

    it('awards 100% deposit refund if cancelled more than 48 hours prior', () => {
      // 5 days prior
      const res = calculateCancellationRefund({
        booking: baseBooking,
        cancelledAtIso: '2026-11-05T12:00:00.000Z',
      });

      expect(res.refundPercentage).toBe(100);
      expect(res.refundKobo).toBe(100_000_00);
      expect(res.hoursBeforeEvent).toBe(120);
    });

    it('awards 50% deposit refund if cancelled between 24 and 48 hours prior', () => {
      // 36 hours prior
      const res = calculateCancellationRefund({
        booking: baseBooking,
        cancelledAtIso: '2026-11-09T00:00:00.000Z',
      });

      expect(res.refundPercentage).toBe(50);
      expect(res.refundKobo).toBe(50_000_00);
      expect(res.hoursBeforeEvent).toBe(36);
    });

    it('forfeits 100% of deposit (0% refund) if cancelled under 24 hours prior', () => {
      // 10 hours prior
      const res = calculateCancellationRefund({
        booking: baseBooking,
        cancelledAtIso: '2026-11-10T02:00:00.000Z',
      });

      expect(res.refundPercentage).toBe(0);
      expect(res.refundKobo).toBe(0);
      expect(res.hoursBeforeEvent).toBe(10);
    });
  });

  describe('Role-based Permission Matrix', () => {
    it('verifies permissions for all defined roles', () => {
      expect(hasPermission('visitor', 'view_halls')).toBe(true);
      expect(hasPermission('visitor', 'create_booking')).toBe(false);

      expect(hasPermission('customer', 'create_booking')).toBe(true);
      expect(hasPermission('customer', 'approve_booking')).toBe(false);

      expect(hasPermission('front_desk', 'confirm_payment')).toBe(true);
      expect(hasPermission('front_desk', 'resolve_appeal')).toBe(false);

      expect(hasPermission('manager', 'resolve_appeal')).toBe(true);
      expect(hasPermission('manager', 'export_reports')).toBe(true);

      expect(hasPermission('owner', 'manage_halls')).toBe(true);

      expect(hasPermission('auditor', 'view_audit_log')).toBe(true);
      expect(hasPermission('auditor', 'create_booking')).toBe(false);
    });

    it('assertPermission throws PermissionDeniedError when unauthorized', () => {
      expect(() => assertPermission('visitor', 'approve_booking')).toThrow(
        PermissionDeniedError
      );
    });
  });

  describe('Full End-to-End Engine Workflow', () => {
    const fixedNow = '2026-10-25T12:00:00.000Z';

    it('executes full booking lifecycle: create -> deposit -> complete', () => {
      const booking = engine.createBooking({
        id: 'bk-lifecycle-1',
        hallId: sampleHall.id,
        customerId: sampleCustomer.id,
        startIso: '2026-11-15T10:00:00.000Z',
        endIso: '2026-11-15T16:00:00.000Z', // 6 hours
        guestCount: 250,
        addOnIds: [sampleAddOnSound.id],
        role: 'customer',
        nowIso: fixedNow,
      });

      expect(booking.status).toBe('pending_deposit');
      expect(booking.depositPaid).toBe(false);
      expect(booking.history).toHaveLength(1);

      // Confirm deposit
      const confirmed = engine.confirmDeposit({
        bookingId: booking.id,
        amountPaidKobo: booking.priceBreakdown.depositKobo,
        role: 'front_desk',
        nowIso: fixedNow,
      });

      expect(confirmed.status).toBe('confirmed');
      expect(confirmed.depositPaid).toBe(true);

      // Complete booking
      const completed = engine.completeBooking({
        bookingId: booking.id,
        role: 'front_desk',
        nowIso: fixedNow,
      });

      expect(completed.status).toBe('completed');
      expect(completed.history).toHaveLength(3);
    });

    it('rejects booking when guest count exceeds capacity', () => {
      expect(() => {
        engine.createBooking({
          id: 'bk-overcapacity',
          hallId: sampleHall.id,
          customerId: sampleCustomer.id,
          startIso: '2026-11-15T10:00:00.000Z',
          endIso: '2026-11-15T16:00:00.000Z',
          guestCount: 1000, // capacity is 500
          role: 'customer',
          nowIso: fixedNow,
        });
      }).toThrow(/exceeds hall capacity/);
    });

    it('rejects booking in the past', () => {
      expect(() => {
        engine.createBooking({
          id: 'bk-past',
          hallId: sampleHall.id,
          customerId: sampleCustomer.id,
          startIso: '2026-10-20T10:00:00.000Z',
          endIso: '2026-10-20T16:00:00.000Z',
          guestCount: 100,
          role: 'customer',
          nowIso: fixedNow,
        });
      }).toThrow(/Cannot create a booking in the past/);
    });

    it('handles no-show, strikes, 30-day ban, and appeal forgive flow', () => {
      // 1. Create & confirm booking
      const booking = engine.createBooking({
        id: 'bk-noshow-1',
        hallId: sampleHall.id,
        customerId: sampleCustomer.id,
        startIso: '2026-11-20T10:00:00.000Z',
        endIso: '2026-11-20T14:00:00.000Z',
        guestCount: 100,
        role: 'customer',
        nowIso: fixedNow,
      });

      engine.confirmDeposit({
        bookingId: booking.id,
        amountPaidKobo: booking.priceBreakdown.depositKobo,
        role: 'front_desk',
        nowIso: fixedNow,
      });

      // Customer receives strike 1 on no-show
      engine.markNoShow({
        bookingId: booking.id,
        role: 'front_desk',
        nowIso: fixedNow,
      });

      const cust = engine.getCustomer(sampleCustomer.id)!;
      expect(cust.strikes).toBe(1);
      expect(cust.bannedUntil).toBeUndefined();

      // Trigger second no-show on another booking to test 30-day ban
      const booking2 = engine.createBooking({
        id: 'bk-noshow-2',
        hallId: sampleHall.id,
        customerId: sampleCustomer.id,
        startIso: '2026-11-25T10:00:00.000Z',
        endIso: '2026-11-25T14:00:00.000Z',
        guestCount: 100,
        role: 'customer',
        nowIso: fixedNow,
      });

      engine.confirmDeposit({
        bookingId: booking2.id,
        amountPaidKobo: booking2.priceBreakdown.depositKobo,
        role: 'front_desk',
        nowIso: fixedNow,
      });

      engine.markNoShow({
        bookingId: booking2.id,
        role: 'front_desk',
        nowIso: fixedNow,
      });

      expect(cust.strikes).toBe(2);
      expect(cust.bannedUntil).toBeDefined();

      // Attempting to book while banned fails
      expect(() => {
        engine.createBooking({
          id: 'bk-while-banned',
          hallId: sampleHall.id,
          customerId: sampleCustomer.id,
          startIso: '2026-11-28T10:00:00.000Z',
          endIso: '2026-11-28T14:00:00.000Z',
          guestCount: 50,
          role: 'customer',
          nowIso: fixedNow,
        });
      }).toThrow(/banned from booking/);

      // Customer submits appeal
      engine.submitAppeal({
        bookingId: booking2.id,
        reason: 'Severe Lagos rainstorm and flooding blocked access road',
        role: 'customer',
        nowIso: fixedNow,
      });

      // Manager forgives appeal: strike removed, ban lifted, deposit refunded
      engine.resolveAppeal({
        bookingId: booking2.id,
        outcome: 'forgiven',
        notes: 'Verified flood warning on Lekki-Epe expressway',
        role: 'manager',
        nowIso: fixedNow,
      });

      expect(cust.strikes).toBe(1);
      expect(cust.bannedUntil).toBeUndefined();
      expect(booking2.refundedKobo).toBe(booking2.depositPaidKobo);
    });
  });

  describe('Lagos Seed Fixtures Integration (TASK-P7-02)', () => {
    it('initializes engine successfully with realistic Lagos venue presets and seed bookings', async () => {
      const { getLagosInitialState, LAGOS_VENUE_PRESETS, LAGOS_CUSTOMERS } = await import('./fixtures');
      const seedState = getLagosInitialState('2026-11-01T00:00:00.000Z');

      const lagosEngine = new HallBookingEngine(seedState);

      expect(lagosEngine.listHalls()).toHaveLength(LAGOS_VENUE_PRESETS.length);
      expect(lagosEngine.listBookings().length).toBeGreaterThanOrEqual(3);

      const grandBallroom = lagosEngine.getHall('hall-grand-ballroom');
      expect(grandBallroom).toBeDefined();
      expect(grandBallroom?.capacity).toBe(650);
      expect(grandBallroom?.baseRateKobo).toBe(150_000_00);

      const customerFolake = lagosEngine.getCustomer(LAGOS_CUSTOMERS[0].id);
      expect(customerFolake).toBeDefined();
      expect(customerFolake?.tier).toBe('gold');

      // Check conflict detection against pre-seeded bookings
      const conflict = detectConflict({
        hall: grandBallroom!,
        startIso: '2026-11-12T09:00:00.000Z',
        endIso: '2026-11-12T15:00:00.000Z',
        existingBookings: lagosEngine.listBookings(),
      });
      expect(conflict.hasConflict).toBe(true);
      expect(conflict.conflictingBooking?.id).toBe('bk-eko-tech-summit');
    });
  });
});
