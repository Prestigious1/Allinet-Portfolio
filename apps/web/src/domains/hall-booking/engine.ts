/**
 * Pure TypeScript Domain Engine for Hall & Event Booking (SPEC-05, F-100..F-110)
 * Zero external runtime dependencies.
 */

export type BookingStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'pending_deposit'
  | 'confirmed'
  | 'completed'
  | 'rejected'
  | 'cancelled'
  | 'no_show'
  | 'rescheduled';

export type UserRole =
  | 'visitor'
  | 'customer'
  | 'front_desk'
  | 'manager'
  | 'owner'
  | 'auditor';

export type SlotType = 'morning' | 'evening' | 'full_day' | 'custom';

export type CustomerTier = 'standard' | 'bronze' | 'silver' | 'gold';

export interface Hall {
  id: string;
  name: string;
  capacity: number;
  amenities: string[];
  baseRateKobo: number; // hourly rate in kobo (1 NGN = 100 kobo)
  minHours: number;
  bufferBeforeMin: number;
  bufferAfterMin: number;
  depositPct: number; // e.g. 0.3 for 30%
}

export interface AddOn {
  id: string;
  name: string;
  priceKobo: number;
}

export interface PromoCode {
  code: string;
  discountType: 'percentage' | 'fixed_kobo';
  discountValue: number; // percentage (e.g. 10 for 10%) or fixed kobo
  validFrom: string; // ISO string
  validUntil: string; // ISO string
  maxUses?: number;
  usedCount: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  tier: CustomerTier;
  strikes: number;
  bannedUntil?: string; // ISO string
}

export interface AuditEntry {
  timestamp: string;
  action: string;
  performedBy: string;
  role: UserRole;
  details?: Record<string, unknown>;
}

export interface PriceBreakdown {
  durationHours: number;
  baseRateKobo: number;
  rawHallSubtotalKobo: number;
  minHoursApplied: boolean;
  hallSubtotalKobo: number;
  addOnsTotalKobo: number;
  discountKobo: number;
  discountReason?: string;
  totalKobo: number;
  depositKobo: number;
  balanceDueKobo: number;
}

export interface Booking {
  id: string;
  hallId: string;
  customerId: string;
  start: string; // ISO UTC string
  end: string; // ISO UTC string
  slotType: SlotType;
  guestCount: number;
  status: BookingStatus;
  addOnIds: string[];
  promoCode?: string;
  priceBreakdown: PriceBreakdown;
  depositPaid: boolean;
  depositPaidKobo: number;
  refundedKobo: number;
  rescheduledToId?: string;
  rescheduledFromId?: string;
  pendingHoldExpiresAt?: string; // ISO string for 15-min unconfirmed holds
  history: AuditEntry[];
  cancellationReason?: string;
  appeal?: {
    reason: string;
    submittedAt: string;
    resolvedAt?: string;
    resolvedBy?: string;
    outcome?: 'upheld' | 'forgiven';
    notes?: string;
  };
}

export class BookingDomainError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'BookingDomainError';
  }
}

export class IllegalStateTransitionError extends BookingDomainError {
  constructor(from: BookingStatus, to: BookingStatus) {
    super(
      'ILLEGAL_STATE_TRANSITION',
      `Cannot transition booking state from "${from}" to "${to}"`
    );
    this.name = 'IllegalStateTransitionError';
  }
}

export class PermissionDeniedError extends BookingDomainError {
  constructor(role: UserRole, action: string) {
    super(
      'PERMISSION_DENIED',
      `Role "${role}" is not permitted to perform action "${action}"`
    );
    this.name = 'PermissionDeniedError';
  }
}

/**
 * Role Permission Matrix (SPEC-05)
 */
export const ROLE_PERMISSIONS: Record<UserRole, readonly string[]> = {
  visitor: ['view_halls', 'calculate_price', 'check_availability'],
  customer: [
    'view_halls',
    'calculate_price',
    'check_availability',
    'create_booking',
    'cancel_own_booking',
    'submit_appeal',
    'view_own_bookings',
  ],
  front_desk: [
    'view_halls',
    'calculate_price',
    'check_availability',
    'create_booking',
    'approve_booking',
    'confirm_payment',
    'cancel_booking',
    'mark_no_show',
    'view_bookings',
    'inspect_hall',
  ],
  manager: [
    'view_halls',
    'calculate_price',
    'check_availability',
    'create_booking',
    'approve_booking',
    'confirm_payment',
    'cancel_booking',
    'mark_no_show',
    'resolve_appeal',
    'inspect_hall',
    'view_bookings',
    'view_audit_log',
    'export_reports',
  ],
  owner: [
    'view_halls',
    'calculate_price',
    'check_availability',
    'create_booking',
    'approve_booking',
    'confirm_payment',
    'cancel_booking',
    'mark_no_show',
    'resolve_appeal',
    'inspect_hall',
    'view_bookings',
    'view_audit_log',
    'export_reports',
    'manage_halls',
  ],
  auditor: ['view_halls', 'view_bookings', 'view_audit_log', 'export_reports'],
};

export function hasPermission(role: UserRole, action: string): boolean {
  const allowed = ROLE_PERMISSIONS[role] ?? [];
  return allowed.includes(action);
}

export function assertPermission(role: UserRole, action: string): void {
  if (!hasPermission(role, action)) {
    throw new PermissionDeniedError(role, action);
  }
}

/**
 * Valid state transitions for bookings.
 */
const ALLOWED_TRANSITIONS: Record<BookingStatus, readonly BookingStatus[]> = {
  draft: ['pending_approval', 'pending_deposit', 'cancelled'],
  pending_approval: ['approved', 'rejected', 'cancelled'],
  approved: ['pending_deposit', 'confirmed', 'cancelled'],
  pending_deposit: ['confirmed', 'cancelled', 'rejected'],
  confirmed: ['completed', 'cancelled', 'no_show', 'rescheduled'],
  completed: [],
  rejected: [],
  cancelled: [],
  no_show: ['rescheduled'], // upon successful appeal
  rescheduled: [],
};

export function validateStateTransition(
  from: BookingStatus,
  to: BookingStatus
): void {
  const allowed = ALLOWED_TRANSITIONS[from] || [];
  if (!allowed.includes(to)) {
    throw new IllegalStateTransitionError(from, to);
  }
}

/**
 * Currency and pricing helpers (en-NG)
 */
export function formatKoboToNgn(kobo: number): string {
  const naira = Math.floor(kobo) / 100;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(naira);
}

export function calculateDurationHours(startIso: string, endIso: string): number {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (isNaN(start) || isNaN(end)) {
    throw new BookingDomainError('INVALID_DATES', 'Start or end date is invalid');
  }
  if (end <= start) {
    throw new BookingDomainError(
      'INVALID_INTERVAL',
      'End date/time must be strictly after start date/time'
    );
  }
  const diffMs = end - start;
  // Return hours as decimal rounded to 2 places
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
}

export function calculatePrice(params: {
  hall: Hall;
  startIso: string;
  endIso: string;
  addOns?: AddOn[];
  promo?: PromoCode;
  customer?: Customer;
  nowIso?: string;
}): PriceBreakdown {
  const { hall, startIso, endIso, addOns = [], promo, customer, nowIso } = params;

  const durationHours = calculateDurationHours(startIso, endIso);
  const billableHours = Math.max(durationHours, hall.minHours);
  const minHoursApplied = durationHours < hall.minHours;

  const rawHallSubtotalKobo = Math.round(durationHours * hall.baseRateKobo);
  const hallSubtotalKobo = Math.round(billableHours * hall.baseRateKobo);

  const addOnsTotalKobo = addOns.reduce((acc, curr) => acc + curr.priceKobo, 0);
  const subtotalBeforeDiscount = hallSubtotalKobo + addOnsTotalKobo;

  // Single discount rule: promo OR customer loyalty tier, no stacking
  let discountKobo = 0;
  let discountReason: string | undefined = undefined;

  const now = nowIso ? new Date(nowIso).getTime() : Date.now();

  if (promo) {
    const validFrom = new Date(promo.validFrom).getTime();
    const validUntil = new Date(promo.validUntil).getTime();
    const isExpired = now < validFrom || now > validUntil;
    const isUsageExceeded =
      promo.maxUses !== undefined && promo.usedCount >= promo.maxUses;

    if (!isExpired && !isUsageExceeded) {
      if (promo.discountType === 'percentage') {
        discountKobo = Math.round(
          subtotalBeforeDiscount * (promo.discountValue / 100)
        );
      } else {
        discountKobo = Math.min(promo.discountValue, subtotalBeforeDiscount);
      }
      discountReason = `Promo Code: ${promo.code}`;
    }
  } else if (customer && customer.tier !== 'standard') {
    // Customer tier discounts: bronze = 5%, silver = 10%, gold = 15%
    const tierRates: Record<CustomerTier, number> = {
      standard: 0,
      bronze: 0.05,
      silver: 0.1,
      gold: 0.15,
    };
    const rate = tierRates[customer.tier] || 0;
    if (rate > 0) {
      discountKobo = Math.round(subtotalBeforeDiscount * rate);
      discountReason = `Loyalty Tier: ${customer.tier.toUpperCase()}`;
    }
  }

  discountKobo = Math.min(discountKobo, subtotalBeforeDiscount);
  const totalKobo = Math.max(0, subtotalBeforeDiscount - discountKobo);

  const depositRate = hall.depositPct > 0 ? hall.depositPct : 0.3;
  const depositKobo = Math.round(totalKobo * depositRate);
  const balanceDueKobo = totalKobo - depositKobo;

  return {
    durationHours,
    baseRateKobo: hall.baseRateKobo,
    rawHallSubtotalKobo,
    minHoursApplied,
    hallSubtotalKobo,
    addOnsTotalKobo,
    discountKobo,
    discountReason,
    totalKobo,
    depositKobo,
    balanceDueKobo,
  };
}

/**
 * Buffer & Conflict rules (SPEC-05)
 * Effective interval = [start - bufferBeforeMin, end + bufferAfterMin), half-open
 */
export function getEffectiveInterval(
  startIso: string,
  endIso: string,
  bufferBeforeMin: number,
  bufferAfterMin: number
): { effectiveStartMs: number; effectiveEndMs: number } {
  const startMs = new Date(startIso).getTime();
  const endMs = new Date(endIso).getTime();
  const effectiveStartMs = startMs - bufferBeforeMin * 60 * 1000;
  const effectiveEndMs = endMs + bufferAfterMin * 60 * 1000;
  return { effectiveStartMs, effectiveEndMs };
}

export function isIntervalOverlapping(
  int1: { startMs: number; endMs: number },
  int2: { startMs: number; endMs: number }
): boolean {
  // Half-open interval [start, end)
  // int1.start < int2.end && int2.start < int1.end
  return int1.startMs < int2.endMs && int2.startMs < int1.endMs;
}

export function isBookingActiveConflict(
  booking: Booking,
  nowMs: number = Date.now()
): boolean {
  if (['rejected', 'cancelled', 'rescheduled'].includes(booking.status)) {
    return false;
  }
  // Check if pending hold expired (15-min unconfirmed holds)
  if (
    booking.status === 'pending_deposit' &&
    booking.pendingHoldExpiresAt &&
    new Date(booking.pendingHoldExpiresAt).getTime() <= nowMs
  ) {
    return false;
  }
  return [
    'pending_approval',
    'approved',
    'pending_deposit',
    'confirmed',
    'completed',
  ].includes(booking.status);
}

export function detectConflict(params: {
  hall: Hall;
  startIso: string;
  endIso: string;
  existingBookings: Booking[];
  excludeBookingId?: string;
  nowMs?: number;
}): { hasConflict: boolean; conflictingBooking?: Booking; reason?: string } {
  const {
    hall,
    startIso,
    endIso,
    existingBookings,
    excludeBookingId,
    nowMs = Date.now(),
  } = params;

  const candidateInt = getEffectiveInterval(
    startIso,
    endIso,
    hall.bufferBeforeMin,
    hall.bufferAfterMin
  );

  for (const b of existingBookings) {
    if (b.hallId !== hall.id) continue;
    if (excludeBookingId && b.id === excludeBookingId) continue;
    if (!isBookingActiveConflict(b, nowMs)) continue;

    const existingInt = getEffectiveInterval(
      b.start,
      b.end,
      hall.bufferBeforeMin,
      hall.bufferAfterMin
    );

    if (
      isIntervalOverlapping(
        { startMs: candidateInt.effectiveStartMs, endMs: candidateInt.effectiveEndMs },
        { startMs: existingInt.effectiveStartMs, endMs: existingInt.effectiveEndMs }
      )
    ) {
      return {
        hasConflict: true,
        conflictingBooking: b,
        reason: `Overlaps with booking ${b.id} (${b.status}) including hall turnaround buffers`,
      };
    }
  }

  return { hasConflict: false };
}

/**
 * Cancellation & Refund calculations (SPEC-05)
 * > 48h before event: 100% deposit refund
 * 24h - 48h before event: 50% deposit refund
 * < 24h before event: 0% refund
 */
export function calculateCancellationRefund(params: {
  booking: Booking;
  cancelledAtIso?: string;
}): { refundKobo: number; refundPercentage: number; hoursBeforeEvent: number } {
  const { booking, cancelledAtIso } = params;
  const nowMs = cancelledAtIso ? new Date(cancelledAtIso).getTime() : Date.now();
  const eventStartMs = new Date(booking.start).getTime();
  const diffHours = (eventStartMs - nowMs) / (1000 * 60 * 60);

  if (!booking.depositPaid || booking.depositPaidKobo <= 0) {
    return { refundKobo: 0, refundPercentage: 0, hoursBeforeEvent: diffHours };
  }

  let pct = 0;
  if (diffHours >= 48) {
    pct = 1.0;
  } else if (diffHours >= 24) {
    pct = 0.5;
  } else {
    pct = 0.0;
  }

  const refundKobo = Math.round(booking.depositPaidKobo * pct);
  return {
    refundKobo,
    refundPercentage: pct * 100,
    hoursBeforeEvent: Math.max(0, Math.round(diffHours * 10) / 10),
  };
}

/**
 * Slot presets for convenient booking
 */
export function getSlotInterval(
  dateIso: string,
  slot: SlotType
): { startIso: string; endIso: string } {
  const d = new Date(dateIso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const prefix = `${y}-${m}-${day}T`;

  switch (slot) {
    case 'morning':
      return {
        startIso: `${prefix}08:00:00.000Z`,
        endIso: `${prefix}13:00:00.000Z`,
      };
    case 'evening':
      return {
        startIso: `${prefix}14:00:00.000Z`,
        endIso: `${prefix}20:00:00.000Z`,
      };
    case 'full_day':
      return {
        startIso: `${prefix}08:00:00.000Z`,
        endIso: `${prefix}22:00:00.000Z`,
      };
    case 'custom':
    default:
      return {
        startIso: `${prefix}09:00:00.000Z`,
        endIso: `${prefix}17:00:00.000Z`,
      };
  }
}

/**
 * Pure Engine Command Handler
 */
export class HallBookingEngine {
  private halls: Map<string, Hall> = new Map();
  private bookings: Map<string, Booking> = new Map();
  private customers: Map<string, Customer> = new Map();
  private addOns: Map<string, AddOn> = new Map();
  private promos: Map<string, PromoCode> = new Map();

  constructor(initialData?: {
    halls?: Hall[];
    bookings?: Booking[];
    customers?: Customer[];
    addOns?: AddOn[];
    promos?: PromoCode[];
  }) {
    initialData?.halls?.forEach((h) => this.halls.set(h.id, h));
    initialData?.bookings?.forEach((b) => this.bookings.set(b.id, b));
    initialData?.customers?.forEach((c) => this.customers.set(c.id, c));
    initialData?.addOns?.forEach((a) => this.addOns.set(a.id, a));
    initialData?.promos?.forEach((p) => this.promos.set(p.code.toUpperCase(), p));
  }

  // --- Read Methods ---
  getHall(id: string): Hall | undefined {
    return this.halls.get(id);
  }

  listHalls(): Hall[] {
    return Array.from(this.halls.values());
  }

  getBooking(id: string): Booking | undefined {
    return this.bookings.get(id);
  }

  listBookings(filter?: { hallId?: string; customerId?: string }): Booking[] {
    let list = Array.from(this.bookings.values());
    if (filter?.hallId) {
      list = list.filter((b) => b.hallId === filter.hallId);
    }
    if (filter?.customerId) {
      list = list.filter((b) => b.customerId === filter.customerId);
    }
    return list;
  }

  getCustomer(id: string): Customer | undefined {
    return this.customers.get(id);
  }

  // --- Command Methods ---
  createBooking(params: {
    id: string;
    hallId: string;
    customerId: string;
    startIso: string;
    endIso: string;
    guestCount: number;
    slotType?: SlotType;
    addOnIds?: string[];
    promoCode?: string;
    role?: UserRole;
    nowIso?: string;
  }): Booking {
    const role = params.role || 'customer';
    assertPermission(role, 'create_booking');

    const hall = this.halls.get(params.hallId);
    if (!hall) {
      throw new BookingDomainError('HALL_NOT_FOUND', `Hall ${params.hallId} not found`);
    }

    if (params.guestCount > hall.capacity) {
      throw new BookingDomainError(
        'CAPACITY_EXCEEDED',
        `Guest count (${params.guestCount}) exceeds hall capacity (${hall.capacity})`
      );
    }

    const customer = this.customers.get(params.customerId);
    const nowMs = params.nowIso ? new Date(params.nowIso).getTime() : Date.now();

    if (customer?.bannedUntil && new Date(customer.bannedUntil).getTime() > nowMs) {
      throw new BookingDomainError(
        'CUSTOMER_BANNED',
        `Customer is banned from booking until ${customer.bannedUntil}`
      );
    }

    // Past date check
    const startMs = new Date(params.startIso).getTime();
    if (startMs <= nowMs) {
      throw new BookingDomainError(
        'PAST_DATE',
        'Cannot create a booking in the past'
      );
    }

    // Conflict check
    const conflict = detectConflict({
      hall,
      startIso: params.startIso,
      endIso: params.endIso,
      existingBookings: Array.from(this.bookings.values()),
      nowMs,
    });

    if (conflict.hasConflict) {
      throw new BookingDomainError(
        'BOOKING_CONFLICT',
        conflict.reason || 'Requested slot conflicts with an existing booking'
      );
    }

    // Resolve Add-ons and promo
    const selectedAddOns = (params.addOnIds || [])
      .map((aid) => this.addOns.get(aid))
      .filter((a): a is AddOn => Boolean(a));

    const promo = params.promoCode
      ? this.promos.get(params.promoCode.toUpperCase())
      : undefined;

    const price = calculatePrice({
      hall,
      startIso: params.startIso,
      endIso: params.endIso,
      addOns: selectedAddOns,
      promo,
      customer,
      nowIso: params.nowIso,
    });

    // 15-minute hold expiresAt
    const pendingHoldExpiresAt = new Date(nowMs + 15 * 60 * 1000).toISOString();

    const booking: Booking = {
      id: params.id,
      hallId: hall.id,
      customerId: params.customerId,
      start: params.startIso,
      end: params.endIso,
      slotType: params.slotType || 'custom',
      guestCount: params.guestCount,
      status: 'pending_deposit',
      addOnIds: params.addOnIds || [],
      promoCode: params.promoCode,
      priceBreakdown: price,
      depositPaid: false,
      depositPaidKobo: 0,
      refundedKobo: 0,
      pendingHoldExpiresAt,
      history: [
        {
          timestamp: new Date(nowMs).toISOString(),
          action: 'BOOKING_CREATED',
          performedBy: customer ? customer.name : params.customerId,
          role,
          details: { priceKobo: price.totalKobo },
        },
      ],
    };

    this.bookings.set(booking.id, booking);
    return booking;
  }

  confirmDeposit(params: {
    bookingId: string;
    amountPaidKobo: number;
    role?: UserRole;
    nowIso?: string;
  }): Booking {
    const role = params.role || 'front_desk';
    assertPermission(role, 'confirm_payment');

    const booking = this.bookings.get(params.bookingId);
    if (!booking) {
      throw new BookingDomainError('BOOKING_NOT_FOUND', 'Booking not found');
    }

    validateStateTransition(booking.status, 'confirmed');

    if (params.amountPaidKobo < booking.priceBreakdown.depositKobo) {
      throw new BookingDomainError(
        'INSUFFICIENT_DEPOSIT',
        `Paid amount (${params.amountPaidKobo}) is less than required deposit (${booking.priceBreakdown.depositKobo})`
      );
    }

    const nowMs = params.nowIso ? new Date(params.nowIso).getTime() : Date.now();
    booking.status = 'confirmed';
    booking.depositPaid = true;
    booking.depositPaidKobo = params.amountPaidKobo;
    booking.pendingHoldExpiresAt = undefined;

    booking.history.push({
      timestamp: new Date(nowMs).toISOString(),
      action: 'DEPOSIT_CONFIRMED',
      performedBy: role,
      role,
      details: { amountPaidKobo: params.amountPaidKobo },
    });

    return booking;
  }

  completeBooking(params: {
    bookingId: string;
    role?: UserRole;
    nowIso?: string;
  }): Booking {
    const role = params.role || 'front_desk';
    const booking = this.bookings.get(params.bookingId);
    if (!booking) {
      throw new BookingDomainError('BOOKING_NOT_FOUND', 'Booking not found');
    }

    validateStateTransition(booking.status, 'completed');

    const nowMs = params.nowIso ? new Date(params.nowIso).getTime() : Date.now();
    booking.status = 'completed';
    booking.history.push({
      timestamp: new Date(nowMs).toISOString(),
      action: 'BOOKING_COMPLETED',
      performedBy: role,
      role,
    });

    return booking;
  }

  cancelBooking(params: {
    bookingId: string;
    reason: string;
    role?: UserRole;
    nowIso?: string;
  }): { booking: Booking; refundKobo: number } {
    const role = params.role || 'customer';
    if (role === 'customer') {
      assertPermission(role, 'cancel_own_booking');
    } else {
      assertPermission(role, 'cancel_booking');
    }

    const booking = this.bookings.get(params.bookingId);
    if (!booking) {
      throw new BookingDomainError('BOOKING_NOT_FOUND', 'Booking not found');
    }

    validateStateTransition(booking.status, 'cancelled');

    const nowMs = params.nowIso ? new Date(params.nowIso).getTime() : Date.now();
    const refundInfo = calculateCancellationRefund({
      booking,
      cancelledAtIso: new Date(nowMs).toISOString(),
    });

    booking.status = 'cancelled';
    booking.cancellationReason = params.reason;
    booking.refundedKobo = refundInfo.refundKobo;

    booking.history.push({
      timestamp: new Date(nowMs).toISOString(),
      action: 'BOOKING_CANCELLED',
      performedBy: role,
      role,
      details: {
        reason: params.reason,
        refundKobo: refundInfo.refundKobo,
        refundPct: refundInfo.refundPercentage,
      },
    });

    return { booking, refundKobo: refundInfo.refundKobo };
  }

  markNoShow(params: {
    bookingId: string;
    role?: UserRole;
    nowIso?: string;
  }): Booking {
    const role = params.role || 'front_desk';
    assertPermission(role, 'mark_no_show');

    const booking = this.bookings.get(params.bookingId);
    if (!booking) {
      throw new BookingDomainError('BOOKING_NOT_FOUND', 'Booking not found');
    }

    validateStateTransition(booking.status, 'no_show');

    const nowMs = params.nowIso ? new Date(params.nowIso).getTime() : Date.now();
    booking.status = 'no_show';

    // Strike penalty on customer (2 strikes = 30-day ban)
    const customer = this.customers.get(booking.customerId);
    if (customer) {
      customer.strikes += 1;
      if (customer.strikes >= 2) {
        // 30 days ban
        const banExpiry = new Date(nowMs + 30 * 24 * 60 * 60 * 1000).toISOString();
        customer.bannedUntil = banExpiry;
      }
    }

    booking.history.push({
      timestamp: new Date(nowMs).toISOString(),
      action: 'NO_SHOW_RECORDED',
      performedBy: role,
      role,
      details: { customerStrikes: customer?.strikes },
    });

    return booking;
  }

  submitAppeal(params: {
    bookingId: string;
    reason: string;
    role?: UserRole;
    nowIso?: string;
  }): Booking {
    const role = params.role || 'customer';
    assertPermission(role, 'submit_appeal');

    const booking = this.bookings.get(params.bookingId);
    if (!booking) {
      throw new BookingDomainError('BOOKING_NOT_FOUND', 'Booking not found');
    }

    if (booking.status !== 'no_show') {
      throw new BookingDomainError(
        'INVALID_APPEAL',
        'Appeals can only be submitted for bookings marked as no_show'
      );
    }

    const nowMs = params.nowIso ? new Date(params.nowIso).getTime() : Date.now();
    booking.appeal = {
      reason: params.reason,
      submittedAt: new Date(nowMs).toISOString(),
    };

    booking.history.push({
      timestamp: new Date(nowMs).toISOString(),
      action: 'APPEAL_SUBMITTED',
      performedBy: role,
      role,
      details: { reason: params.reason },
    });

    return booking;
  }

  resolveAppeal(params: {
    bookingId: string;
    outcome: 'upheld' | 'forgiven';
    notes?: string;
    role?: UserRole;
    nowIso?: string;
  }): Booking {
    const role = params.role || 'manager';
    assertPermission(role, 'resolve_appeal');

    const booking = this.bookings.get(params.bookingId);
    if (!booking || !booking.appeal) {
      throw new BookingDomainError('APPEAL_NOT_FOUND', 'No active appeal found for this booking');
    }

    const nowMs = params.nowIso ? new Date(params.nowIso).getTime() : Date.now();
    booking.appeal.resolvedAt = new Date(nowMs).toISOString();
    booking.appeal.resolvedBy = role;
    booking.appeal.outcome = params.outcome;
    booking.appeal.notes = params.notes;

    if (params.outcome === 'forgiven') {
      const customer = this.customers.get(booking.customerId);
      if (customer) {
        customer.strikes = Math.max(0, customer.strikes - 1);
        if (customer.strikes < 2) {
          customer.bannedUntil = undefined;
        }
      }
      booking.refundedKobo = booking.depositPaidKobo;
    }

    booking.history.push({
      timestamp: new Date(nowMs).toISOString(),
      action: 'APPEAL_RESOLVED',
      performedBy: role,
      role,
      details: { outcome: params.outcome, notes: params.notes },
    });

    return booking;
  }
}
