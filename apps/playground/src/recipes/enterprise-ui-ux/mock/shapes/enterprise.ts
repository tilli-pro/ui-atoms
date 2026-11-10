import type { PersonaKey } from "../../specs/types.js";
import type { TableShape } from "./types.js";

/** Aggregates profiled from the Enterprise section of the module maps appendix. */

/** Generated row count per row set; synthetic live totals equal these. */
export const ENTERPRISE_COUNTS = {
  notifications: 48,
  accessRequests: 6,
  searchResults: 48,
  workflows: 44,
  workflowRuns: 24,
  aiUsage: 8,
  spendLimits: 6,
  /** One row per surface. */
  aiAgents: 4,
  /** Months in the Revenue and Usage segments. */
  months: 12,
} as const;

/** Notifications: severity, entity and type weights are the persona's own QA counts. */
export const notificationsShape: TableShape = {
  table: "notifications",
  // Tenant totals spread across 4 / 5 / 3 user_ids; a user's bell lists only their own rows.
  totals: { utilities: 126, financial: 1687, government_federal: 95 },
  source: {
    utilities: { tenant: "U1", borrowed: false },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "G1", borrowed: false },
  },
  enums: {
    // type per tenant (QA counts).
    type_F1: [
      ["ticket.sla_breached", 1264],
      ["ai_usage.digest", 180],
      ["exchange.awaiting_review", 152],
      ["exchange.failed", 48],
      ["appointment.booked", 20],
      ["appointment.cancelled", 15],
      ["automation.ownerless", 4],
      ["partner.invitation_received", 4],
    ],
    type_U1: [
      ["ai_usage.digest", 48],
      ["exchange.failed", 24],
      ["appointment.cancelled", 17],
      ["appointment.booked", 17],
      ["ticket.sla_breached", 12],
      ["partner.revoked", 2],
      ["exchange.awaiting_review", 2],
      ["partner.invitation_received", 2],
      ["automation.ownerless", 2],
    ],
    type_G1: [
      ["ai_usage.digest", 60],
      ["exchange.awaiting_review", 31],
      ["partner.invitation_received", 4],
    ],
    // QA severity: financial error 1312 / info 371 / warning 4; utilities info 86 / error 36 / warning 4; government all info.
    severity_F1: [
      ["error", 1312],
      ["info", 371],
      ["warning", 4],
    ],
    severity_U1: [
      ["info", 86],
      ["error", 36],
      ["warning", 4],
    ],
    severity_G1: [["info", 95]],
    // QA has no success rows; the mock flags appointment.booked as success.
    severity_synthetic: [["success", 1]],
    // QA read: financial unread 1317 / read 370 (utilities 113 / 13); the brief asks for about 40% unread.
    read: [
      ["unread", 40],
      ["read", 60],
    ],
    // entity_type (financial): ticket 1264, network_exchange 200, workspace 60, subscription 60, org 60, appointment 35, automation_ownership 4, network_partner 4.
    entity_F1: [
      ["ticket", 1264],
      ["network_exchange", 200],
      ["workspace", 60],
      ["subscription", 60],
      ["org", 60],
      ["appointment", 35],
      ["automation_ownership", 4],
      ["network_partner", 4],
    ],
  },
  // created_at utilities 2026-06-22..2026-11-03; financial and government up to 2026-11-09; the mock keeps the last 14 days.
  dates: { fromDaysAgo: 0, toDaysAgo: 14 },
};

/** Share of notifications left unread in the mock (QA is far higher). */
export const UNREAD_SHARE = 0.4;

/** memberships where role = 'pending_domain_approval'. */
export const accessRequestsShape: TableShape = {
  table: "memberships (role = pending_domain_approval)",
  // 84 in the whole DB, none for any persona; users.is_active=false is a different, unverified proxy (u 4).
  totals: { utilities: 0, financial: 0, government_federal: 0 },
  source: {
    utilities: { tenant: "any", borrowed: true },
    financial: { tenant: "any", borrowed: true },
    government_federal: { tenant: "any", borrowed: true },
  },
  enums: {},
  dates: { fromDaysAgo: 0, toDaysAgo: 20 },
};

/** tickets assigned to the viewer: rows are derived from `supportData`, not regenerated. */
export const myTicketsShape: TableShape = {
  table: "tickets (assigned_to set)",
  // Only financial has assigned tickets (376).
  totals: { utilities: 0, financial: 376, government_federal: 0 },
  source: {
    utilities: { tenant: "F1", borrowed: true },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "F1", borrowed: true },
  },
  // status among assigned (financial): waiting_internal 147, closed 88, resolved 58, confirmed 24, in_progress 23, waiting_customer 16, assigned 15, reopened 5.
  enums: {
    status_F1: [
      ["waiting_internal", 147],
      ["closed", 88],
      ["resolved", 58],
      ["confirmed", 24],
      ["in_progress", 23],
      ["waiting_customer", 16],
      ["assigned", 15],
      ["reopened", 5],
    ],
  },
};

/** Cross-module search results: synthetic, titles come from the other modules' data. */
export const searchShape: TableShape = {
  table:
    "search (tickets/contacts/organizations/ar/pay/quotes/subscriptions/forms)",
  totals: {
    utilities: ENTERPRISE_COUNTS.searchResults,
    financial: ENTERPRISE_COUNTS.searchResults,
    government_federal: ENTERPRISE_COUNTS.searchResults,
  },
  source: {
    utilities: { tenant: "any", borrowed: true },
    financial: { tenant: "any", borrowed: true },
    government_federal: { tenant: "any", borrowed: true },
  },
  // agent_command_result_rows is EMPTY in QA; rows are invented, evenly across the 8 groups.
  enums: {
    group: [
      ["Persons", 1],
      ["Organizations", 1],
      ["Tickets", 1],
      ["Invoices", 1],
      ["Payments", 1],
      ["Quotes", 1],
      ["Subscriptions", 1],
      ["Applications", 1],
    ],
  },
};

/** mv_monthly_revenue: 5 / 22 / 78 persona rows; magnitudes come from ar totals and volumes. */
export const monthlyRevenueShape: TableShape = {
  table: "mv_monthly_revenue",
  totals: { utilities: 5, financial: 22, government_federal: 78 },
  source: {
    utilities: { tenant: "U2", borrowed: false },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "G1", borrowed: false },
  },
  enums: {},
  numbers: {
    // Invoiced per month = invoices per month (ar rows / mv months: 128/5, 15747/22, 35626/78) x median total_amount (200 / 25048.81 / 52424.31).
    invoiced_U2: { min: 3900, median: 5200, max: 6700 },
    invoiced_F1: { min: 14_000_000, median: 17_900_000, max: 21_500_000 },
    invoiced_G1: { min: 17_500_000, median: 20_900_000, max: 24_500_000 },
    // Collected share of invoiced (paid_cents / total_cents): QA ar is mostly paid for government (26780 of 35626); the others are invented.
    collection_rate: { min: 0.62, median: 0.84, max: 0.97 },
  },
  dates: { fromDaysAgo: 0, toDaysAgo: 330 },
};

/** mv_payment_methods: grouped from the Finance payments rows (ach / card / wire / check in QA). */
export const paymentMethodsShape: TableShape = {
  table: "mv_payment_methods",
  totals: { utilities: 6, financial: 55, government_federal: 157 },
  source: {
    utilities: { tenant: "U1", borrowed: false },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "G1", borrowed: false },
  },
  enums: {
    method: [
      ["ach", 7640],
      ["card", 6900],
      ["wire", 6710],
      ["check", 6572],
    ],
  },
};

/** Aging buckets over ar balances (current, 1-30, 31-60, 61-90, 90+). */
export const AGING_BUCKETS = [
  "Current",
  "1-30 days",
  "31-60 days",
  "61-90 days",
  "90+ days",
] as const;

/** mv_daily_usage: 0 rows for every persona (6 in the whole DB), so Usage is synthetic. */
export const dailyUsageShape: TableShape = {
  table: "mv_daily_usage / usage_records",
  totals: {
    utilities: ENTERPRISE_COUNTS.months,
    financial: ENTERPRISE_COUNTS.months,
    government_federal: ENTERPRISE_COUNTS.months,
  },
  source: {
    utilities: { tenant: "any", borrowed: true },
    financial: { tenant: "any", borrowed: true },
    government_federal: { tenant: "any", borrowed: true },
  },
  enums: {},
  numbers: {
    // usage_records quantity is 1/3/30 (metric jareis_conversations only); monthly values are invented per persona.
    value_utilities: { min: 180_000, median: 240_000, max: 310_000 },
    value_financial: { min: 20_000, median: 31_000, max: 44_000 },
    value_government_federal: { min: 4_000, median: 6_500, max: 9_500 },
  },
};

/** Usage measure label per persona (the personas' terms carry none). */
export const usageMeasure: Record<PersonaKey, string> = {
  utilities: "Energy delivered (kWh)",
  financial: "Transactions processed",
  government_federal: "Service requests handled",
};

export const workflowsShape: TableShape = {
  table: "workflows",
  // Live counts u/f/g = 9 / 8 / 4 (232 across 54 tenants; no archived workflow in QA).
  totals: { utilities: 9, financial: 8, government_federal: 4 },
  source: {
    utilities: { tenant: "U1", borrowed: false },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "G1", borrowed: false },
  },
  enums: {
    // QA status counts per persona; paused and archived are synthetic (whole table: active 208, draft 20, paused 4).
    status_U1: [
      ["active", 5],
      ["draft", 4],
      ["paused", 2],
      ["archived", 2],
    ],
    status_F1: [
      ["active", 6],
      ["draft", 2],
      ["paused", 2],
      ["archived", 2],
    ],
    status_G1: [
      ["active", 4],
      ["draft", 1],
      ["paused", 2],
      ["archived", 2],
    ],
    // trigger_type is manual on all 207 trigger rows; the other four are invented in a small share.
    trigger: [
      ["manual", 207],
      ["event", 60],
      ["schedule", 80],
      ["api", 25],
      ["condition", 15],
    ],
    category: [
      ["collections", 202],
      ["billing", 12],
      ["banking", 6],
      ["government", 4],
      ["support", 2],
      ["marketing", 2],
    ],
  },
  numbers: {
    // QA execution_count is 0/0/3; the mock invents a livelier history for non-draft rows.
    execution_count_QA: { min: 0, median: 0, max: 3 },
    executions: { min: 1, median: 24, max: 260 },
    // Invented (QA runs are mostly failures from test data).
    success_rate: { min: 62, median: 93, max: 100 },
  },
  // created_at 2026-06-23..2026-11-09.
  dates: { fromDaysAgo: 1, toDaysAgo: 140 },
};

export const workflowRunsShape: TableShape = {
  table: "workflow_executions",
  totals: { utilities: 13, financial: 5, government_federal: 0 },
  source: {
    utilities: { tenant: "U1", borrowed: false },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "G1", borrowed: true },
  },
  enums: {
    // QA whole table: failed 15, completed 6 (no running).
    status_QA: [
      ["failed", 15],
      ["succeeded", 6],
    ],
    // Invented mix so the Workflow runs panel is not all failures; running rows are recent.
    status: [
      ["succeeded", 70],
      ["failed", 22],
      ["running", 8],
    ],
  },
  numbers: {
    // duration seconds 0/0.049/1 in QA; the mock invents longer runs.
    duration_succeeded: { min: 3, median: 48, max: 900 },
    duration_failed: { min: 1, median: 12, max: 300 },
    // workflow_steps per workflow 1/3/9.
    steps: { min: 1, median: 3, max: 9 },
  },
  // started 2026-06-23..2026-10-26; the mock keeps the last 20 days.
  dates: { fromDaysAgo: 0, toDaysAgo: 20 },
};

export const aiAgentSettingsShape: TableShape = {
  table: "ai_agent_settings",
  // Utilities and financial have a row (enabledSurfaces ['chat']); government_federal has none.
  totals: { utilities: 1, financial: 1, government_federal: 0 },
  source: {
    utilities: { tenant: "U1", borrowed: false },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "G1", borrowed: false },
  },
  enums: {
    surface: [
      ["chat", 1],
      ["radar_dashboard", 1],
      ["voice", 1],
      ["command_console", 1],
    ],
    // enabledSurfaces per persona.
    enabled_surfaces_utilities: [["chat", 1]],
    enabled_surfaces_financial: [["chat", 1]],
    enabled_surfaces_government_federal: [],
  },
  dates: { fromDaysAgo: 5, toDaysAgo: 90 },
};

export const aiUsageShape: TableShape = {
  table: "ai_usage_events",
  // QA events u/f/g = 108 / 133 / 46; the By team & workspace rows are a summary, so the live total is the row count.
  totals: {
    utilities: ENTERPRISE_COUNTS.aiUsage,
    financial: ENTERPRISE_COUNTS.aiUsage,
    government_federal: ENTERPRISE_COUNTS.aiUsage,
  },
  source: {
    utilities: { tenant: "U1", borrowed: false },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "G1", borrowed: false },
  },
  enums: {
    // surface counts (financial): jareis_chat 126, media_generation 7; the mock maps to chat / radar / voice.
    surface: [
      ["chat", 80],
      ["radar", 12],
      ["voice", 8],
    ],
    // ai_budgets is EMPTY in QA ("No cap" everywhere); the policy mix is invented.
    policy: [
      ["soft", 40],
      ["hard", 35],
      ["none", 25],
    ],
    level: [
      ["team", 5],
      ["workspace", 3],
    ],
  },
  numbers: {
    // sum(cost_cents) per tenant in dollars: utilities 7.77, financial 13.33, government 15.38 (QA is tiny; the mock scales x40).
    spend_utilities: { min: 310, median: 310, max: 310 },
    spend_financial: { min: 533, median: 533, max: 533 },
    spend_government_federal: { min: 615, median: 615, max: 615 },
    // budget as a multiple of spend.
    budget_multiple: { min: 1.05, median: 1.8, max: 4 },
  },
};

export const aiBudgetsShape: TableShape = {
  table: "ai_budgets",
  // EMPTY in QA for every persona.
  totals: { utilities: 0, financial: 0, government_federal: 0 },
  source: {
    utilities: { tenant: "any", borrowed: true },
    financial: { tenant: "any", borrowed: true },
    government_federal: { tenant: "any", borrowed: true },
  },
  enums: {
    period: [
      ["monthly", 75],
      ["daily", 25],
    ],
    policy: [
      ["hard", 50],
      ["soft", 50],
    ],
  },
  numbers: {
    used_share: { min: 0.1, median: 0.45, max: 1.05 },
  },
};
