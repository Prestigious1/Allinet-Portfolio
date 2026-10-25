'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { DemoShell } from '@/components/demos/DemoShell';
import { useLaundryStore, LAUNDRY_STORAGE_KEY } from '@/domains/laundry/store';
import type {
  Order,
  OrderStatus,
  ServiceType,
} from '@/domains/laundry/engine';
import { SEED_CUSTOMERS } from '@/domains/laundry/fixtures';

// ---------------------------------------------------------------------------
// Helpers & Constants
// ---------------------------------------------------------------------------

function formatKobo(kobo: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(kobo / 100);
}

const KANBAN_STAGES: { status: OrderStatus; label: string; color: string; icon: string }[] = [
  { status: 'received',         label: 'Received',         color: '#6b7280', icon: '📦' },
  { status: 'sorted',           label: 'Sorted',           color: '#3b82f6', icon: '🗂️' },
  { status: 'in_progress',      label: 'In Progress',      color: '#f59e0b', icon: '🧺' },
  { status: 'ready_for_pickup', label: 'Ready',            color: '#10b981', icon: '✅' },
  { status: 'out_for_delivery', label: 'Out for Delivery', color: '#8b5cf6', icon: '🚚' },
];

const SERVICE_LABELS: Record<ServiceType, string> = {
  wash: 'Wash',
  dry_cleaning: 'Dry Cleaning',
  ironing: 'Ironing',
  folding: 'Folding',
  repairs: 'Repairs',
  wash_and_fold: 'Wash & Fold',
  express_wash: 'Express Wash',
};


const VALID_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus>> = {
  received: 'sorted',
  sorted: 'in_progress',
  in_progress: 'ready_for_pickup',
  ready_for_pickup: 'out_for_delivery',
  out_for_delivery: 'delivered',
};

const WALKTHROUGH_STEPS = [
  {
    title: 'Rapid Order Intake',
    description: 'Use the "+ New Intake" button to log a new customer order in seconds with garment presets.',
  },
  {
    title: 'QR Bag Tag Generator',
    description: 'Click the 🏷️ icon on any Kanban card to generate a scannable QR bag tag for garment tracking.',
    tip: 'Each QR code is deterministic from the order ID and can be printed.',
  },
  {
    title: 'Kanban Stage Manager',
    description: 'Drag orders across columns to advance their stage. Customer tracking updates instantly.',
    tip: 'Try dragging LND-1042 from "In Progress" to "Ready for Pickup".',
  },
  {
    title: 'Delayed Order Alerts',
    description: 'Red-flagged cards and the alert banner highlight orders that are past their expected stage duration.',
  },
  {
    title: 'Operations Report',
    description: 'The metrics panel at the top gives you live revenue, active orders, and inventory alerts.',
  },
];

function isDelayed(order: Order): boolean {
  const createdAt = new Date(order.createdAt).getTime();
  const now = Date.now();
  const ageHours = (now - createdAt) / 3_600_000;
  const delayThresholds: Partial<Record<OrderStatus, number>> = {
    received: 2, sorted: 4, in_progress: 24, ready_for_pickup: 48,
  };
  const threshold = delayThresholds[order.status];
  return threshold !== undefined && ageHours > threshold;
}

// ---------------------------------------------------------------------------
// QR Code Generator (pure SVG, no external library)
// ---------------------------------------------------------------------------

function generateQRPattern(text: string): boolean[][] {
  const size = 21;
  const grid: boolean[][] = Array.from({ length: size }, () =>
    new Array(size).fill(false) as boolean[]
  );

  const drawFinder = (row: number, col: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        grid[row + r][col + c] =
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4);
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(0, 14);
  drawFinder(14, 0);

  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) & 0x7fffffff;
  }
  for (let r = 8; r < size - 8; r++) {
    for (let c = 8; c < size - 8; c++) {
      hash = ((hash * 1664525 + 1013904223) >>> 0);
      grid[r][c] = (hash & 1) === 1;
    }
  }
  for (let r = 0; r < 8; r++) {
    for (let c = 8; c < size - 8; c++) {
      if (!grid[r][c]) {
        hash = ((hash * 22695477 + 1) >>> 0);
        grid[r][c] = (hash & 1) === 1;
      }
    }
  }
  for (let r = 8; r < size - 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (!grid[r][c]) {
        hash = ((hash * 1664525 + 1013904223) >>> 0);
        grid[r][c] = (hash & 1) === 1;
      }
    }
  }
  return grid;
}

function QRCodeSVG({ orderId }: { orderId: string }) {
  const pattern = generateQRPattern(orderId);
  const cellSize = 6;
  const size = pattern.length;

  return (
    <svg
      width={size * cellSize}
      height={size * cellSize}
      viewBox={`0 0 ${size * cellSize} ${size * cellSize}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
      aria-label={`QR code for order ${orderId}`}
    >
      <rect width="100%" height="100%" fill="white" />
      {pattern.flatMap((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#0f172a"
            />
          ) : null
        )
      )}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Bag Tag Modal
// ---------------------------------------------------------------------------

function BagTagModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const customer = SEED_CUSTOMERS.find((c) => c.id === order.customerId);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: '16px', padding: '32px',
          maxWidth: '340px', width: '100%',
          fontFamily: 'monospace', color: '#0f172a',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', color: '#6b7280', marginBottom: '4px' }}>
            ALLINET LAUNDRY OPERATIONS
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a' }}>
            #{order.id}
          </div>
          {order.isExpress && (
            <div style={{
              display: 'inline-block', marginTop: '6px',
              background: '#f59e0b', color: '#0f172a',
              padding: '2px 12px', borderRadius: '99px',
              fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em',
            }}>
              ⚡ EXPRESS
            </div>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{ border: '2px solid #0f172a', borderRadius: '8px', padding: '8px' }}>
            <QRCodeSVG orderId={order.id} />
          </div>
        </div>
        <div style={{ borderTop: '1px dashed #9ca3af', paddingTop: '16px', fontSize: '12px', lineHeight: 1.7 }}>
          <div><strong>Customer:</strong> {customer?.name ?? order.customerId}</div>
          <div><strong>Branch:</strong> {order.branchId}</div>
          <div><strong>Items:</strong> {order.items.length} garments</div>
          <div><strong>Services:</strong> {order.services.map((s) => SERVICE_LABELS[s]).join(', ')}</div>
          <div><strong>Created:</strong> {new Date(order.createdAt).toLocaleDateString('en-NG')}</div>
        </div>
        <button
          id="bag-tag-close-btn"
          onClick={onClose}
          style={{
            marginTop: '20px', width: '100%',
            background: '#0f172a', color: '#fff',
            border: 'none', borderRadius: '8px',
            padding: '10px', fontSize: '13px',
            fontWeight: 700, cursor: 'pointer',
          }}
        >
          Close / Print
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Kanban Card
// ---------------------------------------------------------------------------

function KanbanCard({
  order,
  onDragStart,
  onDragEnd,
  onViewTag,
  isDragging,
}: {
  order: Order;
  onDragStart: (orderId: string) => void;
  onDragEnd: () => void;
  onViewTag: (order: Order) => void;
  isDragging: boolean;
}) {
  const customer = SEED_CUSTOMERS.find((c) => c.id === order.customerId);
  const delayed = isDelayed(order);
  const nextStatus = VALID_TRANSITIONS[order.status];

  return (
    <div
      id={`kanban-card-${order.id}`}
      draggable
      onDragStart={() => onDragStart(order.id)}
      onDragEnd={onDragEnd}
      style={{
        background: isDragging
          ? 'rgba(59,130,246,0.15)'
          : 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.9))',
        border: delayed
          ? '1px solid rgba(239,68,68,0.6)'
          : '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '14px',
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        transition: 'all 0.2s ease',
        marginBottom: '8px',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#f1f5f9', fontFamily: 'monospace' }}>
            {order.id}
          </span>
          {order.isExpress && (
            <span style={{
              fontSize: '9px', fontWeight: 800, padding: '1px 6px',
              background: '#f59e0b22', color: '#f59e0b',
              border: '1px solid #f59e0b44', borderRadius: '6px',
              letterSpacing: '0.08em',
            }}>
              ⚡ EXPRESS
            </span>
          )}
          {delayed && (
            <span style={{
              fontSize: '9px', fontWeight: 800, padding: '1px 6px',
              background: '#ef444422', color: '#f87171',
              border: '1px solid #ef444444', borderRadius: '6px',
            }}>
              ⚠ DELAYED
            </span>
          )}
        </div>
        <button
          id={`qr-btn-${order.id}`}
          onClick={(e) => { e.stopPropagation(); onViewTag(order); }}
          title="View bag tag / QR code"
          style={{
            background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '6px', padding: '2px 6px', cursor: 'pointer',
            fontSize: '12px', color: '#9ca3af',
          }}
        >
          🏷️
        </button>
      </div>

      <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '6px' }}>
        {customer?.name ?? order.customerId} · {order.items.length} items
      </div>
      <div style={{ fontSize: '12px', color: '#60a5fa', fontWeight: 600, marginBottom: '6px' }}>
        {formatKobo(order.totalKobo)}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
        {order.services.slice(0, 3).map((svc) => (
          <span key={svc} style={{
            fontSize: '9px', padding: '2px 6px', borderRadius: '4px',
            background: 'rgba(59,130,246,0.12)', color: '#93c5fd',
            border: '1px solid rgba(59,130,246,0.2)',
          }}>
            {SERVICE_LABELS[svc]}
          </span>
        ))}
        {order.services.length > 3 && (
          <span style={{ fontSize: '9px', color: '#6b7280' }}>+{order.services.length - 3}</span>
        )}
      </div>

      {nextStatus && (
        <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>
          Drag → {nextStatus.replace(/_/g, ' ')}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Kanban Column
// ---------------------------------------------------------------------------

function KanbanColumn({
  stage,
  orders,
  draggingId,
  onDragStart,
  onDragEnd,
  onDrop,
  onViewTag,
}: {
  stage: typeof KANBAN_STAGES[number];
  orders: Order[];
  draggingId: string | null;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDrop: (targetStatus: OrderStatus) => void;
  onViewTag: (order: Order) => void;
}) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      id={`kanban-col-${stage.status}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={() => { setDragOver(false); onDrop(stage.status); }}
      style={{
        minWidth: '210px',
        flex: '1 1 210px',
        background: dragOver ? 'rgba(59,130,246,0.08)' : 'rgba(15,23,42,0.6)',
        border: dragOver ? '2px dashed rgba(59,130,246,0.6)' : '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px',
        padding: '16px',
        transition: 'all 0.15s ease',
      }}
    >
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '16px' }}>{stage.icon}</span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0' }}>{stage.label}</span>
          <span style={{
            marginLeft: 'auto', fontSize: '11px', fontWeight: 700,
            background: `${stage.color}22`, color: stage.color,
            border: `1px solid ${stage.color}44`,
            borderRadius: '10px', padding: '1px 8px',
          }}>
            {orders.length}
          </span>
        </div>
        <div style={{ height: '2px', background: stage.color, borderRadius: '2px', opacity: 0.6 }} />
      </div>

      {orders.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '20px 8px',
          color: '#4b5563', fontSize: '12px', fontStyle: 'italic',
        }}>
          Drop orders here
        </div>
      ) : (
        orders.map((order) => (
          <KanbanCard
            key={order.id}
            order={order}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onViewTag={onViewTag}
            isDragging={draggingId === order.id}
          />
        ))
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Rapid Intake Form
// ---------------------------------------------------------------------------

const GARMENT_PRESETS = [
  { category: 'shirt',   desc: 'Shirt',          svc: ['wash', 'ironing'] as ServiceType[],      priceKobo: 25_000 },
  { category: 'trouser', desc: 'Trouser',         svc: ['ironing', 'folding'] as ServiceType[],  priceKobo: 20_000 },
  { category: 'native',  desc: 'Native (Agbada)', svc: ['dry_cleaning'] as ServiceType[],        priceKobo: 140_000 },
  { category: 'suit',    desc: 'Business Suit',   svc: ['dry_cleaning'] as ServiceType[],        priceKobo: 200_000 },
  { category: 'bedsheet',desc: 'Bedsheet',        svc: ['wash_and_fold'] as ServiceType[],       priceKobo: 40_000 },
  { category: 'dress',   desc: 'Dress',           svc: ['dry_cleaning'] as ServiceType[],        priceKobo: 80_000 },
];

interface IntakeItem {
  category: string;
  description: string;
  quantity: number;
  services: ServiceType[];
  priceKobo: number;
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(15,23,42,0.8)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '8px',
  padding: '8px 10px',
  color: '#e2e8f0',
  fontSize: '13px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(15,23,42,0.8)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '8px',
  padding: '8px 10px',
  color: '#e2e8f0',
  fontSize: '13px',
  boxSizing: 'border-box' as const,
};

function RapidIntakeForm({ onClose }: { onClose: () => void }) {
  const [customerId, setCustomerId] = useState('cust-folake');
  const [branchId, setBranchId] = useState('branch-vi');
  const [isExpress, setIsExpress] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [items, setItems] = useState<IntakeItem[]>([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const { createOrder, transitionOrder, setRole } = useLaundryStore();

  const addPreset = (preset: typeof GARMENT_PRESETS[number]) => {
    setItems((prev) => [
      ...prev,
      { category: preset.category, description: preset.desc, quantity: 1, services: preset.svc, priceKobo: preset.priceKobo },
    ]);
  };

  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));
  const updateQty = (index: number, qty: number) =>
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, quantity: Math.max(1, qty) } : item));

  const total = items.reduce((sum, item) => sum + item.priceKobo * item.quantity, 0);

  const handleSubmit = () => {
    if (items.length === 0) { setError('Add at least one garment item.'); return; }
    setError('');
    try {
      setRole('staff');
      const allServices = [...new Set(items.flatMap((i) => i.services))] as ServiceType[];
      const newOrder = createOrder({
        customerId, branchId,
        items: items.map((i) => ({
          categoryId: i.category, description: i.description,
          quantity: i.quantity, services: i.services, priceKobo: i.priceKobo,
        })),
        services: allServices,
        isExpress,
        promoCode: promoCode || undefined,
      });
      transitionOrder(newOrder.id, 'received');
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order.');
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
        <div style={{ fontSize: '18px', fontWeight: 700, color: '#34d399' }}>Order Created!</div>
        <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '8px' }}>Closing intake form…</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Customer</label>
          <select id="intake-customer-select" value={customerId} onChange={(e) => setCustomerId(e.target.value)} style={selectStyle}>
            {SEED_CUSTOMERS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Branch</label>
          <select id="intake-branch-select" value={branchId} onChange={(e) => setBranchId(e.target.value)} style={selectStyle}>
            <option value="branch-vi">Victoria Island</option>
            <option value="branch-lekki">Lekki Phase 1</option>
            <option value="branch-ikeja">Ikeja</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            id="intake-express-toggle"
            type="checkbox"
            checked={isExpress}
            onChange={(e) => setIsExpress(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: '#f59e0b', cursor: 'pointer' }}
          />
          <label htmlFor="intake-express-toggle" style={{ fontSize: '13px', color: '#f59e0b', fontWeight: 600, cursor: 'pointer' }}>
            ⚡ Express (+50%)
          </label>
        </div>
        <div>
          <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Promo Code</label>
          <input
            id="intake-promo-input"
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="e.g. FIRSTWASH"
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '8px' }}>Quick Add Garments</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {GARMENT_PRESETS.map((preset) => (
            <button
              key={preset.category}
              id={`intake-add-${preset.category}`}
              onClick={() => addPreset(preset)}
              style={{
                padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
                background: 'rgba(59,130,246,0.12)', color: '#93c5fd',
                border: '1px solid rgba(59,130,246,0.25)', fontSize: '12px', fontWeight: 600,
              }}
            >
              + {preset.desc}
            </button>
          ))}
        </div>
      </div>

      {items.length > 0 && (
        <div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '8px' }}>
            Order Items ({items.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {items.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: 'rgba(15,23,42,0.7)', borderRadius: '8px',
                  padding: '8px 12px', border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span style={{ flex: 1, fontSize: '13px', color: '#e2e8f0' }}>{item.description}</span>
                <input
                  type="number" min={1} max={20}
                  value={item.quantity}
                  onChange={(e) => updateQty(i, parseInt(e.target.value) || 1)}
                  style={{ ...inputStyle, width: '54px', textAlign: 'center', padding: '4px 6px' }}
                />
                <span style={{ fontSize: '12px', color: '#60a5fa', fontFamily: 'monospace', minWidth: '70px' }}>
                  {formatKobo(item.priceKobo * item.quantity)}
                </span>
                <button
                  onClick={() => removeItem(i)}
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'right', marginTop: '10px', fontSize: '14px', fontWeight: 700, color: '#34d399', fontFamily: 'monospace' }}>
            Est: {formatKobo(total)}{isExpress ? ` → Express: ${formatKobo(Math.round(total * 1.5))}` : ''}
          </div>
        </div>
      )}

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#f87171',
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          id="intake-submit-btn"
          onClick={handleSubmit}
          style={{
            flex: 1, padding: '12px', borderRadius: '10px', cursor: 'pointer',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            border: 'none', color: '#fff', fontSize: '14px', fontWeight: 700,
          }}
        >
          Create Order
        </button>
        <button
          id="intake-cancel-btn"
          onClick={onClose}
          style={{
            padding: '12px 20px', borderRadius: '10px', cursor: 'pointer',
            background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
            color: '#9ca3af', fontSize: '14px',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Delayed Orders Alert Banner
// ---------------------------------------------------------------------------

function DelayedOrdersBanner({ orders }: { orders: Order[] }) {
  if (orders.length === 0) return null;
  return (
    <div
      id="delayed-orders-banner"
      style={{
        background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.06))',
        border: '1px solid rgba(239,68,68,0.35)',
        borderRadius: '14px',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
      }}
    >
      <span style={{ fontSize: '22px' }}>⚠️</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#f87171', marginBottom: '6px' }}>
          {orders.length} Delayed Order{orders.length > 1 ? 's' : ''} Require Attention
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {orders.map((o) => {
            const customer = SEED_CUSTOMERS.find((c) => c.id === o.customerId);
            return (
              <span
                key={o.id}
                style={{
                  fontSize: '11px', fontFamily: 'monospace',
                  background: 'rgba(239,68,68,0.15)', color: '#fca5a5',
                  border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px',
                  padding: '2px 8px',
                }}
              >
                {o.id} · {customer?.name} · {o.status.replace(/_/g, ' ')}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Operations Metrics Panel
// ---------------------------------------------------------------------------

function OperationsPanel() {
  const { orders, getReport, getDelayedOrders, getInventoryAlerts } = useLaundryStore();
  const report = getReport();
  const alerts = getInventoryAlerts();
  const delayed = getDelayedOrders();
  const activeCount = orders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled' && o.status !== 'lost_damaged'
  ).length;
  const expressCount = orders.filter((o) => o.isExpress).length;

  const stats = [
    { label: 'Total Orders',   value: report.totalOrders,                              color: '#60a5fa' },
    { label: 'Revenue',        value: formatKobo(report.revenueKobo),                  color: '#34d399' },
    { label: 'Avg Turnaround', value: `${report.averageTurnaroundHours.toFixed(1)}h`, color: '#a78bfa' },
    { label: 'Active',         value: activeCount,                                     color: '#f59e0b' },
    { label: 'Express',        value: expressCount,                                    color: '#fb923c' },
    { label: 'Delayed',        value: delayed.length,                                  color: '#f87171' },
  ];

  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{
        fontSize: '11px', fontWeight: 700, color: '#6b7280',
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px',
      }}>
        Operations Overview
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: alerts.length > 0 ? '16px' : 0 }}>
        {stats.map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              background: 'rgba(15,23,42,0.7)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px', padding: '14px', textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '20px', fontWeight: 800, color, fontFamily: 'monospace' }}>{value}</div>
            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {alerts.length > 0 && (
        <div style={{
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: '10px', padding: '12px 16px',
        }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#fbbf24', marginBottom: '8px' }}>
            🔔 Inventory Alerts ({alerts.length})
          </div>
          {alerts.map((alert) => (
            <div key={alert.itemId} style={{ fontSize: '12px', color: '#d97706', lineHeight: 1.7 }}>
              <strong>{alert.name}</strong>: {alert.currentQty} left (reorder at {alert.threshold})
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Admin Page
// ---------------------------------------------------------------------------

export default function LaundryAdminPage() {
  const {
    orders,
    transitionOrder,
    resetSandbox,
    setRole,
    getDelayedOrders,
  } = useLaundryStore();

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [showIntake, setShowIntake] = useState(false);
  const [bagTagOrder, setBagTagOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    setRole('manager');
  }, [setRole]);

  const delayedOrders = getDelayedOrders();

  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const handleDrop = useCallback((targetStatus: OrderStatus) => {
    if (!draggingId) return;
    const order = orders.find((o) => o.id === draggingId);
    if (!order) return;

    const validNext = VALID_TRANSITIONS[order.status];
    if (validNext !== targetStatus) {
      showToast(
        `Cannot move ${draggingId} from "${order.status.replace(/_/g, ' ')}" → "${targetStatus.replace(/_/g, ' ')}".`,
        false
      );
      setDraggingId(null);
      return;
    }

    try {
      transitionOrder(draggingId, targetStatus);
      showToast(`✓ ${draggingId} → ${targetStatus.replace(/_/g, ' ')}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Transition failed.', false);
    }
    setDraggingId(null);
  }, [draggingId, orders, transitionOrder, showToast]);

  const kanbanOrders = KANBAN_STAGES.reduce<Record<OrderStatus, Order[]>>(
    (acc, stage) => {
      acc[stage.status] = orders.filter(
        (o) => o.status === stage.status
      );
      return acc;
    },
    {} as Record<OrderStatus, Order[]>
  );

  return (
    <DemoShell
      title="Laundry Operations Desk"
      badge="STAFF CONSOLE"
      subtitle="Kanban stage manager · Rapid intake · QR bag tags · Delayed-order alerts"
      storageKey={LAUNDRY_STORAGE_KEY}
      onReset={resetSandbox}
      walkthroughSteps={WALKTHROUGH_STEPS}
    >
      {/* Toast */}
      {toast && (
        <div
          id="admin-toast"
          style={{
            position: 'fixed', top: '80px', right: '24px', zIndex: 999,
            background: toast.ok ? 'rgba(16,185,129,0.95)' : 'rgba(239,68,68,0.95)',
            color: '#fff', padding: '12px 20px', borderRadius: '12px',
            fontSize: '13px', fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            animation: 'slideIn 0.2s ease',
            maxWidth: '320px',
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Bag Tag Modal */}
      {bagTagOrder && (
        <BagTagModal order={bagTagOrder} onClose={() => setBagTagOrder(null)} />
      )}

      {/* Intake Form Overlay */}
      {showIntake && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 900,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setShowIntake(false)}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(15,23,42,0.99), rgba(30,41,59,0.99))',
              border: '1px solid rgba(59,130,246,0.3)', borderRadius: '20px',
              padding: '32px', maxWidth: '580px', width: '100%',
              maxHeight: '90vh', overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#f1f5f9', marginBottom: '24px' }}>
              📋 Rapid Order Intake
            </div>
            <RapidIntakeForm onClose={() => setShowIntake(false)} />
          </div>
        </div>
      )}

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 4px' }}>
        {/* Action bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '12px', marginBottom: '28px',
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#f1f5f9' }}>
              Operations Desk
            </h1>
            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
              Victoria Island Branch · Manager Console
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              id="new-intake-btn"
              onClick={() => setShowIntake(true)}
              style={{
                padding: '10px 20px', borderRadius: '10px', cursor: 'pointer',
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                border: 'none', color: '#fff', fontSize: '14px', fontWeight: 700,
              }}
            >
              + New Intake
            </button>
          </div>
        </div>

        {/* Metrics */}
        <OperationsPanel />

        {/* Delayed Orders Alert */}
        <DelayedOrdersBanner orders={delayedOrders} />

        {/* Kanban Board */}
        <div style={{
          fontSize: '11px', fontWeight: 700, color: '#6b7280',
          textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px',
        }}>
          Stage Manager — Drag cards to advance order stage
        </div>
        <div
          id="kanban-board"
          style={{
            display: 'flex', gap: '12px',
            overflowX: 'auto', paddingBottom: '16px',
          }}
        >
          {KANBAN_STAGES.map((stage) => (
            <KanbanColumn
              key={stage.status}
              stage={stage}
              orders={kanbanOrders[stage.status] ?? []}
              draggingId={draggingId}
              onDragStart={(id) => setDraggingId(id)}
              onDragEnd={() => setDraggingId(null)}
              onDrop={handleDrop}
              onViewTag={(order) => setBagTagOrder(order)}
            />
          ))}
        </div>

        {/* Legend */}
        <div style={{
          marginTop: '24px', padding: '14px 18px',
          background: 'rgba(15,23,42,0.5)', borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.05)',
          fontSize: '12px', color: '#6b7280', lineHeight: 1.7,
        }}>
          <strong style={{ color: '#9ca3af' }}>Stage Transitions:</strong>{' '}
          Received → Sorted → In Progress → Ready for Pickup → Out for Delivery.
          Cards only move one step forward. Invalid drops show an error toast.
          The <a href="/demos/laundry" style={{ color: '#60a5fa', textDecoration: 'none' }}>
            Customer Tracker
          </a> reflects stage changes in real time.
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        select option { background: #1e293b; color: #e2e8f0; }
      `}</style>
    </DemoShell>
  );
}
