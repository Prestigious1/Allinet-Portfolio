import { describe, it, expect, beforeEach } from 'vitest';
import {
  // Types
  OrderStatus,
  ItemStage,
  ServiceType,
  CustomerTier,
  // Domain models
  Order,
  OrderItem,
  Customer,
  PromoCode,
  Branch,
  Driver,
  InventoryItem,
  GarmentCategory,
  DamageClaim,
  // Functions
  generateOrderId,
  resetOrderCounter,
  generateQrCode,
  calculateOrderPrice,
  estimateTurnaround,
  transitionItemStage,
  canTransitionItemStage,
  canTransitionOrderStatus,
  calculateLoyaltyEarned,
  scanInventoryAlerts,
  generateReport,
  createPriorityQueue,
  // Engine
  LaundryEngine,
  // Errors
  ItemStageError,
  OrderStatusError,
  // Constants
  EXPRESS_SURCHARGE_MULTIPLIER,
  LOYALTY_KOBO_PER_POINT,
  TIER_DISCOUNT,
  TURNAROUND_HOURS,
} from './engine';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCustomer(overrides: Partial<Customer> = {}): Customer {
  return {
    id: 'cust-001',
    name: 'Folake Okafor',
    email: 'folake@example.com',
    phone: '+2348012345678',
    tier: 'standard',
    loyaltyPoints: 0,
    totalOrdersCompleted: 0,
    ...overrides,
  };
}

function makeItem(overrides: Partial<OrderItem> = {}): OrderItem {
  return {
    id: 'item-001',
    categoryId: 'shirt',
    description: 'White office shirt',
    quantity: 3,
    services: ['wash'],
    stage: 'received',
    qrCode: 'QR:LND-1001:item-001',
    priceKobo: 150_000, // ₦1,500
    ...overrides,
  };
}

function makeBranch(overrides: Partial<Branch> = {}): Branch {
  return {
    id: 'branch-vi',
    name: 'Victoria Island Branch',
    address: '10 Ahmadu Bello Way, Lagos',
    phone: '+2341234567',
    isActive: true,
    ...overrides,
  };
}

function makePromo(overrides: Partial<PromoCode> = {}): PromoCode {
  const now = new Date();
  const past = new Date(now.getTime() - 86400_000).toISOString();
  const future = new Date(now.getTime() + 86400_000).toISOString();
  return {
    code: 'SAVE10',
    discountType: 'percentage',
    discountValue: 10,
    validFrom: past,
    validUntil: future,
    usedCount: 0,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// 1. Order ID & QR Generation
// ---------------------------------------------------------------------------

describe('Order ID & QR Generation', () => {
  beforeEach(() => resetOrderCounter(1000));

  it('generates sequential IDs with branch prefix', () => {
    const id1 = generateOrderId('LND');
    const id2 = generateOrderId('LND');
    expect(id1).toBe('LND-1001');
    expect(id2).toBe('LND-1002');
  });

  it('uses different branch codes', () => {
    const id = generateOrderId('ABJ');
    expect(id.startsWith('ABJ-')).toBe(true);
  });

  it('generates QR code payload', () => {
    const qr = generateQrCode('LND-1001', 'item-001');
    expect(qr).toBe('QR:LND-1001:item-001');
  });

  it('resetOrderCounter resets sequence', () => {
    generateOrderId();
    generateOrderId();
    resetOrderCounter(2000);
    expect(generateOrderId()).toBe('LND-2001');
  });
});

// ---------------------------------------------------------------------------
// 2. Price Calculator
// ---------------------------------------------------------------------------

describe('calculateOrderPrice', () => {
  const stdCustomer: Pick<Customer, 'tier'> = { tier: 'standard' };
  const goldCustomer: Pick<Customer, 'tier'> = { tier: 'gold' };

  it('calculates subtotal from items', () => {
    const items = [{ priceKobo: 100_000 }, { priceKobo: 200_000 }];
    const result = calculateOrderPrice(items, false, null, 0, stdCustomer);
    expect(result.subtotalKobo).toBe(300_000);
    expect(result.expressSurchargeKobo).toBe(0);
    expect(result.totalKobo).toBe(300_000);
  });

  it('applies 50% express surcharge', () => {
    const items = [{ priceKobo: 200_000 }];
    const result = calculateOrderPrice(items, true, null, 0, stdCustomer);
    expect(result.expressSurchargeKobo).toBe(100_000); // 50% of 200_000
    expect(result.totalKobo).toBe(300_000);
  });

  it('applies percentage promo code', () => {
    const items = [{ priceKobo: 100_000 }];
    const promo = makePromo({ discountType: 'percentage', discountValue: 10 });
    const result = calculateOrderPrice(items, false, promo, 0, stdCustomer);
    expect(result.promoDiscountKobo).toBe(10_000);
    expect(result.promoApplied).toBe(true);
    expect(result.totalKobo).toBe(90_000);
  });

  it('applies fixed kobo promo code', () => {
    const items = [{ priceKobo: 100_000 }];
    const promo = makePromo({ discountType: 'fixed_kobo', discountValue: 20_000 });
    const result = calculateOrderPrice(items, false, promo, 0, stdCustomer);
    expect(result.promoDiscountKobo).toBe(20_000);
    expect(result.totalKobo).toBe(80_000);
  });

  it('does not apply expired promo', () => {
    const items = [{ priceKobo: 100_000 }];
    const pastDate = new Date(Date.now() - 2 * 86400_000).toISOString();
    const promo = makePromo({ validUntil: pastDate });
    const result = calculateOrderPrice(items, false, promo, 0, stdCustomer);
    expect(result.promoApplied).toBe(false);
    expect(result.promoDiscountKobo).toBe(0);
  });

  it('does not apply exhausted promo', () => {
    const items = [{ priceKobo: 100_000 }];
    const promo = makePromo({ maxUses: 3, usedCount: 3 });
    const result = calculateOrderPrice(items, false, promo, 0, stdCustomer);
    expect(result.promoApplied).toBe(false);
  });

  it('caps fixed promo at total', () => {
    const items = [{ priceKobo: 50_000 }];
    const promo = makePromo({ discountType: 'fixed_kobo', discountValue: 200_000 });
    const result = calculateOrderPrice(items, false, promo, 0, stdCustomer);
    expect(result.promoDiscountKobo).toBe(50_000);
    expect(result.totalKobo).toBe(0);
  });

  it('applies gold tier 10% discount', () => {
    const items = [{ priceKobo: 100_000 }];
    const result = calculateOrderPrice(items, false, null, 0, goldCustomer);
    expect(result.tierDiscountKobo).toBe(10_000);
    expect(result.totalKobo).toBe(90_000);
  });

  it('applies loyalty points redemption', () => {
    const items = [{ priceKobo: 100_000 }];
    const result = calculateOrderPrice(items, false, null, 50, stdCustomer);
    // 50 points * 100 kobo = 5,000 kobo discount
    expect(result.loyaltyPointsUsed).toBe(50);
    expect(result.loyaltyDiscountKobo).toBe(5_000);
    expect(result.totalKobo).toBe(95_000);
  });

  it('caps loyalty redemption to total amount', () => {
    const items = [{ priceKobo: 10_000 }]; // ₦100
    const result = calculateOrderPrice(items, false, null, 1000, stdCustomer);
    // Can only redeem 100 points (100 * 100 = 10,000 kobo)
    expect(result.totalKobo).toBe(0);
    expect(result.loyaltyPointsUsed).toBeLessThanOrEqual(100);
  });

  it('stacks express + tier + promo correctly', () => {
    const items = [{ priceKobo: 200_000 }];
    const promo = makePromo({ discountType: 'percentage', discountValue: 5 });
    const result = calculateOrderPrice(items, true, promo, 0, goldCustomer);
    // subtotal: 200_000
    // express: +100_000 = 300_000
    // tier: -10% of 300_000 = -30_000 => 270_000
    // promo: -5% of 270_000 = -13_500 => 256_500
    expect(result.subtotalKobo).toBe(200_000);
    expect(result.expressSurchargeKobo).toBe(100_000);
    expect(result.tierDiscountKobo).toBe(30_000);
    expect(result.promoDiscountKobo).toBe(13_500);
    expect(result.totalKobo).toBe(256_500);
  });
});

// ---------------------------------------------------------------------------
// 3. Turnaround Estimator
// ---------------------------------------------------------------------------

describe('estimateTurnaround', () => {
  const baseDate = new Date('2026-01-01T08:00:00Z');

  it('estimates normal wash turnaround (24h)', () => {
    const result = estimateTurnaround(['wash'], false, baseDate);
    expect(result.hours).toBe(24);
    expect(result.earliestReadyAt).toBe(new Date('2026-01-02T08:00:00Z').toISOString());
  });

  it('estimates express wash turnaround (6h)', () => {
    const result = estimateTurnaround(['wash'], true, baseDate);
    expect(result.hours).toBe(6);
  });

  it('picks maximum hours across multiple services', () => {
    const result = estimateTurnaround(['wash', 'dry_cleaning', 'ironing'], false, baseDate);
    // dry_cleaning = 48h (longest)
    expect(result.hours).toBe(48);
  });

  it('handles express dry cleaning (12h)', () => {
    const result = estimateTurnaround(['dry_cleaning'], true, baseDate);
    expect(result.hours).toBe(12);
  });

  it('handles empty services list (0h)', () => {
    const result = estimateTurnaround([], false, baseDate);
    expect(result.hours).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 4. Item Stage Machine
// ---------------------------------------------------------------------------

describe('Item Stage Transitions', () => {
  it('allows valid received → sorted', () => {
    expect(canTransitionItemStage('received', 'sorted')).toBe(true);
  });

  it('allows sorted → washing', () => {
    expect(canTransitionItemStage('sorted', 'washing')).toBe(true);
  });

  it('allows washing → drying', () => {
    expect(canTransitionItemStage('washing', 'drying')).toBe(true);
  });

  it('allows drying → ironing', () => {
    expect(canTransitionItemStage('drying', 'ironing')).toBe(true);
  });

  it('allows drying → folding (skip ironing)', () => {
    expect(canTransitionItemStage('drying', 'folding')).toBe(true);
  });

  it('allows ironing → ready', () => {
    expect(canTransitionItemStage('ironing', 'ready')).toBe(true);
  });

  it('allows ready → delivered', () => {
    expect(canTransitionItemStage('ready', 'delivered')).toBe(true);
  });

  it('rejects backwards transition delivered → ready', () => {
    expect(canTransitionItemStage('delivered', 'ready')).toBe(false);
  });

  it('rejects skip from received → washing directly', () => {
    expect(canTransitionItemStage('received', 'washing')).toBe(false);
  });

  it('throws ItemStageError on illegal transition', () => {
    const item = makeItem({ stage: 'delivered' });
    expect(() => transitionItemStage(item, 'ready', 'staff-01', 'staff')).toThrow(ItemStageError);
  });

  it('returns updated item with new stage', () => {
    const item = makeItem({ stage: 'received' });
    const updated = transitionItemStage(item, 'sorted', 'staff-01', 'staff');
    expect(updated.stage).toBe('sorted');
    expect(updated.id).toBe(item.id); // other fields preserved
  });
});

// ---------------------------------------------------------------------------
// 5. Order Status Machine
// ---------------------------------------------------------------------------

describe('Order Status Transitions', () => {
  it('allows draft → pickup_scheduled', () => {
    expect(canTransitionOrderStatus('draft', 'pickup_scheduled')).toBe(true);
  });

  it('allows pickup_scheduled → picked_up', () => {
    expect(canTransitionOrderStatus('pickup_scheduled', 'picked_up')).toBe(true);
  });

  it('allows picked_up → received', () => {
    expect(canTransitionOrderStatus('picked_up', 'received')).toBe(true);
  });

  it('allows received → sorted', () => {
    expect(canTransitionOrderStatus('received', 'sorted')).toBe(true);
  });

  it('allows sorted → in_progress', () => {
    expect(canTransitionOrderStatus('sorted', 'in_progress')).toBe(true);
  });

  it('allows in_progress → ready_for_pickup', () => {
    expect(canTransitionOrderStatus('in_progress', 'ready_for_pickup')).toBe(true);
  });

  it('allows ready_for_pickup → out_for_delivery', () => {
    expect(canTransitionOrderStatus('ready_for_pickup', 'out_for_delivery')).toBe(true);
  });

  it('allows ready_for_pickup → delivered (direct pickup)', () => {
    expect(canTransitionOrderStatus('ready_for_pickup', 'delivered')).toBe(true);
  });

  it('allows out_for_delivery → delivered', () => {
    expect(canTransitionOrderStatus('out_for_delivery', 'delivered')).toBe(true);
  });

  it('rejects delivered → in_progress', () => {
    expect(canTransitionOrderStatus('delivered', 'in_progress')).toBe(false);
  });

  it('rejects cancelled → received', () => {
    expect(canTransitionOrderStatus('cancelled', 'received')).toBe(false);
  });

  it('allows cancellation from early stages', () => {
    expect(canTransitionOrderStatus('draft', 'cancelled')).toBe(true);
    expect(canTransitionOrderStatus('pickup_scheduled', 'cancelled')).toBe(true);
    expect(canTransitionOrderStatus('picked_up', 'cancelled')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 6. Loyalty Points
// ---------------------------------------------------------------------------

describe('calculateLoyaltyEarned', () => {
  it('earns 1 point per ₦100 (10,000 kobo)', () => {
    expect(calculateLoyaltyEarned(10_000)).toBe(1);
    expect(calculateLoyaltyEarned(100_000)).toBe(10); // ₦1,000 = 10 points
  });

  it('floors fractional points', () => {
    expect(calculateLoyaltyEarned(15_000)).toBe(1); // ₦150 → 1 point
    expect(calculateLoyaltyEarned(95_000)).toBe(9); // ₦950 → 9 points
  });

  it('earns 0 points for sub-₦100 amounts', () => {
    expect(calculateLoyaltyEarned(5_000)).toBe(0); // ₦50 = 0 points
  });
});

// ---------------------------------------------------------------------------
// 7. Inventory Alerts
// ---------------------------------------------------------------------------

describe('scanInventoryAlerts', () => {
  const makeInventoryItem = (overrides: Partial<InventoryItem>): InventoryItem => ({
    id: 'inv-001',
    name: 'Detergent 5L',
    unit: 'bottle',
    quantityInStock: 10,
    reorderThreshold: 5,
    branchId: 'branch-vi',
    ...overrides,
  });

  it('returns alert when stock at or below threshold', () => {
    const items: InventoryItem[] = [
      makeInventoryItem({ quantityInStock: 3, reorderThreshold: 5 }),
      makeInventoryItem({ id: 'inv-002', name: 'Hangers', quantityInStock: 5, reorderThreshold: 5 }),
    ];
    const alerts = scanInventoryAlerts(items);
    expect(alerts).toHaveLength(2);
  });

  it('does not alert above threshold', () => {
    const items: InventoryItem[] = [
      makeInventoryItem({ quantityInStock: 20, reorderThreshold: 5 }),
    ];
    const alerts = scanInventoryAlerts(items);
    expect(alerts).toHaveLength(0);
  });

  it('returns correct alert fields', () => {
    const items: InventoryItem[] = [
      makeInventoryItem({ quantityInStock: 2, reorderThreshold: 10, name: 'Plastic Bags' }),
    ];
    const [alert] = scanInventoryAlerts(items);
    expect(alert.name).toBe('Plastic Bags');
    expect(alert.currentQty).toBe(2);
    expect(alert.threshold).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// 8. Priority Queue (Rush Orders)
// ---------------------------------------------------------------------------

describe('createPriorityQueue', () => {
  it('dequeues express orders before normal orders', () => {
    const q = createPriorityQueue<{ id: string; isExpress: boolean; createdAt: string }>();
    q.enqueue({ id: 'normal-1', isExpress: false, createdAt: '2026-01-01T08:00:00Z' });
    q.enqueue({ id: 'express-1', isExpress: true, createdAt: '2026-01-01T09:00:00Z' });
    q.enqueue({ id: 'normal-2', isExpress: false, createdAt: '2026-01-01T07:00:00Z' });

    const first = q.dequeue();
    expect(first?.id).toBe('express-1');
  });

  it('returns size correctly', () => {
    const q = createPriorityQueue<{ id: string; isExpress: boolean; createdAt: string }>();
    q.enqueue({ id: 'a', isExpress: false, createdAt: '2026-01-01T08:00:00Z' });
    q.enqueue({ id: 'b', isExpress: true, createdAt: '2026-01-01T09:00:00Z' });
    expect(q.size()).toBe(2);
  });

  it('toArray returns express first', () => {
    const q = createPriorityQueue<{ id: string; isExpress: boolean; createdAt: string }>();
    q.enqueue({ id: 'n1', isExpress: false, createdAt: '2026-01-01T08:00:00Z' });
    q.enqueue({ id: 'e1', isExpress: true, createdAt: '2026-01-01T09:00:00Z' });
    const arr = q.toArray();
    expect(arr[0].id).toBe('e1');
    expect(arr[1].id).toBe('n1');
  });

  it('peek returns top without removing', () => {
    const q = createPriorityQueue<{ id: string; isExpress: boolean; createdAt: string }>();
    q.enqueue({ id: 'a', isExpress: true, createdAt: '2026-01-01T08:00:00Z' });
    expect(q.peek()?.id).toBe('a');
    expect(q.size()).toBe(1);
  });

  it('dequeue returns undefined when empty', () => {
    const q = createPriorityQueue<{ id: string; isExpress: boolean; createdAt: string }>();
    expect(q.dequeue()).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// 9. Report Generator
// ---------------------------------------------------------------------------

describe('generateReport', () => {
  const baseOrder = (overrides: Partial<Order>): Order => ({
    id: 'LND-1001',
    customerId: 'cust-001',
    branchId: 'branch-vi',
    status: 'delivered',
    items: [],
    services: ['wash'],
    isExpress: false,
    loyaltyPointsRedeemed: 0,
    subtotalKobo: 100_000,
    expressSurchargeKobo: 0,
    promoDiscountKobo: 0,
    loyaltyDiscountKobo: 0,
    totalKobo: 100_000,
    paidKobo: 100_000,
    refundedKobo: 0,
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z',
    completedAt: '2026-01-01T10:00:00Z',
    auditTrail: [],
    notifications: [],
    claims: [],
    ...overrides,
  });

  it('counts orders by status', () => {
    const orders: Order[] = [
      baseOrder({ id: 'o1', status: 'delivered' }),
      baseOrder({ id: 'o2', status: 'cancelled' }),
      baseOrder({ id: 'o3', status: 'lost_damaged' }),
    ];
    const report = generateReport(orders);
    expect(report.totalOrders).toBe(3);
    expect(report.completedOrders).toBe(1);
    expect(report.cancelledOrders).toBe(1);
    expect(report.lostDamagedOrders).toBe(1);
  });

  it('sums revenue from delivered orders only', () => {
    const orders: Order[] = [
      baseOrder({ id: 'o1', status: 'delivered', totalKobo: 150_000 }),
      baseOrder({ id: 'o2', status: 'cancelled', totalKobo: 200_000 }),
    ];
    const report = generateReport(orders);
    expect(report.revenueKobo).toBe(150_000);
  });

  it('calculates average turnaround hours', () => {
    const orders: Order[] = [
      baseOrder({
        id: 'o1',
        status: 'delivered',
        createdAt: '2026-01-01T08:00:00Z',
        completedAt: '2026-01-01T16:00:00Z', // 8h
      }),
      baseOrder({
        id: 'o2',
        status: 'delivered',
        createdAt: '2026-01-01T08:00:00Z',
        completedAt: '2026-01-01T20:00:00Z', // 12h
      }),
    ];
    const report = generateReport(orders);
    expect(report.averageTurnaroundHours).toBe(10);
  });

  it('identifies top service', () => {
    const orders: Order[] = [
      baseOrder({ id: 'o1', services: ['wash'] }),
      baseOrder({ id: 'o2', services: ['wash', 'dry_cleaning'] }),
      baseOrder({ id: 'o3', services: ['dry_cleaning'] }),
      baseOrder({ id: 'o4', services: ['dry_cleaning'] }),
    ];
    const report = generateReport(orders);
    expect(report.topService).toBe('dry_cleaning'); // 3 vs wash: 2
  });

  it('counts open claims', () => {
    const orders: Order[] = [
      baseOrder({
        id: 'o1',
        claims: [
          {
            id: 'claim-1',
            orderId: 'o1',
            itemId: 'item-1',
            customerId: 'cust-001',
            description: 'Torn shirt',
            claimedValueKobo: 50_000,
            status: 'open',
          },
          {
            id: 'claim-2',
            orderId: 'o1',
            itemId: 'item-2',
            customerId: 'cust-001',
            description: 'Lost sock',
            claimedValueKobo: 10_000,
            status: 'resolved_compensation',
          },
        ],
      }),
    ];
    const report = generateReport(orders);
    expect(report.openClaims).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// 10. LaundryEngine — Full Integration Tests
// ---------------------------------------------------------------------------

describe('LaundryEngine', () => {
  let engine: LaundryEngine;
  let customer: Customer;
  const branch = makeBranch();

  beforeEach(() => {
    resetOrderCounter(1000);
    engine = new LaundryEngine('LND');
    customer = makeCustomer();
    engine.addBranch(branch);
    engine.registerCustomer(customer);
  });

  // --- Order Creation ---

  describe('createOrder', () => {
    it('creates a draft order with correct ID', () => {
      const order = engine.createOrder({
        customerId: 'cust-001',
        branchId: 'branch-vi',
        items: [{ categoryId: 'shirt', description: 'Shirt', quantity: 2, services: ['wash'], priceKobo: 80_000 }],
        services: ['wash'],
      });
      expect(order.id).toBe('LND-1001');
      expect(order.status).toBe('draft');
    });

    it('generates QR codes for all items', () => {
      const order = engine.createOrder({
        customerId: 'cust-001',
        branchId: 'branch-vi',
        items: [
          { categoryId: 'shirt', description: 'Shirt', quantity: 1, services: ['wash'], priceKobo: 50_000 },
          { categoryId: 'trouser', description: 'Trouser', quantity: 1, services: ['ironing'], priceKobo: 30_000 },
        ],
        services: ['wash', 'ironing'],
      });
      expect(order.items[0].qrCode).toContain('QR:LND-1001:');
      expect(order.items[1].qrCode).toContain('QR:LND-1001:');
      expect(order.items[0].qrCode).not.toBe(order.items[1].qrCode);
    });

    it('calculates express surcharge in order', () => {
      const order = engine.createOrder({
        customerId: 'cust-001',
        branchId: 'branch-vi',
        items: [{ categoryId: 'shirt', description: 'Shirt', quantity: 1, services: ['express_wash'], priceKobo: 100_000 }],
        services: ['express_wash'],
        isExpress: true,
      });
      expect(order.isExpress).toBe(true);
      expect(order.expressSurchargeKobo).toBe(50_000);
      expect(order.totalKobo).toBe(150_000);
    });

    it('throws if customer not found', () => {
      expect(() =>
        engine.createOrder({
          customerId: 'unknown-cust',
          branchId: 'branch-vi',
          items: [],
          services: [],
        }),
      ).toThrow('Customer unknown-cust not found');
    });

    it('throws if customer is banned', () => {
      const bannedCustomer = makeCustomer({
        id: 'cust-banned',
        bannedUntil: new Date(Date.now() + 86400_000).toISOString(),
      });
      engine.registerCustomer(bannedCustomer);
      expect(() =>
        engine.createOrder({
          customerId: 'cust-banned',
          branchId: 'branch-vi',
          items: [],
          services: [],
        }),
      ).toThrow(/suspended/);
    });

    it('applies promo code at order creation', () => {
      engine.addPromoCode(makePromo({ code: 'SAVE10' }));
      const order = engine.createOrder({
        customerId: 'cust-001',
        branchId: 'branch-vi',
        items: [{ categoryId: 'shirt', description: 'Shirt', quantity: 1, services: ['wash'], priceKobo: 100_000 }],
        services: ['wash'],
        promoCode: 'SAVE10',
      });
      expect(order.promoDiscountKobo).toBe(10_000);
      expect(order.totalKobo).toBe(90_000);
    });
  });

  // --- Order Transitions ---

  describe('transitionOrder', () => {
    it('advances draft → pickup_scheduled', () => {
      const order = engine.createOrder({
        customerId: 'cust-001',
        branchId: 'branch-vi',
        items: [],
        services: [],
      });
      const updated = engine.transitionOrder(order.id, 'pickup_scheduled', 'cust-001', 'customer');
      expect(updated.status).toBe('pickup_scheduled');
      expect(updated.auditTrail).toHaveLength(2);
    });

    it('throws OrderStatusError on illegal transition', () => {
      const order = engine.createOrder({
        customerId: 'cust-001',
        branchId: 'branch-vi',
        items: [],
        services: [],
      });
      expect(() =>
        engine.transitionOrder(order.id, 'delivered', 'staff-01', 'staff'),
      ).toThrow(OrderStatusError);
    });

    it('awards loyalty points on delivery', () => {
      const priceKobo = 500_000; // ₦5,000 → 50 points
      let order = engine.createOrder({
        customerId: 'cust-001',
        branchId: 'branch-vi',
        items: [{ categoryId: 'shirt', description: 'Shirt', quantity: 5, services: ['wash'], priceKobo }],
        services: ['wash'],
      });

      // Walk through full status chain
      order = engine.transitionOrder(order.id, 'pickup_scheduled', 'cust-001', 'customer');
      order = engine.transitionOrder(order.id, 'picked_up', 'driver-01', 'driver');
      order = engine.transitionOrder(order.id, 'received', 'staff-01', 'staff');
      order = engine.transitionOrder(order.id, 'sorted', 'staff-01', 'staff');
      order = engine.transitionOrder(order.id, 'in_progress', 'staff-01', 'staff');
      order = engine.transitionOrder(order.id, 'ready_for_pickup', 'staff-01', 'staff');
      order = engine.transitionOrder(order.id, 'delivered', 'driver-01', 'driver');

      const updatedCustomer = engine.getCustomer('cust-001')!;
      expect(updatedCustomer.loyaltyPoints).toBe(50);
      expect(updatedCustomer.totalOrdersCompleted).toBe(1);
    });

    it('sets completedAt on delivery', () => {
      let order = engine.createOrder({ customerId: 'cust-001', branchId: 'branch-vi', items: [], services: [] });
      order = engine.transitionOrder(order.id, 'pickup_scheduled', 'cust-001', 'customer');
      order = engine.transitionOrder(order.id, 'picked_up', 'driver-01', 'driver');
      order = engine.transitionOrder(order.id, 'received', 'staff-01', 'staff');
      order = engine.transitionOrder(order.id, 'sorted', 'staff-01', 'staff');
      order = engine.transitionOrder(order.id, 'in_progress', 'staff-01', 'staff');
      order = engine.transitionOrder(order.id, 'ready_for_pickup', 'staff-01', 'staff');
      order = engine.transitionOrder(order.id, 'delivered', 'driver-01', 'driver');
      expect(order.completedAt).toBeDefined();
    });
  });

  // --- Item Stage Advancement ---

  describe('advanceItemStage', () => {
    it('advances item from received → sorted', () => {
      const order = engine.createOrder({
        customerId: 'cust-001',
        branchId: 'branch-vi',
        items: [{ categoryId: 'shirt', description: 'Shirt', quantity: 1, services: ['wash'], priceKobo: 50_000 }],
        services: ['wash'],
      });
      const itemId = order.items[0].id;
      const updated = engine.advanceItemStage(order.id, itemId, 'sorted', 'staff-01', 'staff');
      expect(updated.items[0].stage).toBe('sorted');
    });

    it('auto-transitions order to in_progress when item enters washing', () => {
      let order = engine.createOrder({
        customerId: 'cust-001',
        branchId: 'branch-vi',
        items: [{ categoryId: 'shirt', description: 'Shirt', quantity: 1, services: ['wash'], priceKobo: 50_000 }],
        services: ['wash'],
      });
      // Move order to 'sorted' status first
      order = engine.transitionOrder(order.id, 'pickup_scheduled', 'cust-001', 'customer');
      order = engine.transitionOrder(order.id, 'picked_up', 'driver-01', 'driver');
      order = engine.transitionOrder(order.id, 'received', 'staff-01', 'staff');
      order = engine.transitionOrder(order.id, 'sorted', 'staff-01', 'staff');

      const itemId = order.items[0].id;
      order = engine.advanceItemStage(order.id, itemId, 'sorted', 'staff-01', 'staff');
      order = engine.advanceItemStage(order.id, itemId, 'washing', 'staff-01', 'staff');
      expect(order.status).toBe('in_progress');
    });

    it('auto-transitions order to ready_for_pickup when all items are ready', () => {
      let order = engine.createOrder({
        customerId: 'cust-001',
        branchId: 'branch-vi',
        items: [
          { categoryId: 'shirt', description: 'Shirt', quantity: 1, services: ['wash'], priceKobo: 50_000 },
        ],
        services: ['wash'],
      });
      order = engine.transitionOrder(order.id, 'pickup_scheduled', 'cust-001', 'customer');
      order = engine.transitionOrder(order.id, 'picked_up', 'driver-01', 'driver');
      order = engine.transitionOrder(order.id, 'received', 'staff-01', 'staff');
      order = engine.transitionOrder(order.id, 'sorted', 'staff-01', 'staff');

      const itemId = order.items[0].id;
      order = engine.advanceItemStage(order.id, itemId, 'sorted', 'staff-01', 'staff');
      order = engine.advanceItemStage(order.id, itemId, 'washing', 'staff-01', 'staff');
      order = engine.advanceItemStage(order.id, itemId, 'drying', 'staff-01', 'staff');
      order = engine.advanceItemStage(order.id, itemId, 'ironing', 'staff-01', 'staff');
      order = engine.advanceItemStage(order.id, itemId, 'folding', 'staff-01', 'staff');
      order = engine.advanceItemStage(order.id, itemId, 'ready', 'staff-01', 'staff');
      expect(order.status).toBe('ready_for_pickup');
    });

    it('throws ItemStageError on illegal item transition', () => {
      const order = engine.createOrder({
        customerId: 'cust-001',
        branchId: 'branch-vi',
        items: [{ categoryId: 'shirt', description: 'Shirt', quantity: 1, services: ['wash'], priceKobo: 50_000 }],
        services: ['wash'],
      });
      const itemId = order.items[0].id;
      expect(() =>
        engine.advanceItemStage(order.id, itemId, 'delivered', 'staff-01', 'staff'),
      ).toThrow(ItemStageError);
    });
  });

  // --- Payments ---

  describe('recordPayment', () => {
    it('records payment amount', () => {
      const order = engine.createOrder({
        customerId: 'cust-001',
        branchId: 'branch-vi',
        items: [{ categoryId: 'shirt', description: 'Shirt', quantity: 1, services: ['wash'], priceKobo: 100_000 }],
        services: ['wash'],
      });
      const updated = engine.recordPayment(order.id, 100_000, 'cust-001', 'customer');
      expect(updated.paidKobo).toBe(100_000);
    });

    it('accumulates multiple payments', () => {
      const order = engine.createOrder({
        customerId: 'cust-001',
        branchId: 'branch-vi',
        items: [{ categoryId: 'shirt', description: 'Shirt', quantity: 1, services: ['wash'], priceKobo: 100_000 }],
        services: ['wash'],
      });
      engine.recordPayment(order.id, 50_000, 'cust-001', 'customer');
      const updated = engine.recordPayment(order.id, 50_000, 'cust-001', 'customer');
      expect(updated.paidKobo).toBe(100_000);
    });
  });

  // --- Cancellation ---

  describe('cancelOrder', () => {
    it('cancels a draft order with refund', () => {
      const order = engine.createOrder({
        customerId: 'cust-001',
        branchId: 'branch-vi',
        items: [{ categoryId: 'shirt', description: 'Shirt', quantity: 1, services: ['wash'], priceKobo: 100_000 }],
        services: ['wash'],
      });
      const cancelled = engine.cancelOrder(order.id, 'Customer request', 100_000, 'cust-001', 'customer');
      expect(cancelled.status).toBe('cancelled');
      expect(cancelled.refundedKobo).toBe(100_000);
    });

    it('throws when cancelling a delivered order', () => {
      let order = engine.createOrder({ customerId: 'cust-001', branchId: 'branch-vi', items: [], services: [] });
      order = engine.transitionOrder(order.id, 'pickup_scheduled', 'cust-001', 'customer');
      order = engine.transitionOrder(order.id, 'picked_up', 'driver-01', 'driver');
      order = engine.transitionOrder(order.id, 'received', 'staff-01', 'staff');
      order = engine.transitionOrder(order.id, 'sorted', 'staff-01', 'staff');
      order = engine.transitionOrder(order.id, 'in_progress', 'staff-01', 'staff');
      order = engine.transitionOrder(order.id, 'ready_for_pickup', 'staff-01', 'staff');
      order = engine.transitionOrder(order.id, 'delivered', 'driver-01', 'driver');
      expect(() =>
        engine.cancelOrder(order.id, 'Late regret', 0, 'cust-001', 'customer'),
      ).toThrow(OrderStatusError);
    });
  });

  // --- Damage Claims ---

  describe('fileClaim & resolveClaim', () => {
    it('files a damage claim', () => {
      const order = engine.createOrder({
        customerId: 'cust-001',
        branchId: 'branch-vi',
        items: [{ categoryId: 'suit', description: 'Suit', quantity: 1, services: ['dry_cleaning'], priceKobo: 200_000 }],
        services: ['dry_cleaning'],
      });
      const claim: DamageClaim = {
        id: 'claim-001',
        orderId: order.id,
        itemId: order.items[0].id,
        customerId: 'cust-001',
        description: 'Suit returned with burn mark',
        claimedValueKobo: 150_000,
        status: 'open',
      };
      const updated = engine.fileClaim(claim, 'cust-001', 'customer');
      expect(updated.claims).toHaveLength(1);
      expect(updated.claims[0].status).toBe('open');
    });

    it('resolves a claim with compensation', () => {
      const order = engine.createOrder({
        customerId: 'cust-001',
        branchId: 'branch-vi',
        items: [{ categoryId: 'suit', description: 'Suit', quantity: 1, services: ['dry_cleaning'], priceKobo: 200_000 }],
        services: ['dry_cleaning'],
      });
      const claim: DamageClaim = {
        id: 'claim-001',
        orderId: order.id,
        itemId: order.items[0].id,
        customerId: 'cust-001',
        description: 'Lost trouser',
        claimedValueKobo: 80_000,
        status: 'open',
      };
      engine.fileClaim(claim, 'cust-001', 'customer');
      const resolved = engine.resolveClaim(order.id, 'claim-001', 'resolved_compensation', 80_000, 'manager-01', 'manager');
      expect(resolved.claims[0].status).toBe('resolved_compensation');
      expect(resolved.claims[0].compensationKobo).toBe(80_000);
      expect(resolved.refundedKobo).toBe(80_000);
    });
  });

  // --- Driver Assignment ---

  describe('assignDriver', () => {
    it('assigns an available driver to an order', () => {
      const driver: Driver = {
        id: 'driver-01',
        name: 'Tunde',
        phone: '+2348011111111',
        branchId: 'branch-vi',
        isAvailable: true,
        activeOrderIds: [],
      };
      engine.addDriver(driver);
      const order = engine.createOrder({ customerId: 'cust-001', branchId: 'branch-vi', items: [], services: [] });
      const updated = engine.assignDriver(order.id, 'driver-01', 'manager-01', 'manager');
      expect(updated.driverId).toBe('driver-01');
    });

    it('throws if driver is unavailable', () => {
      const driver: Driver = {
        id: 'driver-02',
        name: 'Emeka',
        phone: '+2348022222222',
        branchId: 'branch-vi',
        isAvailable: false,
        activeOrderIds: [],
      };
      engine.addDriver(driver);
      const order = engine.createOrder({ customerId: 'cust-001', branchId: 'branch-vi', items: [], services: [] });
      expect(() =>
        engine.assignDriver(order.id, 'driver-02', 'manager-01', 'manager'),
      ).toThrow(/not available/);
    });
  });

  // --- Inventory ---

  describe('Inventory Management', () => {
    const invItem: InventoryItem = {
      id: 'inv-det',
      name: 'Detergent 5L',
      unit: 'bottle',
      quantityInStock: 20,
      reorderThreshold: 5,
      branchId: 'branch-vi',
    };

    it('updates inventory stock', () => {
      engine.addInventoryItem(invItem);
      const updated = engine.updateInventoryStock('inv-det', -5);
      expect(updated.quantityInStock).toBe(15);
    });

    it('returns inventory alerts when below threshold', () => {
      engine.addInventoryItem({ ...invItem, quantityInStock: 3 });
      const alerts = engine.getInventoryAlerts('branch-vi');
      expect(alerts).toHaveLength(1);
      expect(alerts[0].name).toBe('Detergent 5L');
    });
  });

  // --- Subscriptions ---

  describe('Recurring Subscriptions', () => {
    it('creates and renews a subscription', () => {
      const sub = {
        id: 'sub-001',
        customerId: 'cust-001',
        branchId: 'branch-vi',
        services: ['wash_and_fold'] as ServiceType[],
        frequencyDays: 7,
        nextPickupDate: '2026-01-01',
        isActive: true,
      };
      engine.createSubscription(sub);
      const renewed = engine.renewSubscription('sub-001');
      expect(renewed.nextPickupDate).toBe('2026-01-08');
    });

    it('returns due subscriptions on or before asOfDate', () => {
      const sub = {
        id: 'sub-002',
        customerId: 'cust-001',
        branchId: 'branch-vi',
        services: ['wash'] as ServiceType[],
        frequencyDays: 7,
        nextPickupDate: '2026-01-01',
        isActive: true,
      };
      engine.createSubscription(sub);
      const due = engine.getDueSubscriptions(new Date('2026-01-02T00:00:00Z'));
      expect(due).toHaveLength(1);
      expect(due[0].id).toBe('sub-002');
    });

    it('does not return inactive subscriptions', () => {
      const sub = {
        id: 'sub-003',
        customerId: 'cust-001',
        branchId: 'branch-vi',
        services: ['wash'] as ServiceType[],
        frequencyDays: 7,
        nextPickupDate: '2026-01-01',
        isActive: false,
      };
      engine.createSubscription(sub);
      const due = engine.getDueSubscriptions(new Date('2026-01-10T00:00:00Z'));
      expect(due).toHaveLength(0);
    });
  });

  // --- Customer Tier Upgrade ---

  describe('updateCustomerTier', () => {
    it('upgrades to bronze at 5 completed orders', () => {
      engine.registerCustomer(makeCustomer({ id: 'cust-t1', totalOrdersCompleted: 5 }));
      const tier = engine.updateCustomerTier('cust-t1');
      expect(tier).toBe('bronze');
    });

    it('upgrades to silver at 10 completed orders', () => {
      engine.registerCustomer(makeCustomer({ id: 'cust-t2', totalOrdersCompleted: 10 }));
      const tier = engine.updateCustomerTier('cust-t2');
      expect(tier).toBe('silver');
    });

    it('upgrades to gold at 20 completed orders', () => {
      engine.registerCustomer(makeCustomer({ id: 'cust-t3', totalOrdersCompleted: 20 }));
      const tier = engine.updateCustomerTier('cust-t3');
      expect(tier).toBe('gold');
    });
  });

  // --- Notifications ---

  describe('sendNotification', () => {
    it('adds a notification to the order', () => {
      const order = engine.createOrder({ customerId: 'cust-001', branchId: 'branch-vi', items: [], services: [] });
      const updated = engine.sendNotification(order.id, 'sms', 'Your order is ready for pickup!');
      expect(updated.notifications).toHaveLength(1);
      expect(updated.notifications[0].channel).toBe('sms');
      expect(updated.notifications[0].delivered).toBe(true);
    });
  });

  // --- Query Methods ---

  describe('Query Methods', () => {
    it('getOrdersByCustomer returns matching orders', () => {
      engine.createOrder({ customerId: 'cust-001', branchId: 'branch-vi', items: [], services: [] });
      engine.registerCustomer(makeCustomer({ id: 'cust-002' }));
      engine.createOrder({ customerId: 'cust-002', branchId: 'branch-vi', items: [], services: [] });
      expect(engine.getOrdersByCustomer('cust-001')).toHaveLength(1);
    });

    it('getOrdersByStatus returns matching orders', () => {
      engine.createOrder({ customerId: 'cust-001', branchId: 'branch-vi', items: [], services: [] });
      engine.createOrder({ customerId: 'cust-001', branchId: 'branch-vi', items: [], services: [] });
      expect(engine.getOrdersByStatus('draft')).toHaveLength(2);
    });

    it('generateReport aggregates all orders', () => {
      engine.createOrder({ customerId: 'cust-001', branchId: 'branch-vi', items: [], services: [] });
      engine.createOrder({ customerId: 'cust-001', branchId: 'branch-vi', items: [], services: [] });
      const report = engine.generateReport();
      expect(report.totalOrders).toBe(2);
    });
  });
});
