import type { PersonaKey } from "../../specs/types.js";
import type { TableShape } from "./types.js";

/** Aggregates profiled from the Finance section of the module maps appendix. */

export type DayWindow = { fromDaysAgo: number; toDaysAgo: number };

/** Generated row count per row set; synthetic live totals equal these. */
export const FINANCE_COUNTS = {
  invoices: 56,
  recurring: 40,
  outbox: 48,
  readyToInvoice: 12,
  settlements: 40,
  bills: 56,
  billInbox: 44,
  payments: 56,
  ledger: 56,
  products: 50,
  subscriptions: 48,
  rateCards: 40,
} as const;

export const arShape: TableShape = {
  table: "ar",
  // Live counts u/f/g = 128 / 15747 / 35626.
  totals: { utilities: 128, financial: 15747, government_federal: 35626 },
  source: {
    utilities: { tenant: "U2", borrowed: false },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "G1", borrowed: false },
  },
  enums: {
    status_G1: [
      ["paid", 26780],
      ["overdue", 4350],
      ["written_off", 1683],
      ["draft", 1154],
      ["void", 1103],
      ["partially_paid", 416],
      ["open", 136],
      ["sent", 4],
    ],
    status_F1: [
      ["paid", 7947],
      ["overdue", 5736],
      ["sent", 1402],
      ["partially_paid", 660],
      ["draft", 2],
    ],
    status_U2: [
      ["paid", 38],
      ["overdue", 32],
      ["partially_paid", 23],
      ["void", 19],
      ["sent", 8],
      ["draft", 6],
      ["viewed", 1],
      ["written_off", 1],
    ],
    // external_source oracle_ccnb 9918 shows as the integration label; null and
    // customer_subscription (5231 + 598) show as Beacon (SourceBadge). Government
    // and utilities rows have no external source.
    source_F1: [
      ["Oracle CC&B", 9918],
      ["Beacon", 5829],
    ],
    source_none: [["Beacon", 1]],
    // payment_terms_days (customer_subscriptions): 30 / 45 / 15.
    terms_days: [
      ["30", 1095],
      ["45", 579],
      ["15", 526],
    ],
  },
  numbers: {
    // total_amount min/median/max per tenant.
    total_G1: { min: 75.5, median: 52424.31, max: 175510.27 },
    total_F1: { min: 0, median: 25048.81, max: 722500 },
    total_U2: { min: 1, median: 200, max: 1234.56 },
  },
  // issue_date: gov 2021-03-17..2026-09-16; financial 2025-02-05..2026-11-09; utilities 2026-06-22..2026-10-28.
  dates: { fromDaysAgo: 1, toDaysAgo: 2064 },
};

export const arIssueWindow: Record<"U2" | "F1" | "G1", DayWindow> = {
  U2: { fromDaysAgo: 13, toDaysAgo: 141 },
  F1: { fromDaysAgo: 1, toDaysAgo: 643 },
  G1: { fromDaysAgo: 55, toDaysAgo: 2064 },
};

export const recurringShape: TableShape = {
  table: "recurring_invoices",
  // Live: utilities 15, financial 3, government none.
  totals: { utilities: 15, financial: 3, government_federal: 0 },
  source: {
    utilities: { tenant: "U1", borrowed: false },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "F1", borrowed: true },
  },
  enums: {
    // Utilities: all 15 cancelled, plus a small synthetic active share.
    status_U1: [
      ["cancelled", 15],
      ["active", 3],
    ],
    // Financial: all 3 active, plus a small synthetic cancelled share.
    status_F1: [
      ["active", 17],
      ["cancelled", 3],
    ],
    // monthly 17 (utilities 15, financial 2), annually 1.
    frequency: [
      ["monthly", 17],
      ["annually", 1],
    ],
  },
  numbers: {
    // Template ar.total_amount 25..647.84; the appendix median is a 0 placeholder, 180 is invented.
    amount: { min: 25, median: 180, max: 647.84 },
  },
  // created_at 2026-07-12..2026-10-19; next_run_date 2026-11-07..2027-07-12 (future rows only here).
  dates: { fromDaysAgo: 22, toDaysAgo: 121 },
};

/** next_run_date up to 2027-07-12. */
export const recurringNextRunAheadDays = 244;

export const outboxShape: TableShape = {
  table: "outreach_messages (AR outbox)",
  // direction=outbound and metadata.source='ar': u 64, f 5826, g 13.
  totals: { utilities: 64, financial: 5826, government_federal: 13 },
  source: {
    utilities: { tenant: "U1", borrowed: false },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "G1", borrowed: false },
  },
  enums: {
    status_F1: [
      ["sent", 5817],
      ["failed", 9],
    ],
    status_U1: [
      ["sent", 63],
      ["failed", 1],
    ],
    status_G1: [["sent", 13]],
    // channel email 14193, sms 6 (whatsapp 27 is dropped from this surface).
    channel: [
      ["email", 14193],
      ["sms", 6],
    ],
  },
};

export const readyToInvoiceShape: TableShape = {
  table: "orders (fulfilment=service, unbilled work)",
  // QA has none (utilities: 4 service orders, all cancelled): synthetic.
  totals: {
    utilities: FINANCE_COUNTS.readyToInvoice,
    financial: FINANCE_COUNTS.readyToInvoice,
    government_federal: FINANCE_COUNTS.readyToInvoice,
  },
  source: {
    utilities: { tenant: "any", borrowed: true },
    financial: { tenant: "any", borrowed: true },
    government_federal: { tenant: "any", borrowed: true },
  },
  enums: {
    // ReadyToInvoice.tsx shows Invoice now only when canInvoiceNow.
    can_invoice_now: [
      ["yes", 3],
      ["no", 1],
    ],
    // order status (confirmed 16, closed 4, submitted 2, draft 1 across orders).
    status: [
      ["confirmed", 16],
      ["closed", 4],
      ["submitted", 2],
      ["draft", 1],
    ],
  },
  numbers: {
    // Invented: orders total 0/80/519.48 is the nearest QA order scale.
    unbilled: { min: 40, median: 320, max: 2400 },
    hours: { min: 0.5, median: 4, max: 16 },
  },
};

export const settlementsShape: TableShape = {
  table: "network_commercial_accruals / settlement statements",
  // 15 of 23 accrual rows involve the financial persona.
  totals: {
    utilities: FINANCE_COUNTS.settlements,
    financial: 15,
    government_federal: FINANCE_COUNTS.settlements,
  },
  source: {
    utilities: { tenant: "any", borrowed: true },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "any", borrowed: true },
  },
  enums: {
    side: [
      ["receivable", 1],
      ["payable", 1],
    ],
    // Settlement AR documents: sent 5, paid 1.
    status_receivable: [
      ["sent", 5],
      ["paid", 1],
    ],
    // Settlement AP bills: pending_review 2; paid is borrowed from the AR side.
    status_payable: [
      ["pending_review", 2],
      ["paid", 1],
    ],
    // network_commercial_disputes has 0 rows: a small synthetic share.
    disputes: [
      ["0", 92],
      ["1", 8],
    ],
  },
  numbers: {
    // amount_minor 250/525/5000 cents, per accrual fee in dollars.
    fee: { min: 2.5, median: 5.25, max: 50 },
    // Invoices finalized per accrual line (invented).
    quantity: { min: 2, median: 14, max: 60 },
  },
  // The generator spreads 12 closed monthly periods before the anchor month.
};

export const apShape: TableShape = {
  table: "ap",
  totals: { utilities: 48, financial: 2987, government_federal: 1 },
  source: {
    // The appendix profiles AP statuses and amounts for financial only.
    utilities: { tenant: "F1", borrowed: true },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "F1", borrowed: true },
  },
  enums: {
    status: [
      ["paid", 1984],
      ["approved", 495],
      ["pending_review", 272],
      ["overdue", 91],
      ["partially_paid", 88],
      ["scheduled", 46],
      ["draft", 10],
      ["void", 1],
      // ap_status also allows these, unused in QA: small synthetic weights so
      // the chips are not empty.
      ["on_hold", 14],
      ["rejected", 10],
      ["disputed", 12],
    ],
    terms_days: [
      ["30", 1095],
      ["45", 579],
      ["15", 526],
    ],
  },
  numbers: {
    total: { min: 0, median: 40058.96, max: 142492.52 },
  },
  // created_at 2026-07-11..2026-11-06 (issue_date reaches back to 2014).
  dates: { fromDaysAgo: 4, toDaysAgo: 122 },
};

export const billInboxShape: TableShape = {
  table: "bill_inbox_messages",
  totals: {
    utilities: FINANCE_COUNTS.billInbox,
    financial: 185,
    government_federal: FINANCE_COUNTS.billInbox,
  },
  source: {
    utilities: { tenant: "F1", borrowed: true },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "F1", borrowed: true },
  },
  enums: {
    // processed 180, error 3, received 2.
    status: [
      ["processed", 180],
      ["error", 3],
      ["received", 2],
    ],
    auto: [
      ["true", 182],
      ["false", 3],
    ],
    // attachment_count 1 (182), 0 (3).
    attachments: [
      ["1", 182],
      ["0", 3],
    ],
  },
  // received_at 2026-06-13..2026-07-13.
  dates: { fromDaysAgo: 120, toDaysAgo: 150 },
};

export const payShape: TableShape = {
  table: "pay",
  totals: { utilities: 77, financial: 10347, government_federal: 27822 },
  source: {
    // Utilities has no breakdown in the appendix: the gov (all-tenant) shape.
    utilities: { tenant: "G1", borrowed: true },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "G1", borrowed: false },
  },
  enums: {
    // settled -> completed, approved -> processing, completed -> completed.
    // pending, reversed and refunded do not occur in QA, and financial processing
    // (8) and gov failed (5) are tiny: those weights are boosted to roughly 2-4%
    // (synthetic) so every status chip has rows in a 56-row set.
    status_G1: [
      ["completed", 26347 + 130],
      ["processing", 1340],
      ["failed", 600],
      ["pending", 1000],
      ["reversed", 700],
      ["refunded", 700],
    ],
    status_F1: [
      ["completed", 10330 + 9],
      ["processing", 400],
      ["pending", 400],
      ["failed", 250],
      ["reversed", 400],
      ["refunded", 400],
    ],
    method_G1: [
      ["ach", 7640],
      ["card", 6900],
      ["wire", 6710],
      ["check", 6572],
    ],
    method_F1: [
      ["ach", 3727],
      ["virtual_card", 1789],
      ["check", 1769],
      ["wire", 1669],
      ["card", 1392],
    ],
    // gov provider tillipay 25863 / internal 1959; financial all internal,
    // plus terminal from payment_transactions (4 rows).
    source_G1: [
      ["tillipay", 25863],
      ["internal", 1959],
    ],
    source_F1: [
      ["internal", 10347],
      ["terminal", 4],
    ],
    // document_type ar 27203 / ap 619.
    document_type: [
      ["ar", 27203],
      ["ap", 619],
    ],
  },
  numbers: {
    amount: { min: 123.23, median: 55768.5, max: 182837.24 },
    // payment_transactions amount 73..73332; the median is invented (appendix shows 0).
    terminal_amount: { min: 73, median: 1200, max: 73332 },
  },
  // processed_at gov 2021-04-11..2026-09-16; document dates bound the generated rows.
  dates: { fromDaysAgo: 55, toDaysAgo: 2038 },
};

export const paymentTransactionsShape: TableShape = {
  table: "payment_transactions",
  totals: { utilities: 0, financial: 4, government_federal: 0 },
  source: {
    utilities: { tenant: "F1", borrowed: true },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "F1", borrowed: true },
  },
  enums: {
    // approved 3 (completed), error 1 (failed); card_not_present / visa / tillipay.
    status: [
      ["completed", 3],
      ["failed", 1],
    ],
  },
  // 2026-07-30..2026-10-14.
  dates: { fromDaysAgo: 27, toDaysAgo: 103 },
};

export const ledgerShape: TableShape = {
  table: "ledger_entries",
  totals: { utilities: 934, financial: 50618, government_federal: 63928 },
  source: {
    utilities: { tenant: "U1", borrowed: false },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "G1", borrowed: false },
  },
  enums: {
    // posted 61435 / pending 2493 across the personas.
    // Utilities: 106 voided of 934, the draft share borrowed from the whole QA.
    status_U1: [
      ["posted", 796],
      ["pending", 32],
      ["voided", 106],
    ],
    // Financial has 1 voided entry; government none.
    status_F1: [
      ["posted", 48600],
      ["pending", 2017],
      ["voided", 1],
    ],
    status_G1: [
      ["posted", 61435],
      ["pending", 2493],
    ],
    // ledger_postings account; the appendix lists 2100 Tax Payable, which the
    // CoA here keeps as 2200 because 2100 is the system Wallet Liability.
    account: [
      ["1200", 62509],
      ["2200", 31600],
      ["4100", 31600],
      ["1000", 26347 + 1344],
      ["4500", 3837],
      ["2000", 1419],
      ["6140", 270],
      ["6120", 260],
      ["6130", 270],
    ],
  },
  numbers: {
    // debit/credit amount.
    amount: { min: 37.71, median: 39072.66, max: 182837.24 },
  },
  // entry_date gov 2021-03-17..2026-10-07; financial created_at 2026-07-11..; utilities 2026-06-22...
  dates: { fromDaysAgo: 34, toDaysAgo: 2064 },
};

export const ledgerWindow: Record<"U1" | "F1" | "G1", DayWindow> = {
  U1: { fromDaysAgo: 13, toDaysAgo: 141 },
  F1: { fromDaysAgo: 1, toDaysAgo: 122 },
  G1: { fromDaysAgo: 34, toDaysAgo: 2064 },
};

export const chartOfAccountsShape: TableShape = {
  table: "chart_of_accounts",
  // utilities 13 inactive leftovers; gov 10 system rows; financial none (synthetic 30).
  totals: { utilities: 13, financial: 30, government_federal: 10 },
  source: {
    // Gov is the clean default system CoA; every persona renders that shape, extended.
    utilities: { tenant: "G1", borrowed: true },
    financial: { tenant: "G1", borrowed: true },
    government_federal: { tenant: "G1", borrowed: false },
  },
  enums: {
    // government_federal: revenue 4, asset 2, liability 2, expense 2 (all system, active).
    type: [
      ["revenue", 4],
      ["asset", 2],
      ["liability", 2],
      ["expense", 2],
    ],
    // All 10 gov rows are active; utilities has inactive leftovers: a small
    // synthetic inactive share on non-system accounts.
    active: [
      ["yes", 85],
      ["no", 15],
    ],
  },
  numbers: {
    // current_balance is null throughout in QA: invented magnitudes.
    balance: { min: 1500, median: 42000, max: 480000 },
  },
};

export const productsShape: TableShape = {
  table: "products",
  totals: { utilities: 1145, financial: 24, government_federal: 3 },
  source: {
    utilities: { tenant: "U1", borrowed: false },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "F1", borrowed: true },
  },
  enums: {
    // service 896, product 249; plan is a small synthetic share (subscription plan lines).
    type_U1: [
      ["service", 896],
      ["product", 249],
      ["plan", 60],
    ],
    // 7 products and 17 services; plans synthetic.
    type_F1: [
      ["service", 17],
      ["product", 7],
      ["plan", 8],
    ],
    status_U1: [
      ["archived", 1126],
      ["active", 19],
    ],
    // Financial and government products are live; no archived share is profiled.
    status_F1: [
      ["active", 24],
      ["archived", 2],
    ],
    // category revenue 1128, expense 11, both 6.
    category: [
      ["revenue", 1128],
      ["expense", 11],
      ["both", 6],
    ],
    // metadata.provider is null on every row: all show the Beacon badge.
    source: [["Beacon", 1]],
    // sku set on 106 of 1145 rows.
    has_sku: [
      ["yes", 106],
      ["no", 1039],
    ],
    // Description set on 55 of 1145 rows.
    has_description: [
      ["yes", 55],
      ["no", 1090],
    ],
  },
  numbers: {
    // defaultPrice utilities -10/49.99/45000 (floor at 0 here); financial 0..10000.
    default_price_U1: { min: 0, median: 49.99, max: 45000 },
    default_price_F1: { min: 0, median: 199, max: 10000 },
    // Units in stock for products (invented; QA has no stock profile).
    stock: { min: 0, median: 25, max: 400 },
  },
};

export const subscriptionsShape: TableShape = {
  table: "customer_subscriptions",
  totals: {
    utilities: 286,
    financial: 2200,
    government_federal: FINANCE_COUNTS.subscriptions,
  },
  source: {
    utilities: { tenant: "U1", borrowed: false },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "F1", borrowed: true },
  },
  enums: {
    status_F1: [
      ["active", 1320],
      ["canceled", 330],
      ["past_due", 176],
      ["trialing", 176],
      ["paused", 132],
      ["draft", 66],
    ],
    status_U1: [
      ["canceled", 264],
      ["draft", 12],
      ["active", 8],
      ["paused", 2],
    ],
    // Customer split: 1211 contact, 989 organization.
    customer_kind: [
      ["contact", 1211],
      ["organization", 989],
    ],
    // billing_mode anniversary 1478 / calendar 722.
    billing_mode: [
      ["anniversary", 1478],
      ["calendar", 722],
    ],
    // subscription_items billing_frequency.
    billing: [
      ["monthly", 3329],
      ["annual", 1101],
    ],
  },
  numbers: {
    // sum(quantity * unit_price) of active items per subscription.
    amount: { min: 0, median: 52259, max: 766600 },
  },
  // start_date 2023-07-27..2026-06-11; next_billing_date up to 2026-12-09.
  dates: { fromDaysAgo: 152, toDaysAgo: 1203 },
};

/** created_at 2026-07-11 (migration date). */
export const subscriptionsCreatedWindow = { fromDaysAgo: 120, toDaysAgo: 124 };

/** next_billing_date up to 2026-12-09. */
export const subscriptionNextBillAheadDays = 29;

export const rateCardsShape: TableShape = {
  table: "rate_cards",
  // 2 rows platform-wide, none for the personas.
  totals: {
    utilities: FINANCE_COUNTS.rateCards,
    financial: FINANCE_COUNTS.rateCards,
    government_federal: FINANCE_COUNTS.rateCards,
  },
  source: {
    utilities: { tenant: "any", borrowed: true },
    financial: { tenant: "any", borrowed: true },
    government_federal: { tenant: "any", borrowed: true },
  },
  enums: {
    // Both QA rows are open-ended (active); the rest is a synthetic spread.
    status: [
      ["active", 70],
      ["scheduled", 10],
      ["expired", 20],
    ],
    kind: [
      ["bill", 80],
      ["cost", 20],
    ],
    applies_bill: [
      ["Customer", 80],
      ["Tenant default", 20],
    ],
  },
  // rate_kind bill (2 rows); cost is a synthetic share.
  // Scope customer (2 rows); Tenant default and Staff are synthetic.
  numbers: {
    // rate 20..120; the appendix median is a 0 placeholder, 55 is invented.
    rate: { min: 20, median: 55, max: 120 },
  },
  // effective_from 2026-10-25..2026-10-26; spread wider here.
  dates: { fromDaysAgo: 0, toDaysAgo: 365 },
};

export type FinanceRowSet =
  | "invoices"
  | "recurring"
  | "outbox"
  | "readyToInvoice"
  | "settlements"
  | "bills"
  | "billInbox"
  | "payments"
  | "ledger"
  | "chartOfAccounts"
  | "products"
  | "subscriptions"
  | "rateCards";

/** Live totals per row set; payments adds payment_transactions to pay. */
export const financeTotals: Record<
  FinanceRowSet,
  Record<PersonaKey, number>
> = {
  invoices: arShape.totals,
  recurring: recurringShape.totals,
  outbox: outboxShape.totals,
  readyToInvoice: readyToInvoiceShape.totals,
  settlements: settlementsShape.totals,
  bills: apShape.totals,
  billInbox: billInboxShape.totals,
  payments: {
    utilities:
      payShape.totals.utilities + paymentTransactionsShape.totals.utilities,
    financial:
      payShape.totals.financial + paymentTransactionsShape.totals.financial,
    government_federal:
      payShape.totals.government_federal +
      paymentTransactionsShape.totals.government_federal,
  },
  ledger: ledgerShape.totals,
  chartOfAccounts: chartOfAccountsShape.totals,
  products: productsShape.totals,
  subscriptions: subscriptionsShape.totals,
  rateCards: rateCardsShape.totals,
};
