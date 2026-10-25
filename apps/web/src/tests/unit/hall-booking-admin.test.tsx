import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HallBookingAdminPage from '@/app/(site)/demos/hall-booking/admin/page';
import { useHallBookingStore } from '@/domains/hall-booking/store';

describe('Hall Booking Operations Admin Dashboard (TASK-P7-05 / F-111..F-126)', () => {
  const storageMap = new Map<string, string>();
  const localStorageMock = {
    getItem: vi.fn((key: string) => storageMap.get(key) ?? null),
    setItem: vi.fn((key: string, val: string) => {
      storageMap.set(key, val);
    }),
    removeItem: vi.fn((key: string) => {
      storageMap.delete(key);
    }),
    clear: vi.fn(() => {
      storageMap.clear();
    }),
  };

  beforeEach(() => {
    storageMap.clear();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    useHallBookingStore.getState().resetSandbox();
    useHallBookingStore.getState().setRole('front_desk');
  });

  it('renders operational KPIs, role picker, and pre-seeded bookings table', () => {
    render(<HallBookingAdminPage />);

    expect(
      screen.getByText(/Hall Booking Operations Command Center/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Settled Deposits/i)).toBeInTheDocument();
    expect(screen.getByText(/Confirmed Bookings/i)).toBeInTheDocument();
    expect(screen.getByText(/Role:/i)).toBeInTheDocument();
  });

  it('allows staff to confirm deposit for pending booking and updates booking status to confirmed', () => {
    render(<HallBookingAdminPage />);

    // bk-holding-slot-sandbox is pre-seeded with status pending_deposit
    const confirmDepositBtn = screen.getByRole('button', {
      name: /Confirm Deposit/i,
    });
    expect(confirmDepositBtn).toBeInTheDocument();

    fireEvent.click(confirmDepositBtn);

    // Verify status updated to confirmed in the table
    const storeState = useHallBookingStore.getState();
    const sandboxBooking = storeState.bookings.find(
      (b) => b.id === 'bk-holding-slot-sandbox'
    );
    expect(sandboxBooking?.status).toBe('confirmed');
    expect(sandboxBooking?.depositPaid).toBe(true);
  });

  it('switches to turnaround calendar tab and displays venue buffer blocks', () => {
    render(<HallBookingAdminPage />);

    const calendarTab = screen.getByRole('button', {
      name: /Turnaround Calendar/i,
    });
    fireEvent.click(calendarTab);

    expect(
      screen.getByText(/Venue Turnaround Buffer Timetable/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/The Eko Grand Ballroom \(Victoria Island\)/i)
    ).toBeInTheDocument();
  });

  it('switches staff role between front-desk, manager, and auditor', () => {
    render(<HallBookingAdminPage />);

    const managerBtn = screen.getByRole('button', { name: /manager/i });
    fireEvent.click(managerBtn);

    expect(useHallBookingStore.getState().currentRole).toBe('manager');
  });

  it('triggers simulated WhatsApp reminder preview', () => {
    render(<HallBookingAdminPage />);

    // Switch to Simulated Dispatcher tab
    const notifsTab = screen.getByRole('button', {
      name: /Simulated Dispatcher/i,
    });
    fireEvent.click(notifsTab);

    const dispatchBtns = screen.getAllByRole('button', {
      name: /Dispatch Simulated WhatsApp/i,
    });
    fireEvent.click(dispatchBtns[0]);

    expect(
      screen.getByText(/\[SIMULATED DISPATCH\] Automated WhatsApp reminder dispatched/i)
    ).toBeInTheDocument();
  });
});
