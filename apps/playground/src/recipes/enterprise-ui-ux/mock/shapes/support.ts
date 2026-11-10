import type { TableShape } from "./types.js";

/** Aggregates profiled from the Support section of the module maps appendix. */

/** Synthetic live totals where QA has no rows: equal to the generated row count. */
export const SYNTHETIC_THREADS = 48;

/** Inbound threads: QA has none (outreach_messages is 100% outbound, nudge_threads all outbound/unread 0), so every persona is synthetic. */
export const threadsShape: TableShape = {
  table: "nudge_threads / outreach_messages (inbound, synthetic)",
  totals: {
    utilities: SYNTHETIC_THREADS,
    financial: SYNTHETIC_THREADS,
    government_federal: SYNTHETIC_THREADS,
  },
  source: {
    utilities: { tenant: "any", borrowed: true },
    financial: { tenant: "any", borrowed: true },
    government_federal: { tenant: "any", borrowed: true },
  },
  enums: {
    // Invented mix (QA: channel email 3279 on utilities, whatsapp 11 / sms 4 on financial).
    channel: [
      ["email", 58],
      ["sms", 24],
      ["chat", 18],
    ],
    // Invented: QA threads are all unread_count 0, which would leave the inbox empty.
    status: [
      ["unread", 38],
      ["read", 28],
      ["replied", 24],
      ["escalated", 10],
    ],
  },
  dates: { fromDaysAgo: 0, toDaysAgo: 10 },
};

export const escalationsShape: TableShape = {
  table: "nudge_escalations",
  // Utilities has 81 rows; financial and government have 0.
  totals: { utilities: 81, financial: 0, government_federal: 0 },
  source: {
    utilities: { tenant: "U1", borrowed: false },
    financial: { tenant: "U1", borrowed: true },
    government_federal: { tenant: "U1", borrowed: true },
  },
  enums: {
    priority: [
      ["medium", 47],
      ["low", 17],
      ["high", 9],
      ["critical", 8],
    ],
    // QA: resolved 76, pending 4, assigned 1 (66 are test_cleanup), so the mock
    // invents open rows per the appendix vocabulary pending/assigned/in_progress/resolved/closed.
    status_QA: [
      ["resolved", 76],
      ["pending", 4],
      ["assigned", 1],
    ],
    status: [
      ["pending", 38],
      ["assigned", 24],
      ["in_progress", 22],
      ["resolved", 13],
      ["closed", 3],
    ],
    // category <null> 45.
    category: [
      ["none", 45],
      ["billing", 31],
      ["Safety", 4],
      ["technical", 1],
    ],
  },
  numbers: {
    // metadata.aiConfidence is 72 in QA (3 rows); the appendix asks for 50-99%.
    confidence_pct: { min: 50, median: 72, max: 99 },
  },
  // created_at 2026-10-09..2026-10-19.
  dates: { fromDaysAgo: 22, toDaysAgo: 32 },
};

export const callsShape: TableShape = {
  table: "interactions",
  totals: { utilities: 550, financial: 851, government_federal: 1 },
  source: {
    // Utilities started_at is all the 2000-01-01 placeholder with 1s duration; government has 1 row.
    utilities: { tenant: "F1", borrowed: true },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "F1", borrowed: true },
  },
  enums: {
    type: [
      ["voice", 297],
      ["email", 253],
      ["sms", 164],
      ["chat", 137],
    ],
    direction: [
      ["inbound", 600],
      ["outbound", 251],
    ],
    status: [
      ["completed", 818],
      ["missed", 33],
    ],
    // QA disposition is null on all 851 rows; the mock invents a few.
    disposition_present: [
      ["present", 62],
      ["null", 38],
    ],
    // started_at hour (UTC), flat 09-16 in QA; the mock shapes a realistic curve.
    hour: [
      ["9", 8],
      ["10", 10],
      ["11", 9],
      ["12", 6],
      ["13", 8],
      ["14", 10],
      ["15", 9],
      ["16", 7],
    ],
    // Hours before the anchor (12:00 UTC) for the anchor-day calls.
    hour_today: [
      ["7", 3],
      ["8", 6],
      ["9", 9],
      ["10", 10],
      ["11", 8],
    ],
  },
  numbers: {
    // ended_at - started_at, seconds: 2.6 / 949 / 1799.
    duration_seconds: { min: 3, median: 949, max: 1799 },
    // Invented: QA has no wait time (hold_duration is always 0).
    wait_seconds: { min: 2, median: 12, max: 75 },
  },
  // started_at 2026-04-12..2026-09-18 (none in the last 30 days).
  dates: { fromDaysAgo: 53, toDaysAgo: 212 },
};

export const ticketsShape: TableShape = {
  table: "tickets",
  // Visible rows (platform_support excluded): utilities 6, financial 488, government 1213.
  totals: { utilities: 6, financial: 488, government_federal: 1213 },
  source: {
    // Utilities has 6 visible rows, all new/medium: use the financial shape at that scale.
    utilities: { tenant: "F1", borrowed: true },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "G1", borrowed: false },
  },
  enums: {
    status_F1: [
      ["waiting_internal", 213],
      ["closed", 89],
      ["resolved", 58],
      ["new", 26],
      ["confirmed", 24],
      ["in_progress", 23],
      ["triaged", 20],
      ["waiting_customer", 16],
      ["assigned", 15],
      ["reopened", 5],
    ],
    status_G1: [
      ["new", 177],
      ["in_progress", 176],
      ["resolved", 174],
      ["triaged", 172],
      ["assigned", 172],
      ["waiting_customer", 171],
      ["closed", 171],
    ],
    priority_F1: [
      ["high", 155],
      ["medium", 148],
      ["low", 119],
      ["urgent", 67],
    ],
    priority_G1: [
      ["medium", 305],
      ["high", 305],
      ["low", 303],
      ["urgent", 300],
    ],
    // platform_support (1) is hidden from non-provider tenants and excluded.
    category_F1: [
      ["card_services", 106],
      ["technical", 95],
      ["account_maintenance", 88],
      ["merchant_services", 69],
      ["disputes", 57],
      ["fraud", 41],
      ["rewards", 31],
      ["billing", 1],
    ],
    // 23 distinct categories in QA; the 12 listed in the profile plus 13 null.
    category_G1: [
      ["Security Clearance", 53],
      ["IT Infrastructure", 53],
      ["Compliance Audit", 53],
      ["FOIA Request", 53],
      ["License Renewal", 52],
      ["Interagency Transfer", 52],
      ["Policy Question", 52],
      ["Budget Inquiry", 52],
      ["Regulatory Filing", 52],
      ["Whistleblower Report", 52],
      ["System Access", 52],
      ["Public Records Request", 52],
      ["none", 13],
    ],
    // financial: contact 282 / organization only 207.
    customer_kind_F1: [
      ["person", 282],
      ["organization", 207],
    ],
  },
  // created_at: financial 2026-03-13..2026-08-27; government 2025-12-17..2026-09-11; utilities 2026-06-22..2026-10-19.
  dates: { fromDaysAgo: 75, toDaysAgo: 242 },
};

/** created_at window per source tenant (days ago, from = most recent). */
export const ticketsCreatedWindow = {
  F1: { fromDaysAgo: 75, toDaysAgo: 242 },
  G1: { fromDaysAgo: 60, toDaysAgo: 328 },
  // Utilities persona window; the financial shape is used for its values.
  U1: { fromDaysAgo: 21, toDaysAgo: 141 },
} as const;

export const agentStatusShape: TableShape = {
  table: "agent_status",
  totals: { utilities: 1, financial: 2, government_federal: 1 },
  source: {
    utilities: { tenant: "U1", borrowed: false },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "G1", borrowed: false },
  },
  enums: {
    // QA: available 3, offline 1; busy/away/dnd/on_call/wrap_up never occur, so the roster mock invents variety.
    presence_QA: [
      ["available", 3],
      ["offline", 1],
    ],
    presence: [
      ["available", 40],
      ["busy", 20],
      ["away", 15],
      ["offline", 25],
    ],
  },
  // agent_status 2026-07-12..2026-09-18.
  dates: { fromDaysAgo: 53, toDaysAgo: 121 },
};
