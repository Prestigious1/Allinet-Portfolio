import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DemoShell } from './DemoShell';

describe('DemoShell Component (TASK-P7-03 / F-090..F-097)', () => {
  const mockStorageKey = 'test-demo-sandbox-v1';
  let resetSpy = vi.fn();
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
    resetSpy = vi.fn();
    storageMap.clear();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    localStorage.setItem(mockStorageKey, JSON.stringify({ test: 'dirty-state' }));
  });

  it('renders demo sandbox warning banner and title', () => {
    render(
      <DemoShell
        title="Event Operations Center"
        subtitle="Simulated real-time logistics"
        storageKey={mockStorageKey}
        onReset={resetSpy}
      >
        <div data-testid="child-content">Active Canvas</div>
      </DemoShell>
    );

    expect(screen.getByText(/DEMO SANDBOX — NO REAL CHARGES/i)).toBeInTheDocument();
    expect(screen.getByText('Event Operations Center')).toBeInTheDocument();
    expect(screen.getByText('Simulated real-time logistics')).toBeInTheDocument();
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('opens confirmation modal and clears localStorage when Reset is clicked and confirmed', () => {
    render(
      <DemoShell
        title="Event Operations Center"
        storageKey={mockStorageKey}
        onReset={resetSpy}
      >
        <div>Content</div>
      </DemoShell>
    );

    expect(localStorage.getItem(mockStorageKey)).toBeDefined();

    // Click "Reset Demo Data"
    const resetBtn = screen.getByRole('button', { name: /reset demo sandbox/i });
    fireEvent.click(resetBtn);

    // Modal appears
    expect(screen.getByText(/Reset Sandbox State\?/i)).toBeInTheDocument();

    // Confirm reset
    const confirmBtn = screen.getByRole('button', { name: /confirm reset/i });
    fireEvent.click(confirmBtn);

    // Verifies localStorage item removed and callback executed
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(mockStorageKey);
    expect(resetSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Demo sandbox reset to initial seed state/i)).toBeInTheDocument();
  });

  it('toggles guided walkthrough tour steps', () => {
    const steps = [
      { title: 'Browse Venues', description: 'Select a hall from the catalog' },
      { title: 'Check Turnaround', description: 'Inspect buffer times' },
    ];

    render(
      <DemoShell
        title="Event Operations Center"
        storageKey={mockStorageKey}
        onReset={resetSpy}
        walkthroughSteps={steps}
      >
        <div>Content</div>
      </DemoShell>
    );

    const tourBtn = screen.getByRole('button', { name: /toggle guided tour/i });
    expect(screen.queryByText(/Step 1 of 2/i)).not.toBeInTheDocument();

    // Open tour
    fireEvent.click(tourBtn);
    expect(screen.getByText(/Step 1 of 2:/i)).toBeInTheDocument();
    expect(screen.getByText('Browse Venues')).toBeInTheDocument();

    // Next step
    const nextBtn = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextBtn);
    expect(screen.getByText(/Step 2 of 2:/i)).toBeInTheDocument();
    expect(screen.getByText('Check Turnaround')).toBeInTheDocument();
  });

  it('displays challenge completion toast when challengeCompleted is true', () => {
    render(
      <DemoShell
        title="Event Operations Center"
        storageKey={mockStorageKey}
        onReset={resetSpy}
        challengeTitle="Operations Controller"
        challengeCompleted={true}
        challengeTimeSeconds={45}
      >
        <div>Content</div>
      </DemoShell>
    );

    expect(
      screen.getByText(/🏆 Challenge Completed: "Operations Controller" in 45s!/i)
    ).toBeInTheDocument();
  });
});
