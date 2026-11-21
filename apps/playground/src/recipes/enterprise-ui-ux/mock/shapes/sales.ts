import type { TableShape } from "./types.js";

/** Aggregates profiled from the Sales section of the module maps appendix. */

/** Created-at window per source tenant, as days ago (from = most recent). */
export type DayWindow = { fromDaysAgo: number; toDaysAgo: number };

/** Synthetic live totals where the persona has no rows: equal to the generated row count. */
export const SYNTHETIC_QUOTES = 44;
export const SYNTHETIC_ORDERS = 48;

export const leadsShape: TableShape = {
  table: "leads",
  // Live (is_deleted = false) counts; utilities has 601 rows, 594 soft-deleted.
  totals: { utilities: 7, financial: 296, government_federal: 307 },
  source: {
    // Utilities has 7 live leads: use the financial shape at that persona's scale.
    utilities: { tenant: "F1", borrowed: true },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "G1", borrowed: false },
  },
  enums: {
    // financial: source <null> 38.
    source_F1: [
      ["field_sales", 41],
      ["merchant_referral", 41],
      ["campaign", 37],
      ["trade_show", 35],
      ["website", 35],
      ["partner_referral", 35],
      ["cold_call", 32],
      ["application", 2],
      ["none", 38],
    ],
    source_G1: [
      ["campaign", 60],
      ["cold_call", 60],
      ["trade_show", 60],
      ["referral", 60],
      ["website", 60],
      ["application", 7],
    ],
    status_F1: [
      ["new", 141],
      ["contacted", 64],
      ["qualified", 51],
      ["unqualified", 25],
      ["converted", 15],
    ],
    status_G1: [
      ["new", 82],
      ["contacted", 75],
      ["unqualified", 75],
      ["qualified", 74],
      ["converted", 1],
    ],
    rating_F1: [
      ["warm", 165],
      ["cold", 74],
      ["hot", 57],
    ],
    rating_G1: [
      ["warm", 107],
      ["hot", 100],
      ["cold", 100],
    ],
    // estimated_value null share: financial 40/296, gov 7/307 (persona live rows).
    estimated_value_null_F1: [
      ["null", 40],
      ["present", 256],
    ],
    estimated_value_null_G1: [
      ["null", 7],
      ["present", 300],
    ],
  },
  numbers: {
    // Persona live rows: financial 6,403.44..746,435.57; gov 50,000..15,000,000.
    estimated_value_F1: { min: 6403.44, median: 346905.69, max: 746435.57 },
    estimated_value_G1: { min: 50000, median: 7525000, max: 15000000 },
  },
  // created_at financial 2026-07-11..2026-10-14.
  dates: { fromDaysAgo: 27, toDaysAgo: 122 },
};

/** created_at: gov 2026-03-17..2026-09-16; financial 2026-07-11..2026-10-14. */
export const leadsCreatedWindow: Record<"F1" | "G1", DayWindow> = {
  F1: { fromDaysAgo: 27, toDaysAgo: 122 },
  G1: { fromDaysAgo: 55, toDaysAgo: 238 },
};

export const opportunitiesShape: TableShape = {
  table: "opportunities",
  totals: { utilities: 17, financial: 452, government_federal: 156 },
  source: {
    // Utilities: 17 live open rows only.
    utilities: { tenant: "F1", borrowed: true },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "G1", borrowed: false },
  },
  enums: {
    status_F1: [
      ["open", 212],
      ["won", 156],
      ["lost", 84],
    ],
    status_G1: [
      ["open", 56],
      ["won", 50],
      ["lost", 50],
    ],
    // financial stage_name of the open rows (Closed Won/Lost follow status).
    open_stage_F1: [
      ["Discovery", 61],
      ["Proposal", 72],
      ["Negotiation", 76],
    ],
  },
  numbers: {
    amount_F1: { min: 11246.28, median: 699810.43, max: 1488429.13 },
    amount_G1: { min: 125000, median: 9375000, max: 18750000 },
  },
  // created_at financial 2026-07-11..2026-10-14.
  dates: { fromDaysAgo: 27, toDaysAgo: 122 },
};

/** expected_close_date: financial 2026-03-13..2027-01-07; gov 2026-04-16..2027-07-07. */
export const opportunitiesCloseWindow: Record<
  "F1" | "G1",
  { agoDays: number; aheadDays: number }
> = {
  F1: { agoDays: 242, aheadDays: 58 },
  G1: { agoDays: 208, aheadDays: 239 },
};

export type PipelineStage = {
  name: string;
  order: number;
  /** 0-100 scale. */
  probability: number;
  color: string;
  isWon: boolean;
  isLost: boolean;
};

export const pipelineStagesShape: TableShape = {
  table: "pipeline_stages",
  totals: { utilities: 0, financial: 5, government_federal: 7 },
  source: {
    // Utilities has none; gov defines 7 stages on a 0-1 scale that no gov
    // opportunity references: every persona uses the financial 5.
    utilities: { tenant: "F1", borrowed: true },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "F1", borrowed: true },
  },
  enums: {
    name: [
      ["Discovery", 1],
      ["Proposal", 1],
      ["Negotiation", 1],
      ["Closed Won", 1],
      ["Closed Lost", 1],
    ],
  },
};

/** name | order | probability | color (financial). */
export const pipelineStagesF1: readonly PipelineStage[] = [
  {
    name: "Discovery",
    order: 1,
    probability: 20,
    color: "#3b82f6",
    isWon: false,
    isLost: false,
  },
  {
    name: "Proposal",
    order: 2,
    probability: 45,
    color: "#8b5cf6",
    isWon: false,
    isLost: false,
  },
  {
    name: "Negotiation",
    order: 3,
    probability: 70,
    color: "#f59e0b",
    isWon: false,
    isLost: false,
  },
  {
    name: "Closed Won",
    order: 4,
    probability: 100,
    color: "#22c55e",
    isWon: true,
    isLost: false,
  },
  {
    name: "Closed Lost",
    order: 5,
    probability: 0,
    color: "#ef4444",
    isWon: false,
    isLost: true,
  },
];

export const quotesShape: TableShape = {
  table: "quotes",
  // Live counts; gov has none: synthetic total = generated row count.
  totals: {
    utilities: 19,
    financial: 260,
    government_federal: SYNTHETIC_QUOTES,
  },
  source: {
    // Utilities live statuses are draft 12 / sent 6 / accepted 1.
    utilities: { tenant: "F1", borrowed: true },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "F1", borrowed: true },
  },
  enums: {
    status: [
      ["sent", 90],
      ["draft", 66],
      ["accepted", 66],
      ["rejected", 25],
      ["expired", 13],
    ],
  },
  numbers: {
    total: { min: 0, median: 130863, max: 1027591.5 },
  },
  // created_at financial 2026-07-11..2026-10-14.
  dates: { fromDaysAgo: 27, toDaysAgo: 122 },
};

/** valid_until 2026-05-28..2026-11-30. */
export const quotesValidUntilWindow = { agoDays: 166, aheadDays: 20 } as const;

export const ordersShape: TableShape = {
  table: "orders",
  totals: {
    utilities: 16,
    financial: 24,
    government_federal: SYNTHETIC_ORDERS,
  },
  source: {
    // Status-by-direction uses the whole table (130 rows); gov has none.
    utilities: { tenant: "any", borrowed: true },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "any", borrowed: true },
  },
  enums: {
    // direction / prefix (all): SLS 48, PUR 33.
    direction: [
      ["sales", 48],
      ["purchase", 33],
    ],
    // sales / standard (all): the /sales-orders list.
    status_sales: [
      ["closed", 23],
      ["confirmed", 12],
      ["cancelled", 8],
      ["draft", 3],
      ["submitted", 2],
    ],
    // purchase / PUR (financial).
    status_purchase: [
      ["confirmed", 16],
      ["submitted", 2],
      ["closed", 1],
    ],
    // created_via (financial) minus network (8), which is reserved for Received rows.
    created_via: [
      ["manual", 14],
      ["quote", 2],
    ],
    // billing_state (all).
    billing_state: [
      ["none", 120],
      ["partially_invoiced", 10],
    ],
  },
  numbers: {
    // total (sales, all) and total (purchase, all).
    total_sales: { min: 0, median: 120, max: 12420 },
    total_purchase: { min: 20, median: 80, max: 3788.75 },
  },
  // order_date whole table 2026-10-14..2026-11-03.
  dates: { fromDaysAgo: 7, toDaysAgo: 27 },
};
