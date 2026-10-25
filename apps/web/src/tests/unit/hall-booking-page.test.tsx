import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HallBookingDemoPage from '@/app/(site)/demos/hall-booking/page';
import { useHallBookingStore } from '@/domains/hall-booking/store';

describe('Hall Booking Customer Flow (TASK-P7-04 / F-101..F-110)', () => {
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
    // Reset Zustand store state to fresh seed
    useHallBookingStore.getState().resetSandbox();
  });

  it('renders Lagos venue choices and initial instant quote', () => {
    render(<HallBookingDemoPage />);

    expect(
      screen.getByText(/Lagos Event Hall Booking Engine/i)
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/The Eko Grand Ballroom \(Victoria Island\)/i)[0]
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Total Venue Cost/i)
    ).toBeInTheDocument();
  });

  it('allows user to select venue, apply promo code, and complete reservation', () => {
    render(<HallBookingDemoPage />);

    // Select Lekki Pavilion
    const lekkiBtn = screen.getByText(/The Lekki Banquet Pavilion/i);
    fireEvent.click(lekkiBtn);

    // Apply promo code
    const promoInput = screen.getByPlaceholderText(/Enter code/i);
    fireEvent.change(promoInput, { target: { value: 'LAGOS2026' } });
    const applyBtn = screen.getByRole('button', { name: /apply/i });
    fireEvent.click(applyBtn);

    expect(screen.getByText(/Discount \(Promo Code: LAGOS2026\)/i)).toBeInTheDocument();

    // Click Reserve Venue
    const reserveBtn = screen.getByRole('button', {
      name: /Lock Reservation & Generate Hold/i,
    });
    fireEvent.click(reserveBtn);

    // Verifies acceptance criteria: User receives booking reference and hold ticket
    expect(screen.getByText(/Reservation Ticket Generated!/i)).toBeInTheDocument();
    expect(screen.getByText(/Ref: bk-/i)).toBeInTheDocument();
    expect(screen.getByText(/Simulate Instant Deposit Payment/i)).toBeInTheDocument();

    // Simulate instant deposit payment
    const payBtn = screen.getByRole('button', {
      name: /Simulate Instant Deposit Payment/i,
    });
    fireEvent.click(payBtn);

    expect(screen.getByText(/Booking Confirmed & Turnaround Buffers Locked!/i)).toBeInTheDocument();
  }, 15000);

  it('prevents reservation when turnaround conflict is detected', () => {
    render(<HallBookingDemoPage />);

    // Choose Grand Ballroom on 2026-11-12 which has a pre-seeded tech summit
    const dateInput = screen.getByLabelText(/Event Date/i);
    fireEvent.change(dateInput, { target: { value: '2026-11-12' } });

    // Morning slot overlaps with [08:00, 18:00) summit
    const morningBtn = screen.getByRole('button', { name: /morning/i });
    fireEvent.click(morningBtn);

    // Verify conflict warning appears and reserve button is disabled
    expect(screen.getByText(/Slot Unavailable:/i)).toBeInTheDocument();
    const reserveBtn = screen.getByRole('button', {
      name: /Lock Reservation & Generate Hold/i,
    });
    expect(reserveBtn).toBeDisabled();
  });
});
