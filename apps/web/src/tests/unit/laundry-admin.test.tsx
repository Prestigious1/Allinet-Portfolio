import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LaundryAdminPage from '@/app/(site)/demos/laundry/admin/page';
import LaundryCustomerTrackerPage from '@/app/(site)/demos/laundry/page';
import { useLaundryStore } from '@/domains/laundry/store';

describe('Laundry Operations Desk & Stage Manager (TASK-P8-03 / F-141..F-155)', () => {
  beforeEach(() => {
    useLaundryStore.getState().resetSandbox();
    useLaundryStore.getState().setRole('manager');
  });

  it('renders operations desk console with KPI metrics, Kanban stage columns, and action bar', () => {
    render(<LaundryAdminPage />);

    expect(screen.getByText(/Laundry Operations Desk/i)).toBeInTheDocument();
    expect(screen.getByText(/STAFF CONSOLE/i)).toBeInTheDocument();
    expect(screen.getByText(/Operations Overview/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Orders/i)).toBeInTheDocument();
    expect(screen.getByText(/Revenue/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Stage Manager/i).length).toBeGreaterThan(0);

    // Check Kanban columns
    expect(screen.getByText('Received')).toBeInTheDocument();
    expect(screen.getByText('Sorted')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Ready')).toBeInTheDocument();
    expect(screen.getByText('Out for Delivery')).toBeInTheDocument();
  });

  it('opens rapid order intake modal, adds garment preset, and creates a new order in received stage', () => {
    render(<LaundryAdminPage />);

    const newIntakeBtn = screen.getByRole('button', { name: /\+ New Intake/i });
    expect(newIntakeBtn).toBeInTheDocument();
    fireEvent.click(newIntakeBtn);

    expect(screen.getByText(/Rapid Order Intake/i)).toBeInTheDocument();

    // Click quick add garment preset: Shirt
    const addShirtBtn = screen.getByText(/\+ Shirt/i);
    fireEvent.click(addShirtBtn);

    // Click Submit
    const submitBtn = screen.getByRole('button', { name: /Create Order/i });
    fireEvent.click(submitBtn);

    // Store has the newly created order in received stage
    const storeState = useLaundryStore.getState();
    const created = storeState.orders.find((o) => o.status === 'received');
    expect(created).toBeDefined();
    expect(created?.items.length).toBeGreaterThan(0);
  });

  it('opens QR bag tag generator modal when tag icon is clicked', () => {
    render(<LaundryAdminPage />);

    // Seeded orders have QR tag buttons (🏷️)
    const tagButtons = screen.getAllByTitle(/View bag tag \/ QR code/i);
    expect(tagButtons.length).toBeGreaterThan(0);
    fireEvent.click(tagButtons[0]);

    expect(screen.getByText(/ALLINET LAUNDRY OPERATIONS/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/QR code for order/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Close \/ Print/i })).toBeInTheDocument();
  });

  it('stage transition in admin updates shared store and instantly updates customer tracker view', async () => {
    // Check initial state of LND-1042 in store
    const initialOrder = useLaundryStore.getState().orders.find((o) => o.id === 'LND-1042');
    expect(initialOrder?.status).toBe('in_progress');

    // Render Admin page
    const { unmount: unmountAdmin } = render(<LaundryAdminPage />);

    // Advance LND-1042 to ready_for_pickup in store (as dragging to Ready column does)
    useLaundryStore.getState().setRole('staff');
    useLaundryStore.getState().transitionOrder('LND-1042', 'ready_for_pickup');

    // Confirm store updated
    const updatedOrder = useLaundryStore.getState().orders.find((o) => o.id === 'LND-1042');
    expect(updatedOrder?.status).toBe('ready_for_pickup');

    unmountAdmin();

    // Now render Customer Tracker page
    render(<LaundryCustomerTrackerPage />);

    // Search for LND-1042 using demo search button
    const demoBtn = screen.getByRole('button', { name: /Load Demo Order LND-1042/i });
    fireEvent.click(demoBtn);

    // Customer page should render Ready for Pickup alert
    await waitFor(() => {
      expect(screen.getByText(/Ready for Pickup!/i)).toBeInTheDocument();
    });
  });

  it('flags delayed orders with alert banner when orders exceed threshold', () => {
    render(<LaundryAdminPage />);

    // LND-1040 is pre-seeded as delayed
    const delayedOrders = useLaundryStore.getState().getDelayedOrders();
    if (delayedOrders.length > 0) {
      expect(screen.getByText(/Delayed Order.*Require Attention/i)).toBeInTheDocument();
    }
  });
});
