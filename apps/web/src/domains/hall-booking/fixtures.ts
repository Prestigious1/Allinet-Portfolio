import {
  Hall,
  AddOn,
  PromoCode,
  Customer,
  Booking,
  calculatePrice,
} from './engine';

export const LAGOS_VENUE_PRESETS: Hall[] = [
  {
    id: 'hall-grand-ballroom',
    name: 'The Eko Grand Ballroom (Victoria Island)',
    capacity: 650,
    amenities: [
      'P2.5 4K LED Screen Backdrop',
      'Central Chilled-Water AC (100 Tons)',
      'JBL Line-Array Touring Sound System',
      'VIP Green Room & Bridal Dressing Suite',
      'Dedicated Dual 500kVA CAT Generators',
      'Armed Security & Valet Parking (200 Cars)',
    ],
    baseRateKobo: 150_000_00, // ₦150,000/hr
    minHours: 4,
    bufferBeforeMin: 90,
    bufferAfterMin: 90,
    depositPct: 0.3,
  },
  {
    id: 'hall-banquet-hall',
    name: 'The Lekki Banquet Pavilion (Lekki Phase 1)',
    capacity: 300,
    amenities: [
      'Acoustic Fabric Wall Panelling',
      'Banquet Tables & Luxury Chiavari Chairs',
      'Motorized Stage Spotlights & Uplighting',
      'Executive Holding Room with Private Restroom',
      '250kVA Soundproof Generator Backup',
      'CCTV Monitoring & On-Site Facility Supervisor',
    ],
    baseRateKobo: 85_000_00, // ₦85,000/hr
    minHours: 4,
    bufferBeforeMin: 60,
    bufferAfterMin: 60,
    depositPct: 0.3,
  },
  {
    id: 'hall-executive-lounge',
    name: 'The Ikoyi Executive Terrace & Lounge (Ikoyi)',
    capacity: 90,
    amenities: [
      'Panoramic Lagos Five Cowries Waterfront Terrace',
      'Bespoke Cocktail Bar & Lounge Pods',
      '85" 4K Smart Boardroom Display & Wireless Presentation',
      'High-Speed Starlink Commercial WiFi',
      'Dedicated Butler & Valet Service',
    ],
    baseRateKobo: 50_000_00, // ₦50,000/hr
    minHours: 3,
    bufferBeforeMin: 45,
    bufferAfterMin: 45,
    depositPct: 0.3,
  },
];

export const LAGOS_ADD_ONS: AddOn[] = [
  {
    id: 'addon-led-wall',
    name: 'P2.5 High-Definition Curved LED Video Wall',
    priceKobo: 120_000_00, // ₦120,000
  },
  {
    id: 'addon-live-streaming',
    name: 'Multi-Camera 4K Live Broadcast & Hybrid Stream (YouTube/Zoom)',
    priceKobo: 95_000_00, // ₦95,000
  },
  {
    id: 'addon-sound-engineer',
    name: 'Dedicated Sound & Lighting FOH Engineer Team (Full Event)',
    priceKobo: 45_000_00, // ₦45,000
  },
  {
    id: 'addon-red-carpet',
    name: 'VIP Red Carpet, Media Backdrop Wall & Chrome Stanchions',
    priceKobo: 35_000_00, // ₦35,000
  },
  {
    id: 'addon-generator-fuel',
    name: 'Guaranteed Uninterrupted Diesel Fuel Guarantee (10-hr continuous)',
    priceKobo: 65_000_00, // ₦65,000
  },
];

export const LAGOS_PROMOS: PromoCode[] = [
  {
    code: 'LAGOS2026',
    discountType: 'percentage',
    discountValue: 10,
    validFrom: '2026-01-01T00:00:00.000Z',
    validUntil: '2026-12-31T23:59:59.000Z',
    maxUses: 500,
    usedCount: 24,
  },
  {
    code: 'TECHFEST50K',
    discountType: 'fixed_kobo',
    discountValue: 50_000_00,
    validFrom: '2026-01-01T00:00:00.000Z',
    validUntil: '2026-12-31T23:59:59.000Z',
    maxUses: 100,
    usedCount: 8,
  },
  {
    code: 'WEDDINGVIP15',
    discountType: 'percentage',
    discountValue: 15,
    validFrom: '2026-01-01T00:00:00.000Z',
    validUntil: '2026-12-31T23:59:59.000Z',
    maxUses: 50,
    usedCount: 12,
  },
];

export const LAGOS_CUSTOMERS: Customer[] = [
  {
    id: 'cust-folake',
    name: 'Folake Balogun',
    email: 'folake.balogun@lagosevents.ng',
    phone: '+234 802 345 6789',
    tier: 'gold',
    strikes: 0,
  },
  {
    id: 'cust-tunde',
    name: 'Babatunde Adeleke',
    email: 'tunde@innovateafrica.com',
    phone: '+234 803 987 6543',
    tier: 'silver',
    strikes: 0,
  },
  {
    id: 'cust-chidi',
    name: 'Chidi Okonkwo',
    email: 'chidi.okonkwo@capitalhub.ng',
    phone: '+234 814 112 2334',
    tier: 'bronze',
    strikes: 0,
  },
  {
    id: 'cust-aisha',
    name: 'Aisha Danjuma',
    email: 'aisha.danjuma@nexusgroup.com',
    phone: '+234 809 556 7788',
    tier: 'standard',
    strikes: 1,
  },
];

/**
 * Generates sample seed bookings relative to a reference date.
 * Ensures the sandbox calendar has populated data for inspection right upon load.
 */
export function generateSeedBookings(referenceDateIso: string = '2026-11-01T00:00:00.000Z'): Booking[] {
  const d = new Date(referenceDateIso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');

  const grandHall = LAGOS_VENUE_PRESETS[0];
  const banquetHall = LAGOS_VENUE_PRESETS[1];
  const loungeHall = LAGOS_VENUE_PRESETS[2];

  // 1. Confirmed Tech Conference in Grand Ballroom
  const b1Start = `${y}-${m}-12T08:00:00.000Z`;
  const b1End = `${y}-${m}-12T18:00:00.000Z`;
  const b1Price = calculatePrice({
    hall: grandHall,
    startIso: b1Start,
    endIso: b1End,
    addOns: [LAGOS_ADD_ONS[0], LAGOS_ADD_ONS[1], LAGOS_ADD_ONS[2]],
    customer: LAGOS_CUSTOMERS[0],
  });

  const booking1: Booking = {
    id: 'bk-eko-tech-summit',
    hallId: grandHall.id,
    customerId: LAGOS_CUSTOMERS[0].id,
    start: b1Start,
    end: b1End,
    slotType: 'full_day',
    guestCount: 550,
    status: 'confirmed',
    addOnIds: [LAGOS_ADD_ONS[0].id, LAGOS_ADD_ONS[1].id, LAGOS_ADD_ONS[2].id],
    priceBreakdown: b1Price,
    depositPaid: true,
    depositPaidKobo: b1Price.depositKobo,
    refundedKobo: 0,
    history: [
      {
        timestamp: `${y}-${m}-01T10:00:00.000Z`,
        action: 'BOOKING_CREATED',
        performedBy: LAGOS_CUSTOMERS[0].name,
        role: 'customer',
      },
      {
        timestamp: `${y}-${m}-01T11:30:00.000Z`,
        action: 'DEPOSIT_CONFIRMED',
        performedBy: 'Front Desk Lead',
        role: 'front_desk',
        details: { amountKobo: b1Price.depositKobo },
      },
    ],
  };

  // 2. Confirmed Wedding Banquet in Lekki Pavilion
  const b2Start = `${y}-${m}-15T13:00:00.000Z`;
  const b2End = `${y}-${m}-15T21:00:00.000Z`;
  const b2Price = calculatePrice({
    hall: banquetHall,
    startIso: b2Start,
    endIso: b2End,
    addOns: [LAGOS_ADD_ONS[3], LAGOS_ADD_ONS[4]],
    promo: LAGOS_PROMOS[2],
  });

  const booking2: Booking = {
    id: 'bk-lekki-wedding-banquet',
    hallId: banquetHall.id,
    customerId: LAGOS_CUSTOMERS[1].id,
    start: b2Start,
    end: b2End,
    slotType: 'evening',
    guestCount: 280,
    status: 'confirmed',
    addOnIds: [LAGOS_ADD_ONS[3].id, LAGOS_ADD_ONS[4].id],
    promoCode: 'WEDDINGVIP15',
    priceBreakdown: b2Price,
    depositPaid: true,
    depositPaidKobo: b2Price.depositKobo,
    refundedKobo: 0,
    history: [
      {
        timestamp: `${y}-${m}-02T09:00:00.000Z`,
        action: 'BOOKING_CREATED',
        performedBy: LAGOS_CUSTOMERS[1].name,
        role: 'customer',
      },
      {
        timestamp: `${y}-${m}-02T09:45:00.000Z`,
        action: 'DEPOSIT_CONFIRMED',
        performedBy: 'Operations Desk',
        role: 'front_desk',
        details: { amountKobo: b2Price.depositKobo },
      },
    ],
  };

  // 3. Completed Boardroom Strategy Session in Ikoyi Lounge
  const b3Start = `${y}-${m}-05T09:00:00.000Z`;
  const b3End = `${y}-${m}-05T14:00:00.000Z`;
  const b3Price = calculatePrice({
    hall: loungeHall,
    startIso: b3Start,
    endIso: b3End,
    customer: LAGOS_CUSTOMERS[2],
  });

  const booking3: Booking = {
    id: 'bk-ikoyi-board-session',
    hallId: loungeHall.id,
    customerId: LAGOS_CUSTOMERS[2].id,
    start: b3Start,
    end: b3End,
    slotType: 'morning',
    guestCount: 45,
    status: 'completed',
    addOnIds: [],
    priceBreakdown: b3Price,
    depositPaid: true,
    depositPaidKobo: b3Price.depositKobo,
    refundedKobo: 0,
    history: [
      {
        timestamp: `${y}-${m}-01T08:00:00.000Z`,
        action: 'BOOKING_CREATED',
        performedBy: LAGOS_CUSTOMERS[2].name,
        role: 'customer',
      },
      {
        timestamp: `${y}-${m}-01T08:30:00.000Z`,
        action: 'DEPOSIT_CONFIRMED',
        performedBy: 'Front Desk Lead',
        role: 'front_desk',
      },
      {
        timestamp: `${y}-${m}-05T14:30:00.000Z`,
        action: 'BOOKING_COMPLETED',
        performedBy: 'Operations Desk',
        role: 'front_desk',
      },
    ],
  };

  // 4. Pending Deposit hold (interactive demo sandbox test)
  const b4Start = `${y}-${m}-20T10:00:00.000Z`;
  const b4End = `${y}-${m}-20T16:00:00.000Z`;
  const b4Price = calculatePrice({
    hall: banquetHall,
    startIso: b4Start,
    endIso: b4End,
    customer: LAGOS_CUSTOMERS[3],
  });

  const booking4: Booking = {
    id: 'bk-holding-slot-sandbox',
    hallId: banquetHall.id,
    customerId: LAGOS_CUSTOMERS[3].id,
    start: b4Start,
    end: b4End,
    slotType: 'custom',
    guestCount: 150,
    status: 'pending_deposit',
    addOnIds: [],
    priceBreakdown: b4Price,
    depositPaid: false,
    depositPaidKobo: 0,
    refundedKobo: 0,
    pendingHoldExpiresAt: `${y}-${m}-20T09:15:00.000Z`,
    history: [
      {
        timestamp: `${y}-${m}-18T09:00:00.000Z`,
        action: 'BOOKING_CREATED',
        performedBy: LAGOS_CUSTOMERS[3].name,
        role: 'customer',
      },
    ],
  };

  return [booking1, booking2, booking3, booking4];
}

export function getLagosInitialState(referenceDateIso?: string) {
  return {
    halls: LAGOS_VENUE_PRESETS,
    addOns: LAGOS_ADD_ONS,
    promos: LAGOS_PROMOS,
    customers: LAGOS_CUSTOMERS,
    bookings: generateSeedBookings(referenceDateIso),
  };
}
