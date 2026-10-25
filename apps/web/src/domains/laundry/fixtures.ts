/**
 * Lagos Laundry Operations — Seed Fixtures
 * Pre-populated demo data for the Allinet Portfolio laundry demo.
 */

import {
  Branch,
  Customer,
  Driver,
  StaffMember,
  PromoCode,
  InventoryItem,
  OrderItem,
  ServiceType,
  LaundryEngine,
  resetOrderCounter,
} from './engine';

// ---------------------------------------------------------------------------
// Branches
// ---------------------------------------------------------------------------

export const LAGOS_BRANCHES: Branch[] = [
  {
    id: 'branch-vi',
    name: 'Victoria Island Branch',
    address: '12 Saka Tinubu Street, Victoria Island, Lagos',
    phone: '+2341-2700-001',
    isActive: true,
  },
  {
    id: 'branch-lekki',
    name: 'Lekki Phase 1 Branch',
    address: '5 Admiralty Way, Lekki Phase 1, Lagos',
    phone: '+2341-2700-002',
    isActive: true,
  },
  {
    id: 'branch-ikeja',
    name: 'Ikeja Branch',
    address: '14 Opebi Road, Ikeja, Lagos',
    phone: '+2341-2700-003',
    isActive: true,
  },
];

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export const SEED_CUSTOMERS: Customer[] = [
  {
    id: 'cust-folake',
    name: 'Folake Adeyemi',
    email: 'folake@example.com',
    phone: '+2348012345678',
    tier: 'gold',
    loyaltyPoints: 240,
    totalOrdersCompleted: 22,
    branchId: 'branch-vi',
  },
  {
    id: 'cust-tunde',
    name: 'Babatunde Okafor',
    email: 'tunde@example.com',
    phone: '+2348023456789',
    tier: 'silver',
    loyaltyPoints: 80,
    totalOrdersCompleted: 11,
    branchId: 'branch-lekki',
  },
  {
    id: 'cust-amaka',
    name: 'Amaka Eze',
    email: 'amaka@example.com',
    phone: '+2348034567890',
    tier: 'standard',
    loyaltyPoints: 10,
    totalOrdersCompleted: 2,
    branchId: 'branch-ikeja',
  },
];

// ---------------------------------------------------------------------------
// Drivers
// ---------------------------------------------------------------------------

export const SEED_DRIVERS: Driver[] = [
  {
    id: 'driver-emeka',
    name: 'Emeka Nwosu',
    phone: '+2348045678901',
    branchId: 'branch-vi',
    isAvailable: true,
    activeOrderIds: [],
  },
  {
    id: 'driver-hassan',
    name: 'Hassan Bello',
    phone: '+2348056789012',
    branchId: 'branch-lekki',
    isAvailable: true,
    activeOrderIds: [],
  },
];

// ---------------------------------------------------------------------------
// Staff
// ---------------------------------------------------------------------------

export const SEED_STAFF: StaffMember[] = [
  { id: 'staff-ayo', name: 'Ayoola Adeleke', role: 'manager', branchId: 'branch-vi', shift: 'morning' },
  { id: 'staff-ngozi', name: 'Ngozi Chukwu', role: 'staff', branchId: 'branch-vi', shift: 'afternoon' },
  { id: 'staff-seun', name: 'Seun Adesanya', role: 'staff', branchId: 'branch-lekki', shift: 'morning' },
];

// ---------------------------------------------------------------------------
// Promo Codes
// ---------------------------------------------------------------------------

export const SEED_PROMOS: PromoCode[] = [
  {
    code: 'FIRSTWASH',
    discountType: 'percentage',
    discountValue: 15,
    validFrom: '2026-01-01T00:00:00Z',
    validUntil: '2027-12-31T23:59:59Z',
    maxUses: 500,
    usedCount: 47,
  },
  {
    code: 'LAGOSCLEAN',
    discountType: 'fixed_kobo',
    discountValue: 50_000, // ₦500
    validFrom: '2026-01-01T00:00:00Z',
    validUntil: '2027-12-31T23:59:59Z',
    usedCount: 12,
  },
  {
    code: 'GOLDMEMBER',
    discountType: 'percentage',
    discountValue: 20,
    validFrom: '2026-01-01T00:00:00Z',
    validUntil: '2027-12-31T23:59:59Z',
    maxUses: 100,
    usedCount: 5,
  },
];

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------

export const SEED_INVENTORY: InventoryItem[] = [
  { id: 'inv-det-vi', name: 'Bio Detergent 5L', unit: 'bottle', quantityInStock: 8, reorderThreshold: 10, branchId: 'branch-vi' },
  { id: 'inv-hanger-vi', name: 'Wire Hangers (box of 100)', unit: 'box', quantityInStock: 3, reorderThreshold: 5, branchId: 'branch-vi' },
  { id: 'inv-bag-vi', name: 'Laundry Plastic Bags', unit: 'roll', quantityInStock: 20, reorderThreshold: 5, branchId: 'branch-vi' },
  { id: 'inv-det-lekki', name: 'Bio Detergent 5L', unit: 'bottle', quantityInStock: 15, reorderThreshold: 10, branchId: 'branch-lekki' },
  { id: 'inv-hanger-lekki', name: 'Wire Hangers (box of 100)', unit: 'box', quantityInStock: 2, reorderThreshold: 5, branchId: 'branch-lekki' },
];

// ---------------------------------------------------------------------------
// Seed Order Items helper
// ---------------------------------------------------------------------------

function makeItems(
  orderId: string,
  specs: Array<{ category: string; desc: string; qty: number; svc: ServiceType[]; priceKobo: number }>,
): Omit<import('./engine').OrderItem, 'id' | 'qrCode' | 'stage'>[] {
  return specs.map((s) => ({
    categoryId: s.category,
    description: s.desc,
    quantity: s.qty,
    services: s.svc,
    priceKobo: s.priceKobo,
  }));
}

// ---------------------------------------------------------------------------
// Factory: Create pre-seeded engine state
// ---------------------------------------------------------------------------

export function createSeededLaundryEngine(): LaundryEngine {
  resetOrderCounter(1040); // So demo order LND-1042 is predictable

  const engine = new LaundryEngine('LND');

  // Register branches, customers, drivers, inventory
  LAGOS_BRANCHES.forEach((b) => engine.addBranch(b));
  SEED_CUSTOMERS.forEach((c) => engine.registerCustomer(c));
  SEED_DRIVERS.forEach((d) => engine.addDriver(d));
  SEED_INVENTORY.forEach((i) => engine.addInventoryItem(i));
  SEED_PROMOS.forEach((p) => engine.addPromoCode(p));

  // --- Order LND-1041: Delivered (background history) ---
  let o1 = engine.createOrder({
    customerId: 'cust-tunde',
    branchId: 'branch-lekki',
    items: makeItems('LND-1041', [
      { category: 'shirt', desc: '3× Office Shirts', qty: 3, svc: ['wash', 'ironing'], priceKobo: 90_000 },
    ]),
    services: ['wash', 'ironing'],
    isExpress: false,
  });
  o1 = engine.transitionOrder(o1.id, 'pickup_scheduled', 'cust-tunde', 'customer');
  o1 = engine.transitionOrder(o1.id, 'picked_up', 'driver-hassan', 'driver');
  o1 = engine.transitionOrder(o1.id, 'received', 'staff-seun', 'staff');
  o1 = engine.transitionOrder(o1.id, 'sorted', 'staff-seun', 'staff');
  o1 = engine.transitionOrder(o1.id, 'in_progress', 'staff-seun', 'staff');
  o1 = engine.transitionOrder(o1.id, 'ready_for_pickup', 'staff-seun', 'staff');
  o1 = engine.transitionOrder(o1.id, 'delivered', 'driver-hassan', 'driver');
  engine.recordPayment(o1.id, o1.totalKobo, 'cust-tunde', 'customer');

  // --- Order LND-1042: The main DEMO order (in_progress) ---
  const o2Items = makeItems('LND-1042', [
    { category: 'native', desc: '2× Agbada (Dry Cleaning)', qty: 2, svc: ['dry_cleaning'], priceKobo: 280_000 },
    { category: 'shirt', desc: '5× Cotton Shirts', qty: 5, svc: ['wash', 'ironing'], priceKobo: 125_000 },
    { category: 'trouser', desc: '3× Trousers', qty: 3, svc: ['ironing', 'folding'], priceKobo: 60_000 },
    { category: 'bedsheet', desc: '2× King Bedsheets', qty: 2, svc: ['wash_and_fold'], priceKobo: 80_000 },
  ]);
  let o2 = engine.createOrder({
    customerId: 'cust-folake',
    branchId: 'branch-vi',
    items: o2Items,
    services: ['dry_cleaning', 'wash', 'ironing', 'folding', 'wash_and_fold'],
    pickupSlot: { date: '2026-11-01', timeFrom: '09:00', timeTo: '11:00' },
    isExpress: false,
    promoCode: 'GOLDMEMBER',
  });
  o2 = engine.transitionOrder(o2.id, 'pickup_scheduled', 'cust-folake', 'customer');
  o2 = engine.transitionOrder(o2.id, 'picked_up', 'driver-emeka', 'driver');
  o2 = engine.transitionOrder(o2.id, 'received', 'staff-ayo', 'staff');
  o2 = engine.transitionOrder(o2.id, 'sorted', 'staff-ayo', 'staff');
  o2 = engine.transitionOrder(o2.id, 'in_progress', 'staff-ngozi', 'staff');
  engine.sendNotification(o2.id, 'sms', `Hello Folake! Your order ${o2.id} is now being processed. Expected ready: 48h`);
  // Advance some items to later stages to show partial progress
  const [item0, item1, item2, item3] = o2.items;
  engine.advanceItemStage(o2.id, item0.id, 'sorted', 'staff-ayo', 'staff');
  engine.advanceItemStage(o2.id, item0.id, 'washing', 'staff-ngozi', 'staff');
  engine.advanceItemStage(o2.id, item0.id, 'drying', 'staff-ngozi', 'staff');
  engine.advanceItemStage(o2.id, item1.id, 'sorted', 'staff-ayo', 'staff');
  engine.advanceItemStage(o2.id, item1.id, 'washing', 'staff-ngozi', 'staff');
  engine.advanceItemStage(o2.id, item2.id, 'sorted', 'staff-ayo', 'staff');
  engine.advanceItemStage(o2.id, item2.id, 'washing', 'staff-ngozi', 'staff');
  engine.advanceItemStage(o2.id, item2.id, 'drying', 'staff-ngozi', 'staff');
  engine.advanceItemStage(o2.id, item2.id, 'ironing', 'staff-ngozi', 'staff');
  engine.advanceItemStage(o2.id, item2.id, 'folding', 'staff-ngozi', 'staff');
  engine.advanceItemStage(o2.id, item2.id, 'ready', 'staff-ngozi', 'staff');
  engine.advanceItemStage(o2.id, item3.id, 'sorted', 'staff-ayo', 'staff');

  // --- Order LND-1043: Express order (ready_for_pickup) ---
  let o3 = engine.createOrder({
    customerId: 'cust-amaka',
    branchId: 'branch-ikeja',
    items: makeItems('LND-1043', [
      { category: 'suit', desc: '1× Business Suit', qty: 1, svc: ['dry_cleaning'], priceKobo: 200_000 },
    ]),
    services: ['dry_cleaning'],
    isExpress: true,
    promoCode: 'FIRSTWASH',
  });
  o3 = engine.transitionOrder(o3.id, 'pickup_scheduled', 'cust-amaka', 'customer');
  o3 = engine.transitionOrder(o3.id, 'picked_up', 'driver-emeka', 'driver');
  o3 = engine.transitionOrder(o3.id, 'received', 'staff-ngozi', 'staff');
  o3 = engine.transitionOrder(o3.id, 'sorted', 'staff-ngozi', 'staff');
  const o3Item0 = o3.items[0];
  engine.advanceItemStage(o3.id, o3Item0.id, 'sorted', 'staff-ngozi', 'staff');
  engine.advanceItemStage(o3.id, o3Item0.id, 'washing', 'staff-ngozi', 'staff');
  engine.advanceItemStage(o3.id, o3Item0.id, 'drying', 'staff-ngozi', 'staff');
  engine.advanceItemStage(o3.id, o3Item0.id, 'ironing', 'staff-ngozi', 'staff');
  engine.advanceItemStage(o3.id, o3Item0.id, 'folding', 'staff-ngozi', 'staff');
  engine.advanceItemStage(o3.id, o3Item0.id, 'ready', 'staff-ngozi', 'staff');
  engine.sendNotification(o3.id, 'sms', `Great news Amaka! Your order ${o3.id} is ready for pickup at our Ikeja branch.`);

  return engine;
}
