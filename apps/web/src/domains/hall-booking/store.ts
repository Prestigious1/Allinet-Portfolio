'use client';

import { create } from 'zustand';
import {
  HallBookingEngine,
  Hall,
  AddOn,
  PromoCode,
  Customer,
  Booking,
  UserRole,
  SlotType,
} from './engine';
import { getLagosInitialState } from './fixtures';
import { useAchievementsStore } from '@/store/achievements.store';

export const STORAGE_KEY = 'allinet_hall_booking_sandbox_v1';

interface HallBookingStoreState {
  halls: Hall[];
  addOns: AddOn[];
  promos: PromoCode[];
  customers: Customer[];
  bookings: Booking[];
  currentRole: UserRole;
  activeCustomer: Customer;
  challengeActive: boolean;
  challengeStartTime: number | null;
  challengeElapsedSeconds: number;
  challengeCompleted: boolean;
  challengeSteps: {
    bookingCreated: boolean;
    promoApplied: boolean;
    noShowTriggered: boolean;
    appealResolved: boolean;
  };

  // Actions
  setRole: (role: UserRole) => void;
  setActiveCustomer: (customer: Customer) => void;
  resetSandbox: () => void;
  createBooking: (params: {
    hallId: string;
    startIso: string;
    endIso: string;
    guestCount: number;
    slotType?: SlotType;
    addOnIds?: string[];
    promoCode?: string;
  }) => Booking;
  confirmDeposit: (bookingId: string, amountPaidKobo: number) => Booking;
  cancelBooking: (bookingId: string, reason: string) => { booking: Booking; refundKobo: number };
  markNoShow: (bookingId: string) => Booking;
  submitAppeal: (bookingId: string, reason: string) => Booking;
  resolveAppeal: (bookingId: string, outcome: 'upheld' | 'forgiven', notes?: string) => Booking;
  startChallenge: () => void;
  stopChallenge: () => void;
}

function getInitialData() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.halls && parsed.bookings) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
  }
  return getLagosInitialState();
}

function persistState(state: {
  halls: Hall[];
  addOns: AddOn[];
  promos: PromoCode[];
  customers: Customer[];
  bookings: Booking[];
}) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          halls: state.halls,
          addOns: state.addOns,
          promos: state.promos,
          customers: state.customers,
          bookings: state.bookings,
        })
      );
    } catch {
      // storage error
    }
  }
}

export const useHallBookingStore = create<HallBookingStoreState>((set, get) => {
  const initial = getInitialData();
  const defaultCustomer = initial.customers[0];

  return {
    halls: initial.halls,
    addOns: initial.addOns,
    promos: initial.promos,
    customers: initial.customers,
    bookings: initial.bookings,
    currentRole: 'customer',
    activeCustomer: defaultCustomer,
    challengeActive: false,
    challengeStartTime: null,
    challengeElapsedSeconds: 0,
    challengeCompleted: false,
    challengeSteps: {
      bookingCreated: false,
      promoApplied: false,
      noShowTriggered: false,
      appealResolved: false,
    },

    setRole: (role) => set({ currentRole: role }),

    setActiveCustomer: (customer) => set({ activeCustomer: customer }),

    resetSandbox: () => {
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch {}
      }
      const fresh = getLagosInitialState();
      set({
        halls: fresh.halls,
        addOns: fresh.addOns,
        promos: fresh.promos,
        customers: fresh.customers,
        bookings: fresh.bookings,
        currentRole: 'customer',
        activeCustomer: fresh.customers[0],
        challengeActive: false,
        challengeStartTime: null,
        challengeElapsedSeconds: 0,
        challengeCompleted: false,
        challengeSteps: {
          bookingCreated: false,
          promoApplied: false,
          noShowTriggered: false,
          appealResolved: false,
        },
      });
    },

    createBooking: (params) => {
      const state = get();
      const engine = new HallBookingEngine({
        halls: state.halls,
        addOns: state.addOns,
        promos: state.promos,
        customers: state.customers,
        bookings: state.bookings,
      });

      const newId = `bk-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      const booking = engine.createBooking({
        id: newId,
        hallId: params.hallId,
        customerId: state.activeCustomer.id,
        startIso: params.startIso,
        endIso: params.endIso,
        guestCount: params.guestCount,
        slotType: params.slotType,
        addOnIds: params.addOnIds,
        promoCode: params.promoCode,
        role: state.currentRole,
      });

      const updatedBookings = [booking, ...state.bookings];
      const updatedCustomers = engine.getCustomer(state.activeCustomer.id)
        ? state.customers.map((c) =>
            c.id === state.activeCustomer.id
              ? engine.getCustomer(state.activeCustomer.id)!
              : c
          )
        : state.customers;

      const promoUsed = Boolean(params.promoCode);
      const isChallengeStep = state.challengeActive && !state.challengeCompleted;
      const updatedSteps = {
        ...state.challengeSteps,
        bookingCreated: isChallengeStep ? true : state.challengeSteps.bookingCreated,
        promoApplied: isChallengeStep && promoUsed ? true : state.challengeSteps.promoApplied,
      };

      set({
        bookings: updatedBookings,
        customers: updatedCustomers,
        challengeSteps: updatedSteps,
      });

      persistState({
        halls: state.halls,
        addOns: state.addOns,
        promos: state.promos,
        customers: updatedCustomers,
        bookings: updatedBookings,
      });

      return booking;
    },

    confirmDeposit: (bookingId, amountPaidKobo) => {
      const state = get();
      const engine = new HallBookingEngine({
        halls: state.halls,
        addOns: state.addOns,
        promos: state.promos,
        customers: state.customers,
        bookings: state.bookings,
      });

      // Simulated payment gateway acts with settlement authority
      const role = state.currentRole === 'customer' ? 'front_desk' : state.currentRole;

      const confirmed = engine.confirmDeposit({
        bookingId,
        amountPaidKobo,
        role,
      });

      const updatedBookings = state.bookings.map((b) =>
        b.id === bookingId ? confirmed : b
      );

      set({ bookings: updatedBookings });
      persistState({
        halls: state.halls,
        addOns: state.addOns,
        promos: state.promos,
        customers: state.customers,
        bookings: updatedBookings,
      });

      // Unlock "Event Master" achievement upon booking confirmation
      useAchievementsStore.getState().unlockAchievement('event-master');

      return confirmed;
    },

    cancelBooking: (bookingId, reason) => {
      const state = get();
      const engine = new HallBookingEngine({
        halls: state.halls,
        addOns: state.addOns,
        promos: state.promos,
        customers: state.customers,
        bookings: state.bookings,
      });

      const res = engine.cancelBooking({
        bookingId,
        reason,
        role: state.currentRole,
      });

      const updatedBookings = state.bookings.map((b) =>
        b.id === bookingId ? res.booking : b
      );

      set({ bookings: updatedBookings });
      persistState({
        halls: state.halls,
        addOns: state.addOns,
        promos: state.promos,
        customers: state.customers,
        bookings: updatedBookings,
      });

      return res;
    },

    markNoShow: (bookingId) => {
      const state = get();
      const engine = new HallBookingEngine({
        halls: state.halls,
        addOns: state.addOns,
        promos: state.promos,
        customers: state.customers,
        bookings: state.bookings,
      });

      const updatedBooking = engine.markNoShow({
        bookingId,
        role: state.currentRole,
      });

      const updatedBookings = state.bookings.map((b) =>
        b.id === bookingId ? updatedBooking : b
      );

      const customer = engine.getCustomer(updatedBooking.customerId);
      const updatedCustomers = customer
        ? state.customers.map((c) => (c.id === customer.id ? customer : c))
        : state.customers;

      const isChallengeStep = state.challengeActive && !state.challengeCompleted;
      const updatedSteps = {
        ...state.challengeSteps,
        noShowTriggered: isChallengeStep ? true : state.challengeSteps.noShowTriggered,
      };

      set({
        bookings: updatedBookings,
        customers: updatedCustomers,
        challengeSteps: updatedSteps,
      });

      persistState({
        halls: state.halls,
        addOns: state.addOns,
        promos: state.promos,
        customers: updatedCustomers,
        bookings: updatedBookings,
      });

      return updatedBooking;
    },

    submitAppeal: (bookingId, reason) => {
      const state = get();
      const engine = new HallBookingEngine({
        halls: state.halls,
        addOns: state.addOns,
        promos: state.promos,
        customers: state.customers,
        bookings: state.bookings,
      });

      const updatedBooking = engine.submitAppeal({
        bookingId,
        reason,
        role: state.currentRole,
      });

      const updatedBookings = state.bookings.map((b) =>
        b.id === bookingId ? updatedBooking : b
      );

      set({ bookings: updatedBookings });
      persistState({
        halls: state.halls,
        addOns: state.addOns,
        promos: state.promos,
        customers: state.customers,
        bookings: updatedBookings,
      });

      return updatedBooking;
    },

    resolveAppeal: (bookingId, outcome, notes) => {
      const state = get();
      const engine = new HallBookingEngine({
        halls: state.halls,
        addOns: state.addOns,
        promos: state.promos,
        customers: state.customers,
        bookings: state.bookings,
      });

      const updatedBooking = engine.resolveAppeal({
        bookingId,
        outcome,
        notes,
        role: state.currentRole,
      });

      const updatedBookings = state.bookings.map((b) =>
        b.id === bookingId ? updatedBooking : b
      );

      const customer = engine.getCustomer(updatedBooking.customerId);
      const updatedCustomers = customer
        ? state.customers.map((c) => (c.id === customer.id ? customer : c))
        : state.customers;

      const isChallengeStep = state.challengeActive && !state.challengeCompleted;
      const updatedSteps = {
        ...state.challengeSteps,
        appealResolved: isChallengeStep ? true : state.challengeSteps.appealResolved,
      };

      // Check if all challenge steps are completed under 60 seconds
      let challengeCompleted = false;
      let elapsedSeconds = state.challengeElapsedSeconds;
      if (
        isChallengeStep &&
        updatedSteps.bookingCreated &&
        updatedSteps.promoApplied &&
        updatedSteps.noShowTriggered &&
        updatedSteps.appealResolved &&
        state.challengeStartTime
      ) {
        elapsedSeconds = Math.round((Date.now() - state.challengeStartTime) / 1000);
        if (elapsedSeconds <= 60) {
          challengeCompleted = true;
        }
      }

      set({
        bookings: updatedBookings,
        customers: updatedCustomers,
        challengeSteps: updatedSteps,
        challengeCompleted,
        challengeElapsedSeconds: elapsedSeconds,
      });

      persistState({
        halls: state.halls,
        addOns: state.addOns,
        promos: state.promos,
        customers: updatedCustomers,
        bookings: updatedBookings,
      });

      if (challengeCompleted) {
        useAchievementsStore.getState().unlockAchievement('operations-controller');
      }
      if (outcome === 'forgiven') {
        useAchievementsStore.getState().unlockAchievement('crisis-averted');
      }

      return updatedBooking;
    },

    startChallenge: () => {
      set({
        challengeActive: true,
        challengeStartTime: Date.now(),
        challengeElapsedSeconds: 0,
        challengeCompleted: false,
        challengeSteps: {
          bookingCreated: false,
          promoApplied: false,
          noShowTriggered: false,
          appealResolved: false,
        },
      });
    },

    stopChallenge: () => {
      set({ challengeActive: false, challengeStartTime: null });
    },
  };
});
