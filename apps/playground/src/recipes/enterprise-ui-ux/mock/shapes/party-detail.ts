import { contactsShape } from "./network.js";
import type { TableShape } from "./types.js";

/** Aggregates for the contact and organization profile pages (spec section 6.2). */
export const partyDetailShape: TableShape = {
  table: "contacts+organizations+accounts+party_addresses",
  totals: contactsShape.totals,
  // The profile shape is cross-tenant aggregates, not one tenant's rows.
  source: {
    utilities: { tenant: "any", borrowed: true },
    financial: { tenant: "any", borrowed: true },
    government_federal: { tenant: "any", borrowed: true },
  },
  enums: {
    // party_addresses.type over the whole QA dump.
    address_type: [
      ["service", 25_460],
      ["mailing", 22_238],
      ["billing", 6135],
    ],
    // accounts.type over the whole QA dump.
    account_type: [
      ["customer", 53_692],
      ["unclassified", 22_083],
      ["vendor", 1663],
      ["employee", 259],
    ],
    // contacts linked per organization over the whole QA dump.
    contacts_per_org: [
      ["1", 6061],
      ["2", 1078],
      ["3", 168],
      ["4", 26],
      ["5", 9],
      ["31", 60],
      ["32", 20],
    ],
    // from the ERP id keys in contacts.custom_fields
    source: [
      ["Beacon", 35],
      ["SAP", 60],
      ["Oracle", 5],
    ],
    // synthetic: 0 rows in QA
    supplier_tier: [
      ["Preferred", 3],
      ["Approved", 5],
      ["Conditional", 2],
    ],
    // synthetic: 0 rows in QA
    supplier_status: [
      ["Active", 7],
      ["Under review", 2],
      ["Suspended", 1],
    ],
    // synthetic: duplicate candidates are not stored in QA
    duplicate_signal: [
      ["email", 5],
      ["phone", 3],
      ["name + address", 2],
    ],
    // synthetic: preferred language mix
    language: [
      ["English", 90],
      ["Spanish", 8],
      ["French", 2],
    ],
    // synthetic: stored payment instrument mix
    instrument_type: [
      ["card", 6],
      ["ach", 3],
      ["wire", 1],
    ],
  },
  numbers: {
    // accounts.attributes.averageMonthlyBill (dollars)
    average_monthly_bill: { min: 35, median: 180, max: 2400 },
    // synthetic: supplier spend year to date
    spend_ytd: { min: 1200, median: 48_000, max: 1_250_000 },
    // synthetic: duplicate and social match confidence (percent)
    confidence: { min: 72, median: 86, max: 96 },
  },
  // last_synced_at window (synthetic)
  dates: { fromDaysAgo: 1, toDaysAgo: 60 },
};

/** Share of contacts with a title (13% in QA). */
export const TITLE_RATE = 0.13;
/** Share of contacts with a department (41% in QA). */
export const DEPARTMENT_RATE = 0.41;
/** Share of parties with a mobile number (9% in QA). */
export const MOBILE_RATE = 0.09;
/** Share of contacts linked to an organization (19% in QA). */
export const CONTACT_HAS_ORG_RATE = 0.19;
/** Share of organizations with a website (89% in QA). */
export const ORG_HAS_WEBSITE_RATE = 0.89;
/** Share of parties with a mailing address (85% in QA). */
export const MAILING_RATE = 0.85;
/** Share of parties with a billing address (25% in QA). */
export const BILLING_RATE = 0.25;
/** Share of parties holding two accounts (1% in QA). */
export const TWO_ACCOUNTS_RATE = 0.01;
/** Share of parties with duplicate candidates (synthetic). */
export const DUPLICATE_RATE = 0.12;
/** Share of contact methods that are verified (synthetic). */
export const VERIFIED_RATE = 0.5;

/** Inclusive [min, max] related record counts per profile tab (synthetic). */
export const RELATED_COUNTS = {
  invoices: [0, 8],
  payments: [0, 6],
  tickets: [0, 4],
  interactions: [0, 10],
} as const;
