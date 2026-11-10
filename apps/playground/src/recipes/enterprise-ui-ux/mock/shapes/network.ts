import type { TableShape } from "./types.js";

/** Aggregates profiled from the Network section of the module maps appendix. */

export const contactsShape: TableShape = {
  table: "contacts",
  // Live (is_deleted = false) counts, not raw rows.
  totals: { utilities: 107, financial: 1255, government_federal: 2547 },
  source: {
    utilities: { tenant: "U1", borrowed: false },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "G1", borrowed: false },
  },
  enums: {
    // Not profiled: default 70/20/10.
    facet: [
      ["customer", 70],
      ["vendor", 20],
      ["employee", 10],
    ],
    customer_type: [
      ["residential", 647],
      ["commercial", 344],
      ["unspecified", 264],
    ],
  },
  // 2026-03-17..2026-11-06 (government_federal live, the widest window).
  dates: { fromDaysAgo: 4, toDaysAgo: 238 },
};

export const accountsShape: TableShape = {
  table: "accounts",
  totals: { utilities: 9860, financial: 2266, government_federal: 2653 },
  source: {
    utilities: { tenant: "U1", borrowed: false },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "G1", borrowed: false },
  },
  enums: {
    // Share of accounts with attributes.balance present, per persona.
    balance_present_utilities: [
      ["yes", 4],
      ["no", 9856],
    ],
    balance_present_financial: [
      ["yes", 2001],
      ["no", 265],
    ],
    balance_present_government_federal: [
      ["yes", 2633],
      ["no", 20],
    ],
    // Share of accounts with pastDueAmount > 0, per persona.
    past_due_utilities: [
      ["yes", 0],
      ["no", 1],
    ],
    past_due_financial: [
      ["yes", 446],
      ["no", 1820],
    ],
    past_due_government_federal: [
      ["yes", 1179],
      ["no", 1474],
    ],
  },
  numbers: {
    // attributes.balance: utilities 10/10/10, financial 0/1411.44/49402.83, gov 0/0/1628066.28
    balance_utilities: { min: 10, median: 10, max: 10 },
    balance_financial: { min: 0, median: 1411.44, max: 49_402.83 },
    balance_government_federal: { min: 0, median: 1693.83, max: 1_628_066.28 },
    // attributes.pastDueAmount (> 0)
    pastDue_financial: { min: 1, median: 623.62, max: 1992.26 },
    pastDue_government_federal: { min: 1, median: 1693.83, max: 1_313_429.25 },
  },
  // dueDate: financial 2026-05-12..2026-08-10, gov up to 2026-09-20 (older tail clipped).
  dates: { fromDaysAgo: 51, toDaysAgo: 182 },
};

export const organizationsShape: TableShape = {
  table: "organizations",
  // Live counts per verifier corrections.
  totals: { utilities: 99, financial: 1164, government_federal: 117 },
  source: {
    utilities: { tenant: "U1", borrowed: true },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "G1", borrowed: false },
  },
  enums: {
    // Not profiled: default 70/20/10 (commercial / vendor / internal).
    facet: [
      ["commercial", 70],
      ["vendor", 20],
      ["internal", 10],
    ],
    industry_financial: [
      ["Real Estate", 73],
      ["Media", 62],
      ["Technology", 61],
      ["Education", 60],
      ["Legal Services", 56],
      ["Government", 54],
      ["Consulting", 54],
      ["Manufacturing", 52],
      ["Insurance", 51],
      ["Telecommunications", 51],
      ["Utilities", 51],
      ["Energy", 51],
    ],
    industry_utilities: [
      ["Unspecified", 90],
      ["Technology", 7],
      ["Manufacturing", 1],
      ["Utilities", 1],
    ],
    industry_government_federal: [
      ["Federal Government", 47],
      ["Municipal Government", 20],
      ["Federal Contractor", 20],
      ["State Government", 20],
      ["Unspecified", 3],
      ["Federal Agency", 2],
    ],
    // supplier_type (financial): drives the classification column.
    classification: [
      ["Unclassified", 662],
      ["Contractor", 100],
      ["Distributor", 92],
      ["Service provider", 83],
      ["Manufacturer", 75],
      ["Utility", 44],
      ["Inventory", 43],
      ["Aggregator", 33],
      ["Service", 31],
    ],
    // Derived roster status per persona.
    networkStatus_utilities: [
      ["connected", 1],
      ["invited", 0],
      ["not_invited", 98],
    ],
    networkStatus_financial: [
      ["connected", 4],
      ["invited", 2],
      ["not_invited", 1158],
    ],
    networkStatus_government_federal: [
      ["connected", 0],
      ["invited", 5],
      ["not_invited", 112],
    ],
  },
  dates: { fromDaysAgo: 14, toDaysAgo: 122 },
};

export const networkPartnersShape: TableShape = {
  table: "network_partners",
  totals: { utilities: 3, financial: 4, government_federal: 1 },
  source: {
    utilities: { tenant: "any", borrowed: true },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "any", borrowed: true },
  },
  enums: {
    // status / partner_type over all 70 rows.
    status: [
      ["revoked", 34],
      ["active", 34],
      ["pending", 2],
    ],
  },
  numbers: { rate_limit_per_hour: { min: 100, median: 100, max: 200 } },
  dates: { fromDaysAgo: 2, toDaysAgo: 141 },
};

export const partnerInvitationsShape: TableShape = {
  table: "network_partner_invitations",
  totals: { utilities: 32, financial: 16, government_federal: 8 },
  source: {
    utilities: { tenant: "U1", borrowed: false },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "G1", borrowed: false },
  },
  enums: {
    // status over all tenants (pending 68, accepted 18, revoked 15).
    status: [
      ["pending", 68],
      ["accepted", 18],
      ["revoked", 15],
    ],
    intent: [
      ["partner", 74],
      ["vendor", 13],
      ["referral", 14],
    ],
  },
  numbers: { ttl_days: { min: 7, median: 7, max: 7 } },
  dates: { fromDaysAgo: 22, toDaysAgo: 32 },
};

export const companiesShape: TableShape = {
  table: "network_companies",
  // Platform registry, not tenant scoped: 3 rows, no industry/region/logo, so the rest is synthetic.
  totals: { utilities: 3, financial: 3, government_federal: 3 },
  source: {
    utilities: { tenant: "any", borrowed: true },
    financial: { tenant: "any", borrowed: true },
    government_federal: { tenant: "any", borrowed: true },
  },
  enums: {
    status: [["active", 3]],
    isMine: [
      ["yes", 1],
      ["no", 19],
    ],
  },
  dates: { fromDaysAgo: 22, toDaysAgo: 60 },
};

export const exchangesShape: TableShape = {
  table: "network_exchanges",
  totals: { utilities: 6, financial: 82, government_federal: 15 },
  source: {
    utilities: { tenant: "F1", borrowed: true },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "F1", borrowed: true },
  },
  enums: {
    direction: [
      ["inbound", 47],
      ["outbound", 35],
    ],
    document_type: [
      ["invoice", 47],
      ["order", 35],
    ],
    // Includes the zero-row states only as synthetic transport_delivered rows added by the generator.
    status: [
      ["business_accepted", 49],
      ["expired", 30],
      ["dead_letter", 2],
      ["rejected", 1],
    ],
  },
  numbers: { retry_count: { min: 0, median: 0, max: 4 } },
  // financial 2026-07-11..2026-11-01
  dates: { fromDaysAgo: 9, toDaysAgo: 122 },
};

export const preExchangesShape: TableShape = {
  table: "network_pre_exchanges",
  // 0 rows in every persona: the whole table shape is synthetic.
  totals: { utilities: 0, financial: 0, government_federal: 0 },
  source: {
    utilities: { tenant: "any", borrowed: true },
    financial: { tenant: "any", borrowed: true },
    government_federal: { tenant: "any", borrowed: true },
  },
  enums: {
    status: [
      ["sent", 40],
      ["opened", 25],
      ["accepted", 20],
      ["expired", 15],
    ],
    payment: [
      ["unpaid", 40],
      ["pending", 20],
      ["paid", 30],
      ["not_required", 10],
    ],
  },
  numbers: { amount: { min: 12.75, median: 210, max: 47_925 } },
  dates: { fromDaysAgo: 1, toDaysAgo: 40 },
};
