/**
 * Pure TypeScript Domain Engine for Laundry Operations Command Center
 * (F-130..F-155, D-03, SPEC-06) — Zero external runtime dependencies.
 */

// ---------------------------------------------------------------------------
// Types & Enums
// ---------------------------------------------------------------------------

export type OrderStatus =
  | 'draft'
  | 'pickup_scheduled'
  | 'picked_up'
  | 'received'
  | 'sorted'
  | 'in_progress'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'lost_damaged';

export type ItemStage =
  | 'received'
  | 'sorted'
  | 'washing'
  | 'drying'
  | 'ironing'
  | 'folding'
  | 'ready'
  | 'delivered';

export type ServiceType =
  | 'wash'
  | 'dry_cleaning'
  | 'ironing'
  | 'folding'
  | 'repairs'
  | 'wash_and_fold'
  | 'express_wash';

export type PricingMethod = 'per_kg' | 'per_piece' | 'fixed';

export type CustomerTier = 'standard' | 'bronze' | 'silver' | 'gold';

export type UserRole =
  | 'customer'
  | 'driver'
  | 'staff'
  | 'manager'
  | 'owner';

export type ClaimStatus =
  | 'open'
  | 'under_review'
  | 'resolved_compensation'
  | 'resolved_no_fault'
  | 'closed';

export type BranchId = string;

// ---------------------------------------------------------------------------
// Domain Data Models
// ---------------------------------------------------------------------------

export interface Branch {
  id: BranchId;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
}

export interface GarmentCategory {
  id: string;
  name: string; // e.g. "Shirt", "Suit", "Bedsheet"
  services: ServiceType[];
  defaultPricingMethod: PricingMethod;
  /** Price in kobo per kg or per piece; for fixed services price is total */
  priceKoboPerUnit: number;
}

export interface OrderItem {
  id: string;
  categoryId: string;
  description: string;
  quantity: number;           // pieces
  weightKg?: number;          // for per_kg pricing
  services: ServiceType[];
  stage: ItemStage;
  qrCode: string;             // generated ticket QR payload
  notes?: string;
  /** Kobo value agreed at intake */
  priceKobo: number;
  damaged?: boolean;
  lost?: boolean;
}

export interface PickupSlot {
  date: string;  // YYYY-MM-DD
  timeFrom: string; // HH:MM
  timeTo: string;   // HH:MM
}

export interface PromoCode {
  code: string;
  discountType: 'percentage' | 'fixed_kobo';
  discountValue: number;
  validFrom: string;  // ISO
  validUntil: string; // ISO
  maxUses?: number;
  usedCount: number;
  applicableServices?: ServiceType[]; // undefined = all
}

export interface LoyaltyReward {
  id: string;
  customerId: string;
  pointsBalance: number;
  /** 100 points = ₦100 (10,000 kobo) */
  redemptionRateKoboPerPoint: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: CustomerTier;
  branchId?: BranchId;
  loyaltyPoints: number;
  totalOrdersCompleted: number;
  bannedUntil?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  branchId: BranchId;
  isAvailable: boolean;
  activeOrderIds: string[];
}

export interface StaffMember {
  id: string;
  name: string;
  role: UserRole;
  branchId: BranchId;
  shift?: 'morning' | 'afternoon' | 'night';
}

export interface InventoryItem {
  id: string;
  name: string; // "Detergent 5L", "Plastic Bag", "Hanger"
  unit: string;
  quantityInStock: number;
  reorderThreshold: number;
  branchId: BranchId;
}

export interface DamageClaim {
  id: string;
  orderId: string;
  itemId: string;
  customerId: string;
  description: string;
  claimedValueKobo: number;
  status: ClaimStatus;
  compensationKobo?: number;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface Order {
  id: string;             // e.g. LND-1042
  customerId: string;
  branchId: BranchId;
  status: OrderStatus;
  items: OrderItem[];
  services: ServiceType[];
  pickupSlot?: PickupSlot;
  deliverySlot?: PickupSlot;
  driverId?: string;
  isExpress: boolean;
  promoCode?: string;
  loyaltyPointsRedeemed: number;
  /** Subtotal before discounts (kobo) */
  subtotalKobo: number;
  /** Express surcharge if any (kobo) */
  expressSurchargeKobo: number;
  /** Promo discount (kobo) */
  promoDiscountKobo: number;
  /** Loyalty discount (kobo) */
  loyaltyDiscountKobo: number;
  /** Final amount (kobo) */
  totalKobo: number;
  /** Amount paid (kobo) */
  paidKobo: number;
  /** Refunded (kobo) */
  refundedKobo: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  auditTrail: AuditEntry[];
  /** Notification log */
  notifications: NotificationEntry[];
  claims: DamageClaim[];
  subscriptionId?: string;
}

export interface AuditEntry {
  timestamp: string;
  action: string;
  performedBy: string;
  role: UserRole;
  details?: Record<string, unknown>;
}

export interface NotificationEntry {
  id: string;
  timestamp: string;
  channel: 'sms' | 'email' | 'push';
  message: string;
  delivered: boolean;
}

export interface RecurringSubscription {
  id: string;
  customerId: string;
  branchId: BranchId;
  services: ServiceType[];
  frequencyDays: number; // e.g. 7 = weekly
  nextPickupDate: string;
  isActive: boolean;
}

export interface PriceBreakdown {
  subtotalKobo: number;
  expressSurchargeKobo: number;
  promoDiscountKobo: number;
  loyaltyDiscountKobo: number;
  tierDiscountKobo: number;
  totalKobo: number;
  expressMultiplier: number;
  promoApplied: boolean;
  loyaltyPointsUsed: number;
}

export interface InventoryAlert {
  itemId: string;
  name: string;
  currentQty: number;
  threshold: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const EXPRESS_SURCHARGE_MULTIPLIER = 1.5;  // +50% for express
export const LOYALTY_KOBO_PER_POINT = 100;        // 100 kobo (₦1) per point
export const LOYALTY_EARN_RATE = 1;               // 1 point per ₦100 spent
export const KOBO_PER_NGN = 100;

/** Tier discount percentages */
export const TIER_DISCOUNT: Record<CustomerTier, number> = {
  standard: 0,
  bronze: 0.02,
  silver: 0.05,
  gold: 0.10,
};

/** Turnaround time in hours per service type (normal / express) */
export const TURNAROUND_HOURS: Record<ServiceType, { normal: number; express: number }> = {
  wash:          { normal: 24, express: 6 },
  dry_cleaning:  { normal: 48, express: 12 },
  ironing:       { normal: 24, express: 4 },
  folding:       { normal: 12, express: 2 },
  repairs:       { normal: 72, express: 24 },
  wash_and_fold: { normal: 24, express: 8 },
  express_wash:  { normal: 6,  express: 3 },
};

// ---------------------------------------------------------------------------
// Order ID Generator
// ---------------------------------------------------------------------------

let _orderCounter = 1000;

export function generateOrderId(branchCode = 'LND'): string {
  _orderCounter += 1;
  return `${branchCode}-${_orderCounter}`;
}

/** For test determinism */
export function resetOrderCounter(value = 1000): void {
  _orderCounter = value;
}

export function generateQrCode(orderId: string, itemId: string): string {
  return `QR:${orderId}:${itemId}`;
}

// ---------------------------------------------------------------------------
// Valid stage transitions (item-level)
// ---------------------------------------------------------------------------

const ITEM_STAGE_TRANSITIONS: Record<ItemStage, ItemStage[]> = {
  received:  ['sorted'],
  sorted:    ['washing', 'ironing', 'folding'],
  washing:   ['drying'],
  drying:    ['ironing', 'folding', 'ready'],
  ironing:   ['folding', 'ready'],
  folding:   ['ready'],
  ready:     ['delivered'],
  delivered: [],
};

// ---------------------------------------------------------------------------
// Valid order status transitions
// ---------------------------------------------------------------------------

const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft:               ['pickup_scheduled', 'cancelled'],
  pickup_scheduled:    ['picked_up', 'cancelled'],
  picked_up:           ['received', 'cancelled'],
  received:            ['sorted', 'lost_damaged', 'cancelled'],
  sorted:              ['in_progress', 'cancelled'],
  in_progress:         ['ready_for_pickup', 'lost_damaged'],
  ready_for_pickup:    ['out_for_delivery', 'delivered'],
  out_for_delivery:    ['delivered', 'lost_damaged'],
  delivered:           [],
  cancelled:           [],
  lost_damaged:        [],
};

// ---------------------------------------------------------------------------
// Price Calculator
// ---------------------------------------------------------------------------

export function calculateOrderPrice(
  items: Pick<OrderItem, 'priceKobo'>[],
  isExpress: boolean,
  promo: PromoCode | null,
  loyaltyPointsToRedeem: number,
  customer: Pick<Customer, 'tier'>,
): PriceBreakdown {
  const subtotalKobo = items.reduce((sum, item) => sum + item.priceKobo, 0);

  // Express surcharge applied to subtotal
  const expressMultiplier = isExpress ? EXPRESS_SURCHARGE_MULTIPLIER : 1;
  const expressSurchargeKobo = isExpress
    ? Math.round(subtotalKobo * (EXPRESS_SURCHARGE_MULTIPLIER - 1))
    : 0;

  const afterExpress = subtotalKobo + expressSurchargeKobo;

  // Tier discount on base subtotal (before express)
  const tierRate = TIER_DISCOUNT[customer.tier] ?? 0;
  const tierDiscountKobo = Math.round(afterExpress * tierRate);
  const afterTier = afterExpress - tierDiscountKobo;

  // Promo code discount
  let promoDiscountKobo = 0;
  let promoApplied = false;
  if (promo) {
    const now = new Date().toISOString();
    const valid = now >= promo.validFrom && now <= promo.validUntil;
    const notExhausted = promo.maxUses === undefined || promo.usedCount < promo.maxUses;
    if (valid && notExhausted) {
      if (promo.discountType === 'percentage') {
        promoDiscountKobo = Math.round(afterTier * (promo.discountValue / 100));
      } else {
        promoDiscountKobo = Math.min(promo.discountValue, afterTier);
      }
      promoApplied = true;
    }
  }
  const afterPromo = afterTier - promoDiscountKobo;

  // Loyalty redemption (100 kobo per point)
  const maxRedeemablePoints = Math.floor(afterPromo / LOYALTY_KOBO_PER_POINT);
  const pointsUsed = Math.min(loyaltyPointsToRedeem, maxRedeemablePoints);
  const loyaltyDiscountKobo = pointsUsed * LOYALTY_KOBO_PER_POINT;

  const totalKobo = Math.max(0, afterPromo - loyaltyDiscountKobo);

  return {
    subtotalKobo,
    expressSurchargeKobo,
    promoDiscountKobo,
    loyaltyDiscountKobo,
    tierDiscountKobo,
    totalKobo,
    expressMultiplier,
    promoApplied,
    loyaltyPointsUsed: pointsUsed,
  };
}

// ---------------------------------------------------------------------------
// Turnaround Estimator
// ---------------------------------------------------------------------------

export interface TurnaroundEstimate {
  earliestReadyAt: string;
  hours: number;
}

export function estimateTurnaround(
  services: ServiceType[],
  isExpress: boolean,
  fromDate: Date = new Date(),
): TurnaroundEstimate {
  const maxHours = services.reduce((max, svc) => {
    const t = TURNAROUND_HOURS[svc];
    if (!t) return max;
    return Math.max(max, isExpress ? t.express : t.normal);
  }, 0);

  const readyAt = new Date(fromDate.getTime() + maxHours * 3600 * 1000);
  return {
    earliestReadyAt: readyAt.toISOString(),
    hours: maxHours,
  };
}

// ---------------------------------------------------------------------------
// Item Stage Machine
// ---------------------------------------------------------------------------

export class ItemStageError extends Error {
  constructor(from: ItemStage, to: ItemStage) {
    super(`Illegal item stage transition: ${from} → ${to}`);
    this.name = 'ItemStageError';
  }
}

export function transitionItemStage(
  item: OrderItem,
  to: ItemStage,
  performedBy: string,
  role: UserRole,
): OrderItem {
  const allowed = ITEM_STAGE_TRANSITIONS[item.stage] ?? [];
  if (!allowed.includes(to)) {
    throw new ItemStageError(item.stage, to);
  }
  return { ...item, stage: to };
}

export function canTransitionItemStage(from: ItemStage, to: ItemStage): boolean {
  return (ITEM_STAGE_TRANSITIONS[from] ?? []).includes(to);
}

// ---------------------------------------------------------------------------
// Order Status Machine
// ---------------------------------------------------------------------------

export class OrderStatusError extends Error {
  constructor(from: OrderStatus, to: OrderStatus) {
    super(`Illegal order status transition: ${from} → ${to}`);
    this.name = 'OrderStatusError';
  }
}

export function canTransitionOrderStatus(from: OrderStatus, to: OrderStatus): boolean {
  return (ORDER_STATUS_TRANSITIONS[from] ?? []).includes(to);
}

// ---------------------------------------------------------------------------
// Loyalty Points Calculator
// ---------------------------------------------------------------------------

/**
 * Calculate how many points the customer earns for a completed order.
 * 1 point per ₦100 (10,000 kobo) spent.
 */
export function calculateLoyaltyEarned(totalKobo: number): number {
  return Math.floor(totalKobo / (100 * KOBO_PER_NGN));
}

// ---------------------------------------------------------------------------
// Inventory Alert Scanner
// ---------------------------------------------------------------------------

export function scanInventoryAlerts(inventory: InventoryItem[]): InventoryAlert[] {
  return inventory
    .filter((item) => item.quantityInStock <= item.reorderThreshold)
    .map((item) => ({
      itemId: item.id,
      name: item.name,
      currentQty: item.quantityInStock,
      threshold: item.reorderThreshold,
    }));
}

// ---------------------------------------------------------------------------
// Report Generator
// ---------------------------------------------------------------------------

export interface OperationsReport {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  lostDamagedOrders: number;
  revenueKobo: number;
  averageTurnaroundHours: number;
  topService: ServiceType | null;
  openClaims: number;
}

export function generateReport(orders: Order[]): OperationsReport {
  const completed = orders.filter((o) => o.status === 'delivered');
  const cancelled = orders.filter((o) => o.status === 'cancelled');
  const lostDamaged = orders.filter((o) => o.status === 'lost_damaged');

  const revenueKobo = completed.reduce((s, o) => s + o.totalKobo, 0);

  const turnaroundTimes = completed
    .filter((o) => o.completedAt && o.createdAt)
    .map((o) => {
      const ms = new Date(o.completedAt!).getTime() - new Date(o.createdAt).getTime();
      return ms / 3600000;
    });

  const averageTurnaroundHours =
    turnaroundTimes.length > 0
      ? turnaroundTimes.reduce((a, b) => a + b, 0) / turnaroundTimes.length
      : 0;

  // Count service frequency across all orders
  const serviceCount: Partial<Record<ServiceType, number>> = {};
  for (const order of orders) {
    for (const svc of order.services) {
      serviceCount[svc] = (serviceCount[svc] ?? 0) + 1;
    }
  }
  const topService = (Object.entries(serviceCount) as [ServiceType, number][]).reduce(
    (best, [svc, count]) => (count > (best[1] ?? 0) ? [svc, count] : best),
    [] as unknown as [ServiceType, number],
  )[0] ?? null;

  const openClaims = orders.flatMap((o) => o.claims).filter(
    (c) => c.status === 'open' || c.status === 'under_review',
  ).length;

  return {
    totalOrders: orders.length,
    completedOrders: completed.length,
    cancelledOrders: cancelled.length,
    lostDamagedOrders: lostDamaged.length,
    revenueKobo,
    averageTurnaroundHours: Math.round(averageTurnaroundHours * 10) / 10,
    topService,
    openClaims,
  };
}

// ---------------------------------------------------------------------------
// Priority Queue (Rush Orders)
// ---------------------------------------------------------------------------

export interface PriorityQueue<T extends { id: string; isExpress: boolean; createdAt: string }> {
  enqueue(item: T): void;
  dequeue(): T | undefined;
  peek(): T | undefined;
  size(): number;
  toArray(): T[];
}

export function createPriorityQueue<T extends { id: string; isExpress: boolean; createdAt: string }>(): PriorityQueue<T> {
  const heap: T[] = [];

  function priority(item: T): number {
    // Lower number = higher priority; express = 0, normal = 1
    return item.isExpress ? 0 : 1;
  }

  function swap(i: number, j: number): void {
    [heap[i], heap[j]] = [heap[j], heap[i]];
  }

  function siftUp(idx: number): void {
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      if (
        priority(heap[parent]) > priority(heap[idx]) ||
        (priority(heap[parent]) === priority(heap[idx]) &&
          heap[parent].createdAt > heap[idx].createdAt)
      ) {
        swap(parent, idx);
        idx = parent;
      } else break;
    }
  }

  function siftDown(idx: number): void {
    const n = heap.length;
    while (true) {
      let smallest = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;
      if (left < n && priority(heap[left]) < priority(heap[smallest])) smallest = left;
      if (right < n && priority(heap[right]) < priority(heap[smallest])) smallest = right;
      if (smallest !== idx) {
        swap(idx, smallest);
        idx = smallest;
      } else break;
    }
  }

  return {
    enqueue(item: T): void {
      heap.push(item);
      siftUp(heap.length - 1);
    },
    dequeue(): T | undefined {
      if (heap.length === 0) return undefined;
      const top = heap[0];
      const last = heap.pop()!;
      if (heap.length > 0) {
        heap[0] = last;
        siftDown(0);
      }
      return top;
    },
    peek(): T | undefined {
      return heap[0];
    },
    size(): number {
      return heap.length;
    },
    toArray(): T[] {
      return [...heap].sort((a, b) => {
        const pa = priority(a);
        const pb = priority(b);
        if (pa !== pb) return pa - pb;
        return a.createdAt < b.createdAt ? -1 : 1;
      });
    },
  };
}

// ---------------------------------------------------------------------------
// Main Engine Class
// ---------------------------------------------------------------------------

export class LaundryEngine {
  private orders: Map<string, Order> = new Map();
  private customers: Map<string, Customer> = new Map();
  private drivers: Map<string, Driver> = new Map();
  private inventory: Map<string, InventoryItem> = new Map();
  private branches: Map<BranchId, Branch> = new Map();
  private subscriptions: Map<string, RecurringSubscription> = new Map();
  private promoCodes: Map<string, PromoCode> = new Map();
  private readonly branchCode: string;

  constructor(branchCode = 'LND') {
    this.branchCode = branchCode;
  }

  // ------- Branch Management -------

  addBranch(branch: Branch): void {
    this.branches.set(branch.id, { ...branch });
  }

  getBranch(id: BranchId): Branch | undefined {
    return this.branches.get(id);
  }

  // ------- Customer Management -------

  registerCustomer(customer: Customer): void {
    this.customers.set(customer.id, { ...customer });
  }

  getCustomer(id: string): Customer | undefined {
    return this.customers.get(id);
  }

  updateCustomerTier(customerId: string): CustomerTier {
    const cust = this.customers.get(customerId);
    if (!cust) throw new Error(`Customer ${customerId} not found`);
    const completed = cust.totalOrdersCompleted;
    let tier: CustomerTier = 'standard';
    if (completed >= 20) tier = 'gold';
    else if (completed >= 10) tier = 'silver';
    else if (completed >= 5) tier = 'bronze';
    this.customers.set(customerId, { ...cust, tier });
    return tier;
  }

  // ------- Promo Codes -------

  addPromoCode(promo: PromoCode): void {
    this.promoCodes.set(promo.code.toUpperCase(), { ...promo });
  }

  getPromoCode(code: string): PromoCode | undefined {
    return this.promoCodes.get(code.toUpperCase());
  }

  // ------- Driver Management -------

  addDriver(driver: Driver): void {
    this.drivers.set(driver.id, { ...driver });
  }

  getDriver(id: string): Driver | undefined {
    return this.drivers.get(id);
  }

  assignDriver(orderId: string, driverId: string, performedBy: string, role: UserRole): Order {
    const order = this._getOrder(orderId);
    const driver = this.drivers.get(driverId);
    if (!driver) throw new Error(`Driver ${driverId} not found`);
    if (!driver.isAvailable) throw new Error(`Driver ${driverId} is not available`);

    const updated: Order = {
      ...order,
      driverId,
      updatedAt: new Date().toISOString(),
      auditTrail: [
        ...order.auditTrail,
        {
          timestamp: new Date().toISOString(),
          action: 'driver_assigned',
          performedBy,
          role,
          details: { driverId },
        },
      ],
    };
    this.orders.set(orderId, updated);

    // Update driver
    const updatedDriver: Driver = {
      ...driver,
      activeOrderIds: [...driver.activeOrderIds, orderId],
    };
    this.drivers.set(driverId, updatedDriver);

    return updated;
  }

  // ------- Inventory Management -------

  addInventoryItem(item: InventoryItem): void {
    this.inventory.set(item.id, { ...item });
  }

  updateInventoryStock(itemId: string, quantityDelta: number): InventoryItem {
    const item = this.inventory.get(itemId);
    if (!item) throw new Error(`Inventory item ${itemId} not found`);
    const updated = { ...item, quantityInStock: item.quantityInStock + quantityDelta };
    this.inventory.set(itemId, updated);
    return updated;
  }

  getInventoryAlerts(branchId?: BranchId): InventoryAlert[] {
    const items = [...this.inventory.values()].filter(
      (i) => !branchId || i.branchId === branchId,
    );
    return scanInventoryAlerts(items);
  }

  // ------- Subscription Management -------

  createSubscription(sub: RecurringSubscription): void {
    this.subscriptions.set(sub.id, { ...sub });
  }

  getSubscription(id: string): RecurringSubscription | undefined {
    return this.subscriptions.get(id);
  }

  /**
   * Advance recurring subscriptions: returns IDs of subscriptions
   * whose next pickup date is on or before `asOfDate`.
   */
  getDueSubscriptions(asOfDate: Date = new Date()): RecurringSubscription[] {
    const isoDate = asOfDate.toISOString().slice(0, 10);
    return [...this.subscriptions.values()].filter(
      (sub) => sub.isActive && sub.nextPickupDate <= isoDate,
    );
  }

  renewSubscription(subscriptionId: string): RecurringSubscription {
    const sub = this.subscriptions.get(subscriptionId);
    if (!sub) throw new Error(`Subscription ${subscriptionId} not found`);
    const next = new Date(sub.nextPickupDate);
    next.setDate(next.getDate() + sub.frequencyDays);
    const updated: RecurringSubscription = {
      ...sub,
      nextPickupDate: next.toISOString().slice(0, 10),
    };
    this.subscriptions.set(subscriptionId, updated);
    return updated;
  }

  // ------- Order Lifecycle -------

  /**
   * Create a new order. Calculates pricing automatically.
   */
  createOrder(params: {
    customerId: string;
    branchId: BranchId;
    items: Omit<OrderItem, 'id' | 'qrCode' | 'stage'>[];
    services: ServiceType[];
    pickupSlot?: PickupSlot;
    isExpress?: boolean;
    promoCode?: string;
    loyaltyPointsToRedeem?: number;
    notes?: string;
    subscriptionId?: string;
  }): Order {
    const customer = this.customers.get(params.customerId);
    if (!customer) throw new Error(`Customer ${params.customerId} not found`);
    if (customer.bannedUntil && new Date(customer.bannedUntil) > new Date()) {
      throw new Error(`Customer ${params.customerId} is suspended until ${customer.bannedUntil}`);
    }

    const orderId = generateOrderId(this.branchCode);
    const now = new Date().toISOString();

    const items: OrderItem[] = params.items.map((item, idx) => {
      const itemId = `${orderId}-item-${idx + 1}`;
      return {
        ...item,
        id: itemId,
        stage: 'received' as ItemStage,
        qrCode: generateQrCode(orderId, itemId),
      };
    });

    const promo = params.promoCode
      ? this.promoCodes.get(params.promoCode.toUpperCase()) ?? null
      : null;

    const breakdown = calculateOrderPrice(
      items,
      params.isExpress ?? false,
      promo,
      params.loyaltyPointsToRedeem ?? 0,
      customer,
    );

    const order: Order = {
      id: orderId,
      customerId: params.customerId,
      branchId: params.branchId,
      status: 'draft',
      items,
      services: params.services,
      pickupSlot: params.pickupSlot,
      isExpress: params.isExpress ?? false,
      promoCode: params.promoCode,
      loyaltyPointsRedeemed: breakdown.loyaltyPointsUsed,
      subtotalKobo: breakdown.subtotalKobo,
      expressSurchargeKobo: breakdown.expressSurchargeKobo,
      promoDiscountKobo: breakdown.promoDiscountKobo,
      loyaltyDiscountKobo: breakdown.loyaltyDiscountKobo,
      totalKobo: breakdown.totalKobo,
      paidKobo: 0,
      refundedKobo: 0,
      notes: params.notes,
      createdAt: now,
      updatedAt: now,
      auditTrail: [
        {
          timestamp: now,
          action: 'order_created',
          performedBy: params.customerId,
          role: 'customer',
          details: { isExpress: params.isExpress, promoCode: params.promoCode },
        },
      ],
      notifications: [],
      claims: [],
      subscriptionId: params.subscriptionId,
    };

    this.orders.set(orderId, order);
    return order;
  }

  /**
   * Transition order to a new status.
   */
  transitionOrder(
    orderId: string,
    to: OrderStatus,
    performedBy: string,
    role: UserRole,
    details?: Record<string, unknown>,
  ): Order {
    const order = this._getOrder(orderId);
    if (!canTransitionOrderStatus(order.status, to)) {
      throw new OrderStatusError(order.status, to);
    }

    const now = new Date().toISOString();
    const updated: Order = {
      ...order,
      status: to,
      updatedAt: now,
      completedAt: to === 'delivered' ? now : order.completedAt,
      auditTrail: [
        ...order.auditTrail,
        {
          timestamp: now,
          action: `status_transition:${order.status}->${to}`,
          performedBy,
          role,
          details,
        },
      ],
    };

    // Award loyalty points on delivery
    if (to === 'delivered') {
      const customer = this.customers.get(order.customerId);
      if (customer) {
        const earned = calculateLoyaltyEarned(order.totalKobo);
        this.customers.set(order.customerId, {
          ...customer,
          loyaltyPoints: customer.loyaltyPoints + earned,
          totalOrdersCompleted: customer.totalOrdersCompleted + 1,
        });
        this.updateCustomerTier(order.customerId);
      }
    }

    this.orders.set(orderId, updated);
    return updated;
  }

  /**
   * Advance a single item to the next stage.
   */
  advanceItemStage(
    orderId: string,
    itemId: string,
    to: ItemStage,
    performedBy: string,
    role: UserRole,
  ): Order {
    const order = this._getOrder(orderId);
    const itemIdx = order.items.findIndex((i) => i.id === itemId);
    if (itemIdx === -1) throw new Error(`Item ${itemId} not found in order ${orderId}`);

    const updatedItem = transitionItemStage(order.items[itemIdx], to, performedBy, role);
    const newItems = [...order.items];
    newItems[itemIdx] = updatedItem;

    // Auto-transition order to in_progress when first item enters washing/drying/ironing
    let newStatus = order.status;
    const activeStages: ItemStage[] = ['washing', 'drying', 'ironing', 'folding'];
    if (activeStages.includes(to) && canTransitionOrderStatus(order.status, 'in_progress')) {
      newStatus = 'in_progress';
    }
    // Auto-transition to ready_for_pickup when ALL items are ready/delivered
    const allReady = newItems.every((i) => i.stage === 'ready' || i.stage === 'delivered');
    if (allReady && canTransitionOrderStatus(newStatus, 'ready_for_pickup')) {
      newStatus = 'ready_for_pickup';
    }

    const now = new Date().toISOString();
    const updated: Order = {
      ...order,
      items: newItems,
      status: newStatus,
      updatedAt: now,
      auditTrail: [
        ...order.auditTrail,
        {
          timestamp: now,
          action: `item_stage:${itemId}:${order.items[itemIdx].stage}->${to}`,
          performedBy,
          role,
        },
      ],
    };
    this.orders.set(orderId, updated);
    return updated;
  }

  /**
   * Record payment
   */
  recordPayment(
    orderId: string,
    amountKobo: number,
    performedBy: string,
    role: UserRole,
  ): Order {
    const order = this._getOrder(orderId);
    const updated: Order = {
      ...order,
      paidKobo: order.paidKobo + amountKobo,
      updatedAt: new Date().toISOString(),
      auditTrail: [
        ...order.auditTrail,
        {
          timestamp: new Date().toISOString(),
          action: 'payment_recorded',
          performedBy,
          role,
          details: { amountKobo },
        },
      ],
    };
    this.orders.set(orderId, updated);
    return updated;
  }

  /**
   * Cancel order with optional refund
   */
  cancelOrder(
    orderId: string,
    reason: string,
    refundKobo: number,
    performedBy: string,
    role: UserRole,
  ): Order {
    const order = this._getOrder(orderId);
    if (!canTransitionOrderStatus(order.status, 'cancelled')) {
      throw new OrderStatusError(order.status, 'cancelled');
    }
    const now = new Date().toISOString();
    const updated: Order = {
      ...order,
      status: 'cancelled',
      refundedKobo: order.refundedKobo + refundKobo,
      updatedAt: now,
      auditTrail: [
        ...order.auditTrail,
        {
          timestamp: now,
          action: 'order_cancelled',
          performedBy,
          role,
          details: { reason, refundKobo },
        },
      ],
    };
    this.orders.set(orderId, updated);
    return updated;
  }

  /**
   * File a damage/loss claim
   */
  fileClaim(claim: DamageClaim, performedBy: string, role: UserRole): Order {
    const order = this._getOrder(claim.orderId);
    const now = new Date().toISOString();
    const updated: Order = {
      ...order,
      claims: [...order.claims, { ...claim }],
      updatedAt: now,
      auditTrail: [
        ...order.auditTrail,
        {
          timestamp: now,
          action: 'claim_filed',
          performedBy,
          role,
          details: { claimId: claim.id, itemId: claim.itemId },
        },
      ],
    };
    this.orders.set(claim.orderId, updated);
    return updated;
  }

  /**
   * Resolve a damage/loss claim
   */
  resolveClaim(
    orderId: string,
    claimId: string,
    resolution: ClaimStatus,
    compensationKobo: number,
    resolvedBy: string,
    role: UserRole,
  ): Order {
    const order = this._getOrder(orderId);
    const claimIdx = order.claims.findIndex((c) => c.id === claimId);
    if (claimIdx === -1) throw new Error(`Claim ${claimId} not found`);

    const now = new Date().toISOString();
    const updatedClaims = [...order.claims];
    updatedClaims[claimIdx] = {
      ...updatedClaims[claimIdx],
      status: resolution,
      compensationKobo,
      resolvedAt: now,
      resolvedBy,
    };

    const updated: Order = {
      ...order,
      claims: updatedClaims,
      refundedKobo: order.refundedKobo + compensationKobo,
      updatedAt: now,
      auditTrail: [
        ...order.auditTrail,
        {
          timestamp: now,
          action: `claim_resolved:${resolution}`,
          performedBy: resolvedBy,
          role,
          details: { claimId, compensationKobo },
        },
      ],
    };
    this.orders.set(orderId, updated);
    return updated;
  }

  /**
   * Add simulated notification to order
   */
  sendNotification(
    orderId: string,
    channel: NotificationEntry['channel'],
    message: string,
  ): Order {
    const order = this._getOrder(orderId);
    const notification: NotificationEntry = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      channel,
      message,
      delivered: true, // simulated
    };
    const updated: Order = {
      ...order,
      notifications: [...order.notifications, notification],
      updatedAt: new Date().toISOString(),
    };
    this.orders.set(orderId, updated);
    return updated;
  }

  // ------- Query Methods -------

  getOrder(id: string): Order | undefined {
    return this.orders.get(id);
  }

  getOrdersByCustomer(customerId: string): Order[] {
    return [...this.orders.values()].filter((o) => o.customerId === customerId);
  }

  getOrdersByStatus(status: OrderStatus): Order[] {
    return [...this.orders.values()].filter((o) => o.status === status);
  }

  getOrdersByBranch(branchId: BranchId): Order[] {
    return [...this.orders.values()].filter((o) => o.branchId === branchId);
  }

  getDelayedOrders(thresholdHours = 48): Order[] {
    const now = Date.now();
    const inFlightStatuses: OrderStatus[] = [
      'received', 'sorted', 'in_progress',
    ];
    return [...this.orders.values()].filter((o) => {
      if (!inFlightStatuses.includes(o.status)) return false;
      const ageMs = now - new Date(o.createdAt).getTime();
      return ageMs > thresholdHours * 3600 * 1000;
    });
  }

  generateReport(): OperationsReport {
    return generateReport([...this.orders.values()]);
  }

  // ------- Private Helpers -------

  private _getOrder(id: string): Order {
    const order = this.orders.get(id);
    if (!order) throw new Error(`Order ${id} not found`);
    return order;
  }
}
