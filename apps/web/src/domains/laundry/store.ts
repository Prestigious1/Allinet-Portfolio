'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  LaundryEngine,
  Order,
  OrderStatus,
  ItemStage,
  Customer,
  ServiceType,
  PromoCode,
  Driver,
  InventoryItem,
  DamageClaim,
  RecurringSubscription,
  PickupSlot,
  OperationsReport,
  InventoryAlert,
  PriceBreakdown,
  calculateOrderPrice,
  estimateTurnaround,
  TurnaroundEstimate,
  UserRole,
} from './engine';
import { createSeededLaundryEngine, SEED_CUSTOMERS } from './fixtures';

export const LAUNDRY_STORAGE_KEY = 'allinet_laundry_sandbox_v1';

// ---------------------------------------------------------------------------
// Store Shape
// ---------------------------------------------------------------------------

interface LaundryStoreState {
  // The engine is not serializable directly; we snapshot its state.
  orders: Order[];
  customers: Customer[];
  currentRole: UserRole;
  activeCustomerId: string;

  // Challenge flow (F-156)
  challengeActive: boolean;
  challengeStartTime: number | null;
  challengeElapsedSeconds: number;
  challengeCompleted: boolean;
  challengeSteps: {
    orderCreated: boolean;
    itemScanned: boolean;
    markedReady: boolean;
    deliveryAssigned: boolean;
    orderClosed: boolean;
  };

  // Actions
  resetSandbox: () => void;
  setRole: (role: UserRole) => void;
  setActiveCustomer: (id: string) => void;

  // Customer order actions
  createOrder: (params: {
    customerId: string;
    branchId: string;
    items: Array<{ categoryId: string; description: string; quantity: number; services: ServiceType[]; priceKobo: number }>;
    services: ServiceType[];
    pickupSlot?: PickupSlot;
    isExpress?: boolean;
    promoCode?: string;
    loyaltyPointsToRedeem?: number;
    notes?: string;
  }) => Order;

  getPriceEstimate: (params: {
    items: Array<{ priceKobo: number }>;
    isExpress: boolean;
    promoCode?: string;
    loyaltyPoints?: number;
    tier?: Customer['tier'];
  }) => PriceBreakdown;

  getTurnaround: (services: ServiceType[], isExpress: boolean) => TurnaroundEstimate;

  // Staff actions
  transitionOrder: (orderId: string, to: OrderStatus) => Order;
  advanceItemStage: (orderId: string, itemId: string, to: ItemStage) => Order;
  recordPayment: (orderId: string, amountKobo: number) => Order;
  cancelOrder: (orderId: string, reason: string, refundKobo: number) => Order;
  fileClaim: (claim: DamageClaim) => Order;
  resolveClaim: (orderId: string, claimId: string, resolution: DamageClaim['status'], compensationKobo: number) => Order;
  sendNotification: (orderId: string, channel: 'sms' | 'email' | 'push', message: string) => Order;
  assignDriver: (orderId: string, driverId: string) => Order;

  // Reporting
  getReport: () => OperationsReport;
  getDelayedOrders: () => Order[];
  getInventoryAlerts: () => InventoryAlert[];

  // Challenge
  startChallenge: () => void;
  stopChallenge: () => void;
  tickChallenge: () => void;
}

// ---------------------------------------------------------------------------
// Engine singleton (in-memory, not persisted)
// ---------------------------------------------------------------------------

let _engine: LaundryEngine | null = null;

function getEngine(): LaundryEngine {
  if (!_engine) {
    _engine = createSeededLaundryEngine();
  }
  return _engine;
}

function resetEngine(): LaundryEngine {
  _engine = createSeededLaundryEngine();
  return _engine;
}

function engineSnapshot(engine: LaundryEngine) {
  const orders: Order[] = [];
  // Walk known orders — engine exposes getOrdersByStatus for all statuses
  const allStatuses: OrderStatus[] = [
    'draft', 'pickup_scheduled', 'picked_up', 'received', 'sorted',
    'in_progress', 'ready_for_pickup', 'out_for_delivery', 'delivered',
    'cancelled', 'lost_damaged',
  ];
  const seen = new Set<string>();
  for (const s of allStatuses) {
    for (const o of engine.getOrdersByStatus(s)) {
      if (!seen.has(o.id)) {
        seen.add(o.id);
        orders.push(o);
      }
    }
  }
  return { orders };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useLaundryStore = create<LaundryStoreState>()(
  persist(
    (set, get) => ({
      orders: engineSnapshot(getEngine()).orders,
      customers: SEED_CUSTOMERS,
      currentRole: 'customer',
      activeCustomerId: 'cust-folake',

      challengeActive: false,
      challengeStartTime: null,
      challengeElapsedSeconds: 0,
      challengeCompleted: false,
      challengeSteps: {
        orderCreated: false,
        itemScanned: false,
        markedReady: false,
        deliveryAssigned: false,
        orderClosed: false,
      },

      // --- Reset ---
      resetSandbox() {
        const engine = resetEngine();
        const snap = engineSnapshot(engine);
        set({
          orders: snap.orders,
          customers: SEED_CUSTOMERS,
          currentRole: 'customer',
          activeCustomerId: 'cust-folake',
          challengeActive: false,
          challengeStartTime: null,
          challengeElapsedSeconds: 0,
          challengeCompleted: false,
          challengeSteps: {
            orderCreated: false,
            itemScanned: false,
            markedReady: false,
            deliveryAssigned: false,
            orderClosed: false,
          },
        });
      },

      setRole(role) { set({ currentRole: role }); },
      setActiveCustomer(id) { set({ activeCustomerId: id }); },

      // --- Create Order ---
      createOrder(params) {
        const engine = getEngine();
        const order = engine.createOrder(params);
        const snap = engineSnapshot(engine);
        set((s) => ({
          orders: snap.orders,
          challengeSteps: { ...s.challengeSteps, orderCreated: true },
        }));
        return order;
      },

      // --- Price Estimate ---
      getPriceEstimate({ items, isExpress, promoCode, loyaltyPoints = 0, tier = 'standard' }) {
        const engine = getEngine();
        const promo = promoCode ? engine.getPromoCode(promoCode) ?? null : null;
        return calculateOrderPrice(items, isExpress, promo, loyaltyPoints, { tier });
      },

      // --- Turnaround ---
      getTurnaround(services, isExpress) {
        return estimateTurnaround(services, isExpress);
      },

      // --- Transition Order ---
      transitionOrder(orderId, to) {
        const engine = getEngine();
        const role = get().currentRole;
        const order = engine.transitionOrder(orderId, to, get().activeCustomerId, role);
        const snap = engineSnapshot(engine);
        set((s) => {
          const steps = { ...s.challengeSteps };
          if (to === 'out_for_delivery') steps.deliveryAssigned = true;
          if (to === 'delivered') steps.orderClosed = true;
          if (to === 'ready_for_pickup') steps.markedReady = true;
          return { orders: snap.orders, challengeSteps: steps };
        });
        return order;
      },

      // --- Advance Item Stage ---
      advanceItemStage(orderId, itemId, to) {
        const engine = getEngine();
        const role = get().currentRole;
        const order = engine.advanceItemStage(orderId, itemId, to, get().activeCustomerId, role);
        const snap = engineSnapshot(engine);
        set((s) => {
          const steps = { ...s.challengeSteps, itemScanned: true };
          if (to === 'ready') steps.markedReady = true;
          return { orders: snap.orders, challengeSteps: steps };
        });
        return order;
      },

      // --- Payment ---
      recordPayment(orderId, amountKobo) {
        const engine = getEngine();
        const role = get().currentRole;
        const order = engine.recordPayment(orderId, amountKobo, get().activeCustomerId, role);
        const snap = engineSnapshot(engine);
        set({ orders: snap.orders });
        return order;
      },

      // --- Cancel ---
      cancelOrder(orderId, reason, refundKobo) {
        const engine = getEngine();
        const role = get().currentRole;
        const order = engine.cancelOrder(orderId, reason, refundKobo, get().activeCustomerId, role);
        const snap = engineSnapshot(engine);
        set({ orders: snap.orders });
        return order;
      },

      // --- Claims ---
      fileClaim(claim) {
        const engine = getEngine();
        const role = get().currentRole;
        const order = engine.fileClaim(claim, get().activeCustomerId, role);
        const snap = engineSnapshot(engine);
        set({ orders: snap.orders });
        return order;
      },

      resolveClaim(orderId, claimId, resolution, compensationKobo) {
        const engine = getEngine();
        const order = engine.resolveClaim(orderId, claimId, resolution, compensationKobo, get().activeCustomerId, get().currentRole);
        const snap = engineSnapshot(engine);
        set({ orders: snap.orders });
        return order;
      },

      // --- Notifications ---
      sendNotification(orderId, channel, message) {
        const engine = getEngine();
        const order = engine.sendNotification(orderId, channel, message);
        const snap = engineSnapshot(engine);
        set({ orders: snap.orders });
        return order;
      },

      // --- Driver ---
      assignDriver(orderId, driverId) {
        const engine = getEngine();
        const order = engine.assignDriver(orderId, driverId, get().activeCustomerId, get().currentRole);
        const snap = engineSnapshot(engine);
        set((s) => ({
          orders: snap.orders,
          challengeSteps: { ...s.challengeSteps, deliveryAssigned: true },
        }));
        return order;
      },

      // --- Reports ---
      getReport() {
        return getEngine().generateReport();
      },

      getDelayedOrders() {
        return getEngine().getDelayedOrders();
      },

      getInventoryAlerts() {
        return getEngine().getInventoryAlerts();
      },

      // --- Challenge ---
      startChallenge() {
        set({
          challengeActive: true,
          challengeStartTime: Date.now(),
          challengeElapsedSeconds: 0,
          challengeCompleted: false,
          challengeSteps: {
            orderCreated: false,
            itemScanned: false,
            markedReady: false,
            deliveryAssigned: false,
            orderClosed: false,
          },
        });
      },

      stopChallenge() {
        const steps = get().challengeSteps;
        const completed = Object.values(steps).every(Boolean);
        set({ challengeActive: false, challengeCompleted: completed });
      },

      tickChallenge() {
        const { challengeStartTime, challengeActive } = get();
        if (!challengeActive || !challengeStartTime) return;
        set({ challengeElapsedSeconds: Math.floor((Date.now() - challengeStartTime) / 1000) });
      },
    }),
    {
      name: LAUNDRY_STORAGE_KEY,
      storage: createJSONStorage(() => {
        if (
          typeof window !== 'undefined' &&
          window.localStorage &&
          typeof window.localStorage.setItem === 'function'
        ) {
          return window.localStorage;
        }
        const memoryMap = new Map<string, string>();
        return {
          getItem: (key: string) => memoryMap.get(key) ?? null,
          setItem: (key: string, val: string) => { memoryMap.set(key, val); },
          removeItem: (key: string) => { memoryMap.delete(key); },
        };
      }),
      // Only persist UI-level state, not the engine (it's re-seeded)
      partialize: (state) => ({
        currentRole: state.currentRole,
        activeCustomerId: state.activeCustomerId,
        challengeCompleted: state.challengeCompleted,
      }),
    }
  )
);
