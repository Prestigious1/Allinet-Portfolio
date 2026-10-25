'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { DemoShell } from '@/components/demos/DemoShell';
import { useLaundryStore, LAUNDRY_STORAGE_KEY } from '@/domains/laundry/store';
import type { Order, OrderStatus, ItemStage, ServiceType } from '@/domains/laundry/engine';

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------
// Note: metadata must be in the Server Component wrapper; this is client-side

// ---------------------------------------------------------------------------
// Helpers & Constants
// ---------------------------------------------------------------------------

const ORDER_STAGES: { status: OrderStatus; label: string; icon: string }[] = [
  { status: 'pickup_scheduled', label: 'Pickup Scheduled', icon: '📅' },
  { status: 'picked_up', label: 'Picked Up', icon: '🚗' },
  { status: 'received', label: 'Received', icon: '📦' },
  { status: 'sorted', label: 'Sorted', icon: '🗂️' },
  { status: 'in_progress', label: 'In Progress', icon: '🧺' },
  { status: 'ready_for_pickup', label: 'Ready for Pickup', icon: '✅' },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚' },
  { status: 'delivered', label: 'Delivered', icon: '🎉' },
];

const ITEM_STAGES: { stage: ItemStage; label: string }[] = [
  { stage: 'received', label: 'Received' },
  { stage: 'sorted', label: 'Sorted' },
  { stage: 'washing', label: 'Washing' },
  { stage: 'drying', label: 'Drying' },
  { stage: 'ironing', label: 'Ironing' },
  { stage: 'folding', label: 'Folding' },
  { stage: 'ready', label: 'Ready' },
  { stage: 'delivered', label: 'Delivered' },
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

function formatKobo(kobo: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(kobo / 100);
}

function getStageIndex(status: OrderStatus): number {
  const statusMap: Partial<Record<OrderStatus, number>> = {
    draft: -1,
    pickup_scheduled: 0,
    picked_up: 1,
    received: 2,
    sorted: 3,
    in_progress: 4,
    ready_for_pickup: 5,
    out_for_delivery: 6,
    delivered: 7,
  };
  return statusMap[status] ?? -1;
}

function getItemStageIndex(stage: ItemStage): number {
  return ITEM_STAGES.findIndex((s) => s.stage === stage);
}

function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case 'delivered': return '#10b981';
    case 'ready_for_pickup': return '#3b82f6';
    case 'out_for_delivery': return '#8b5cf6';
    case 'in_progress': return '#f59e0b';
    case 'cancelled': return '#ef4444';
    case 'lost_damaged': return '#dc2626';
    default: return '#6b7280';
  }
}

function getStatusBadgeStyle(status: OrderStatus): React.CSSProperties {
  const color = getStatusColor(status);
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    background: `${color}22`,
    color,
    border: `1px solid ${color}44`,
  };
}

const WALKTHROUGH_STEPS = [
  {
    title: 'Search Your Ticket',
    description: 'Enter your ticket number (e.g. LND-1042) in the search bar to track your order.',
    tip: 'Use the demo ticket LND-1042 to see a live in-progress order.',
  },
  {
    title: 'Live Step Progress',
    description: 'Watch your order move through each processing stage — from pickup through washing, drying, ironing and delivery.',
  },
  {
    title: 'Garment Checklist',
    description: 'See exactly which garments are in your order and what stage each individual item is at.',
  },
  {
    title: 'Ready Alert',
    description: 'When your order is ready for pickup or out for delivery, a prominent alert is shown at the top.',
  },
];

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function OrderProgressBar({ status }: { status: OrderStatus }) {
  const currentIdx = getStageIndex(status);
  const isCancelled = status === 'cancelled' || status === 'lost_damaged';

  if (isCancelled) {
    return (
      <div style={{ marginBottom: '24px' }}>
        <div
          style={{
            background: '#ef444422',
            border: '1px solid #ef444444',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
            color: '#ef4444',
            fontWeight: 600,
          }}
        >
          {status === 'cancelled' ? '❌ Order Cancelled' : '⚠️ Lost / Damaged — Claim In Review'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', paddingBottom: '8px' }}>
        {ORDER_STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isLast = idx === ORDER_STAGES.length - 1;
          const color = isCompleted || isCurrent ? '#3b82f6' : '#374151';
          return (
            <React.Fragment key={stage.status}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: '72px',
                  flex: '0 0 auto',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: isCompleted
                      ? 'linear-gradient(135deg, #3b82f6, #6366f1)'
                      : isCurrent
                        ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
                        : '#1f2937',
                    border: `2px solid ${color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    boxShadow: isCurrent ? `0 0 16px ${color}66` : 'none',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {isCompleted ? '✓' : stage.icon}
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    marginTop: '6px',
                    color: isCurrent ? '#f59e0b' : isCompleted ? '#3b82f6' : '#6b7280',
                    textAlign: 'center',
                    fontWeight: isCurrent ? 700 : 400,
                    maxWidth: '68px',
                    lineHeight: '1.3',
                  }}
                >
                  {stage.label}
                </span>
              </div>
              {!isLast && (
                <div
                  style={{
                    flex: 1,
                    height: '2px',
                    minWidth: '20px',
                    background: idx < currentIdx
                      ? 'linear-gradient(90deg, #3b82f6, #6366f1)'
                      : '#1f2937',
                    marginBottom: '20px',
                    transition: 'background 0.5s ease',
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function ItemStageChip({ stage }: { stage: ItemStage }) {
  const idx = getItemStageIndex(stage);
  const isReady = stage === 'ready' || stage === 'delivered';
  const color = isReady ? '#10b981' : stage === 'washing' || stage === 'drying' ? '#3b82f6' : '#6b7280';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 600,
        background: `${color}22`,
        color,
        border: `1px solid ${color}44`,
      }}
    >
      {stage === 'delivered' ? '✓ Delivered' : stage === 'ready' ? '✅ Ready' : ITEM_STAGES[idx]?.label ?? stage}
    </span>
  );
}

function ItemProgressBar({ stage }: { stage: ItemStage }) {
  const currentIdx = getItemStageIndex(stage);
  const pct = Math.round(((currentIdx + 1) / ITEM_STAGES.length) * 100);
  return (
    <div style={{ width: '100%', height: '4px', background: '#1f2937', borderRadius: '2px', overflow: 'hidden' }}>
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          background: stage === 'ready' || stage === 'delivered'
            ? 'linear-gradient(90deg, #10b981, #34d399)'
            : 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
          borderRadius: '2px',
          transition: 'width 0.6s ease',
        }}
      />
    </div>
  );
}

function ReadyAlert({ order }: { order: Order }) {
  if (order.status !== 'ready_for_pickup' && order.status !== 'out_for_delivery') return null;
  const isOutForDelivery = order.status === 'out_for_delivery';
  return (
    <div
      id="ready-alert"
      style={{
        background: isOutForDelivery
          ? 'linear-gradient(135deg, #7c3aed22, #4f46e522)'
          : 'linear-gradient(135deg, #05966922, #34d39922)',
        border: `1px solid ${isOutForDelivery ? '#7c3aed88' : '#10b98188'}`,
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        animation: 'pulse 2s infinite',
      }}
    >
      <div style={{ fontSize: '36px' }}>{isOutForDelivery ? '🚚' : '✅'}</div>
      <div>
        <div style={{ fontWeight: 700, fontSize: '18px', color: isOutForDelivery ? '#a78bfa' : '#34d399' }}>
          {isOutForDelivery ? 'Your Order is On the Way!' : 'Ready for Pickup!'}
        </div>
        <div style={{ fontSize: '14px', color: '#9ca3af', marginTop: '4px' }}>
          {isOutForDelivery
            ? 'Your laundry is out for delivery. Expect arrival shortly.'
            : "Your laundry is clean and ready. Head to our branch or we'll deliver to you."}
        </div>
      </div>
    </div>
  );
}

function ExpressBadge() {
  return (
    <span
      id="express-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 10px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.05em',
        background: 'linear-gradient(135deg, #f59e0b22, #ef444422)',
        color: '#f59e0b',
        border: '1px solid #f59e0b44',
        marginLeft: '8px',
      }}
    >
      ⚡ EXPRESS
    </span>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [expandedItems, setExpandedItems] = useState(true);
  const [expandedNotifs, setExpandedNotifs] = useState(false);

  return (
    <div
      id={`order-card-${order.id}`}
      style={{
        background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.95))',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: '20px',
        padding: '28px',
        marginBottom: '24px',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.01em' }}>
              Order #{order.id}
            </h2>
            {order.isExpress && <ExpressBadge />}
          </div>
          <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
            Created {new Date(order.createdAt).toLocaleDateString('en-NG', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
        </div>
        <div style={getStatusBadgeStyle(order.status)}>
          <span>{order.status.replace(/_/g, ' ')}</span>
        </div>
      </div>

      {/* Ready Alert */}
      <ReadyAlert order={order} />

      {/* Progress Bar */}
      <OrderProgressBar status={order.status} />

      {/* Price Summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '12px',
          background: 'rgba(15,23,42,0.6)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {[
          { label: 'Subtotal', value: formatKobo(order.subtotalKobo) },
          ...(order.expressSurchargeKobo > 0 ? [{ label: 'Express +50%', value: `+${formatKobo(order.expressSurchargeKobo)}` }] : []),
          ...(order.promoDiscountKobo > 0 ? [{ label: 'Promo', value: `-${formatKobo(order.promoDiscountKobo)}` }] : []),
          ...(order.loyaltyDiscountKobo > 0 ? [{ label: 'Loyalty', value: `-${formatKobo(order.loyaltyDiscountKobo)}` }] : []),
          { label: 'Total', value: formatKobo(order.totalKobo), bold: true },
          { label: 'Paid', value: formatKobo(order.paidKobo) },
        ].map((item, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              {item.label}
            </div>
            <div style={{ fontSize: '15px', fontWeight: (item as any).bold ? 700 : 500, color: '#e2e8f0', fontFamily: 'monospace' }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Services */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
          Services
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {order.services.map((svc) => (
            <span
              key={svc}
              style={{
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '12px',
                background: 'rgba(59,130,246,0.15)',
                color: '#93c5fd',
                border: '1px solid rgba(59,130,246,0.2)',
              }}
            >
              {SERVICE_LABELS[svc] ?? svc}
            </span>
          ))}
        </div>
      </div>

      {/* Items */}
      <div style={{ marginBottom: '16px' }}>
        <button
          id={`toggle-items-${order.id}`}
          onClick={() => setExpandedItems(!expandedItems)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0 0 12px 0',
            color: '#e2e8f0',
            fontSize: '14px',
            fontWeight: 600,
            width: '100%',
            textAlign: 'left',
          }}
        >
          <span>{expandedItems ? '▾' : '▸'}</span>
          Garment Checklist ({order.items.length} items)
        </button>

        {expandedItems && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {order.items.map((item) => (
              <div
                key={item.id}
                id={`item-${item.id}`}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px',
                  padding: '14px 16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>
                      {item.description}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                      Qty: {item.quantity} · {formatKobo(item.priceKobo)}
                    </div>
                    <div style={{ marginTop: '4px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {item.services.map((s) => (
                        <span key={s} style={{ fontSize: '10px', color: '#60a5fa', background: 'rgba(59,130,246,0.1)', padding: '1px 6px', borderRadius: '6px' }}>
                          {SERVICE_LABELS[s]}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ItemStageChip stage={item.stage} />
                </div>
                <ItemProgressBar stage={item.stage} />
                <div style={{ fontSize: '10px', color: '#4b5563', marginTop: '4px', fontFamily: 'monospace' }}>
                  QR: {item.qrCode}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notifications */}
      {order.notifications.length > 0 && (
        <div>
          <button
            id={`toggle-notifs-${order.id}`}
            onClick={() => setExpandedNotifs(!expandedNotifs)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0 0 12px 0',
              color: '#9ca3af',
              fontSize: '13px',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <span>{expandedNotifs ? '▾' : '▸'}</span>
            Notifications ({order.notifications.length})
          </button>
          {expandedNotifs && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {order.notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    background: 'rgba(16,185,129,0.07)',
                    border: '1px solid rgba(16,185,129,0.15)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '13px',
                    color: '#a7f3d0',
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                    📱 {n.channel.toUpperCase()} · {new Date(n.timestamp).toLocaleTimeString('en-NG')}
                  </div>
                  {n.message}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CreateOrderForm() {
  const { createOrder, getPriceEstimate, getTurnaround, customers } = useLaundryStore();
  const [customerId, setCustomerId] = useState('cust-folake');
  const [isExpress, setIsExpress] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleItems = [
    { categoryId: 'shirt', description: '3× Office Shirts', quantity: 3, services: ['wash', 'ironing'] as ServiceType[], priceKobo: 90_000 },
    { categoryId: 'suit', description: '1× Suit', quantity: 1, services: ['dry_cleaning'] as ServiceType[], priceKobo: 200_000 },
  ];

  const customer = customers.find((c) => c.id === customerId);
  const priceEst = useMemo(() => {
    try {
      return getPriceEstimate({
        items: sampleItems,
        isExpress,
        promoCode: promoCode || undefined,
        loyaltyPoints,
        tier: customer?.tier ?? 'standard',
      });
    } catch { return null; }
  }, [isExpress, promoCode, loyaltyPoints, customerId]);

  const turnaround = useMemo(
    () => getTurnaround(['wash', 'ironing', 'dry_cleaning'], isExpress),
    [isExpress]
  );

  function handleCreate() {
    try {
      const order = createOrder({
        customerId,
        branchId: 'branch-vi',
        items: sampleItems,
        services: ['wash', 'ironing', 'dry_cleaning'],
        isExpress,
        promoCode: promoCode || undefined,
        loyaltyPointsToRedeem: loyaltyPoints,
        notes: 'Sample order from Customer Tracker',
      });
      setCreatedOrder(order);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }

  if (createdOrder) {
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.1))',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎉</div>
        <div style={{ fontWeight: 700, fontSize: '20px', color: '#34d399', marginBottom: '8px' }}>
          Order Created!
        </div>
        <div style={{ fontSize: '28px', fontWeight: 900, color: '#f1f5f9', fontFamily: 'monospace', marginBottom: '12px' }}>
          {createdOrder.id}
        </div>
        <div style={{ fontSize: '14px', color: '#9ca3af' }}>
          Total: <strong style={{ color: '#e2e8f0' }}>
            {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(createdOrder.totalKobo / 100)}
          </strong>
        </div>
        <button
          id="search-new-order"
          onClick={() => setCreatedOrder(null)}
          style={{
            marginTop: '16px',
            padding: '10px 20px',
            borderRadius: '10px',
            background: 'rgba(59,130,246,0.2)',
            border: '1px solid rgba(59,130,246,0.3)',
            color: '#93c5fd',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Track Another Order
        </button>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: '#e2e8f0' }}>
        Create Sample Order
      </h3>
      {error && (
        <div style={{ background: '#ef444422', border: '1px solid #ef444444', borderRadius: '8px', padding: '10px', marginBottom: '12px', color: '#fca5a5', fontSize: '13px' }}>
          ⚠️ {error}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '6px' }}>Customer</label>
          <select
            id="create-order-customer"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #374151', color: '#e2e8f0', fontSize: '14px' }}
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.tier})</option>
            ))}
          </select>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#e2e8f0' }}>
          <input
            id="express-toggle"
            type="checkbox"
            checked={isExpress}
            onChange={(e) => setIsExpress(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: '#f59e0b' }}
          />
          Express Order (+50%, ready in {turnaround.hours}h)
        </label>

        <div>
          <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '6px' }}>Promo Code</label>
          <input
            id="promo-code-input"
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="FIRSTWASH / LAGOSCLEAN / GOLDMEMBER"
            style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #374151', color: '#e2e8f0', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '6px' }}>
            Loyalty Points to Redeem ({customer?.loyaltyPoints ?? 0} available)
          </label>
          <input
            id="loyalty-points-input"
            type="number"
            min={0}
            max={customer?.loyaltyPoints ?? 0}
            value={loyaltyPoints}
            onChange={(e) => setLoyaltyPoints(Number(e.target.value))}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid #374151', color: '#e2e8f0', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        {priceEst && (
          <div style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '10px', padding: '14px' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Price Estimate</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '13px' }}>
              <span style={{ color: '#9ca3af' }}>Subtotal:</span>
              <span style={{ color: '#e2e8f0', textAlign: 'right', fontFamily: 'monospace' }}>
                {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(priceEst.subtotalKobo / 100)}
              </span>
              {priceEst.expressSurchargeKobo > 0 && <>
                <span style={{ color: '#f59e0b' }}>Express +50%:</span>
                <span style={{ color: '#f59e0b', textAlign: 'right', fontFamily: 'monospace' }}>
                  +{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(priceEst.expressSurchargeKobo / 100)}
                </span>
              </>}
              {priceEst.promoDiscountKobo > 0 && <>
                <span style={{ color: '#34d399' }}>Promo:</span>
                <span style={{ color: '#34d399', textAlign: 'right', fontFamily: 'monospace' }}>
                  -{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(priceEst.promoDiscountKobo / 100)}
                </span>
              </>}
              {priceEst.loyaltyDiscountKobo > 0 && <>
                <span style={{ color: '#a78bfa' }}>Loyalty:</span>
                <span style={{ color: '#a78bfa', textAlign: 'right', fontFamily: 'monospace' }}>
                  -{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(priceEst.loyaltyDiscountKobo / 100)}
                </span>
              </>}
              <span style={{ color: '#f1f5f9', fontWeight: 700, borderTop: '1px solid #374151', paddingTop: '6px' }}>Total:</span>
              <span style={{ color: '#f1f5f9', fontWeight: 700, textAlign: 'right', fontFamily: 'monospace', borderTop: '1px solid #374151', paddingTop: '6px' }}>
                {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(priceEst.totalKobo / 100)}
              </span>
            </div>
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#6b7280' }}>
              ⏱ Est. ready in <strong style={{ color: '#93c5fd' }}>{turnaround.hours}h</strong>
            </div>
          </div>
        )}

        <button
          id="create-order-btn"
          onClick={handleCreate}
          style={{
            padding: '14px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            border: 'none',
            color: '#fff',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
        >
          🧺 Place Order
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function LaundryCustomerTrackerPage() {
  const { orders, resetSandbox } = useLaundryStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'track' | 'create'>('track');

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toUpperCase();
    if (!q) return orders.slice(0, 5);
    return orders.filter((o) =>
      o.id.toUpperCase().includes(q) ||
      o.customerId.toUpperCase().includes(q)
    );
  }, [orders, searchQuery]);

  // Pre-populate with demo ticket
  function handleDemoSearch() {
    setSearchQuery('LND-1042');
    setActiveTab('track');
  }

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
    * { box-sizing: border-box; }
    body { font-family: 'Space Grotesk', sans-serif; }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.85; }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .order-animate { animation: slideIn 0.4s ease forwards; }
    input:focus, select:focus { outline: none; border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
  `;

  return (
    <>
      <style>{styles}</style>
      <DemoShell
        title="Laundry Operations"
        badge="CUSTOMER TRACKER"
        subtitle="Real-time order tracking · Garment-level visibility · Express delivery"
        storageKey={LAUNDRY_STORAGE_KEY}
        onReset={resetSandbox}
        walkthroughSteps={WALKTHROUGH_STEPS}
        challengeTitle="Fleet Operator Challenge: Create pickup → scan → mark ready → assign delivery → close order"
      >
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 4px' }}>

          {/* Tab Row */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '24px',
              background: 'rgba(15,23,42,0.6)',
              padding: '6px',
              borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {[
              { key: 'track', label: '🔍 Track Order' },
              { key: 'create', label: '➕ New Order' },
            ].map((tab) => (
              <button
                key={tab.key}
                id={`tab-${tab.key}`}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  background: activeTab === tab.key
                    ? 'linear-gradient(135deg, #3b82f6, #6366f1)'
                    : 'transparent',
                  color: activeTab === tab.key ? '#fff' : '#6b7280',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Track Tab */}
          {activeTab === 'track' && (
            <div>
              {/* Search Box */}
              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <input
                  id="order-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter ticket number (e.g. LND-1042) or customer ID..."
                  style={{
                    width: '100%',
                    padding: '16px 20px 16px 52px',
                    borderRadius: '14px',
                    background: 'rgba(15,23,42,0.8)',
                    border: '1px solid rgba(59,130,246,0.3)',
                    color: '#f1f5f9',
                    fontSize: '16px',
                    fontFamily: 'Space Grotesk, sans-serif',
                    transition: 'border-color 0.2s',
                  }}
                />
                <span style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px' }}>
                  🔍
                </span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#6b7280',
                      cursor: 'pointer',
                      fontSize: '18px',
                    }}
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Quick Demo Button */}
              {!searchQuery && (
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <button
                    id="demo-search-btn"
                    onClick={handleDemoSearch}
                    style={{
                      padding: '10px 24px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.15))',
                      border: '1px solid rgba(245,158,11,0.3)',
                      color: '#fbbf24',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 600,
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(239,68,68,0.25))')}
                    onMouseOut={(e) => (e.currentTarget.style.background = 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.15))')}
                  >
                    ⚡ Load Demo Order LND-1042
                  </button>
                </div>
              )}

              {/* Results */}
              {filteredOrders.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '48px 24px',
                    background: 'rgba(15,23,42,0.5)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: '#e2e8f0', marginBottom: '8px' }}>
                    No orders found
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    Try searching for "LND-1042" or "cust-folake"
                  </div>
                </div>
              ) : (
                <div>
                  {!searchQuery && (
                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
                      Showing {filteredOrders.length} recent orders — search to filter
                    </div>
                  )}
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="order-animate">
                      <OrderCard order={order} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Create Tab */}
          {activeTab === 'create' && (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.95))',
                border: '1px solid rgba(59,130,246,0.2)',
                borderRadius: '20px',
                padding: '28px',
              }}
            >
              <CreateOrderForm />
            </div>
          )}

        </div>
      </DemoShell>
    </>
  );
}
