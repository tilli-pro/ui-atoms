import type { TableShape } from "./types.js";

/** Aggregates profiled from the Operations section of the module maps appendix. */

/** Window for appointment starts: QA starts 2026-10-25..2026-11-06 (days before the anchor, 2026-11-10). */
export const appointmentsWindow = { fromDaysAgo: 4, toDaysAgo: 16 } as const;

export const appointmentsShape: TableShape = {
  table: "appointments",
  // Utilities 8 (all cancelled), financial 5, government 0.
  totals: { utilities: 8, financial: 5, government_federal: 0 },
  source: {
    // Utilities has only cancelled rows; every persona draws from the whole-table (ALL) distributions.
    utilities: { tenant: "U1", borrowed: false },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "U1", borrowed: true },
  },
  enums: {
    // ALL status: cancelled 26, completed 25, booked 21, confirmed 3, checked_in 2 (77 rows).
    status_QA: [
      ["cancelled", 26],
      ["completed", 25],
      ["booked", 21],
      ["confirmed", 3],
      ["checked_in", 2],
    ],
    // Appointments that started before the anchor: the QA mix plus the appendix's no_show (QA has none).
    status_past: [
      ["completed", 25],
      ["no_show", 3],
      ["cancelled", 8],
      ["checked_in", 1],
    ],
    // Upcoming rows: QA booked 21 / confirmed 3 (confirmed raised so Check in has rows), held invented.
    status_upcoming: [
      ["booked", 21],
      ["confirmed", 9],
      ["held", 3],
      ["cancelled", 3],
    ],
    // The anchor day is the Day view: no cancelled or held rows (those are not drawn on the calendar).
    status_today: [
      ["booked", 12],
      ["confirmed", 8],
    ],
    // ALL source: staff 68, portal 9.
    source: [
      ["staff", 68],
      ["portal", 9],
    ],
    // ALL parent_type: contact 49, organization 27 (order 1 dropped).
    customer_kind: [
      ["person", 49],
      ["organization", 27],
    ],
    // 48 of 77 appointments have order_id.
    order_link: [
      ["linked", 48],
      ["none", 29],
    ],
  },
  numbers: {
    // ends_at - starts_at in QA: 10 / 60 / 1440; the mock takes the service length instead.
    duration_min: { min: 10, median: 60, max: 1440 },
  },
  // starts 2026-10-25..2026-11-06, created 2026-10-25..2026-11-03.
  dates: appointmentsWindow,
};

export const staffShape: TableShape = {
  table: "staff_profiles",
  totals: { utilities: 2, financial: 1, government_federal: 0 },
  source: {
    utilities: { tenant: "U1", borrowed: false },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "U1", borrowed: true },
  },
  enums: {
    // ALL bookable: true 33, false 3.
    bookable: [
      ["true", 33],
      ["false", 3],
    ],
    // ALL timezone: America/New_York 12, UTC 8, Asia/Calcutta 5, America/Los_Angeles 2, one each Chicago and others.
    // The mock keeps the US zones (UTC and foreign zones dropped) so calendar hours stay readable.
    timezone: [
      ["America/New_York", 12],
      ["America/Chicago", 4],
      ["America/Los_Angeles", 4],
      ["America/Denver", 2],
      ["America/Phoenix", 1],
    ],
    // ALL rate_currency null 5 of 36: rate-less rows.
    has_rates: [
      ["true", 31],
      ["false", 5],
    ],
    // buffer_before_min 0/0/40, buffer_after_min 0/0/60: zero is the common case.
    buffer_before: [
      ["0", 60],
      ["5", 10],
      ["10", 15],
      ["15", 10],
      ["30", 5],
    ],
    buffer_after: [
      ["0", 55],
      ["5", 10],
      ["10", 15],
      ["15", 12],
      ["30", 8],
    ],
    // max_per_day is null in 27 of 36 rows; non-null values 2 / 5 / 10.
    max_per_day: [
      ["none", 27],
      ["4", 3],
      ["6", 3],
      ["8", 2],
      ["10", 1],
    ],
    // ALL start_local 08:00 113, 09:00 47; end_local 17:00 94, 20:00 35, 18:00 15 (availability_rules).
    weekly_hours: [
      ["Mon–Fri 8:00–17:00", 94],
      ["Mon–Fri 9:00–17:00", 47],
      ["Mon–Fri 8:00–20:00", 35],
      ["Mon–Fri 8:00–18:00", 15],
    ],
  },
  numbers: {
    // QA bill_rate 0/120/12000 and cost_rate 0/45/5000 mix currencies and test values; the mock keeps the USD hourly range.
    bill_rate: { min: 60, median: 120, max: 240 },
    cost_rate: { min: 25, median: 45, max: 95 },
  },
  // staff_profiles created 2026-10-25..2026-11-08.
  dates: { fromDaysAgo: 2, toDaysAgo: 16 },
};

export const servicesShape: TableShape = {
  table: "service_offerings",
  totals: { utilities: 2, financial: 2, government_federal: 0 },
  source: {
    // Utilities has 2 inactive phone services; ALL (39 rows) is the better base.
    utilities: { tenant: "U1", borrowed: false },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "U1", borrowed: true },
  },
  enums: {
    // ALL active: true 30, false 9.
    active: [
      ["true", 30],
      ["false", 9],
    ],
    // ALL location_kind: onsite 16, phone 13, in_person 6, video 4.
    location: [
      ["on_site", 16],
      ["phone", 13],
      ["in_person", 6],
      ["video", 4],
    ],
    // ALL assignment: specific 36, any_available 3.
    assignment: [
      ["specific", 36],
      ["any_available", 3],
    ],
    // ALL creates_order: service 22, none 9, work 8.
    creates: [
      ["service_order", 22],
      ["none", 9],
      ["work_order", 8],
    ],
    // ALL billing_style: none 17, time_material 12, fixed 8, per_session 2.
    billing_style: [
      ["none", 17],
      ["time_material", 12],
      ["fixed", 8],
      ["per_session", 2],
    ],
    // Billed styles for services that create a service order (a styled service never reads "Not billed").
    billing_billed: [
      ["time_material", 12],
      ["fixed", 8],
      ["per_session", 2],
    ],
    // service_offering_staff: staff per offering 1 (31), 2 (2), 3 (3), 4 (1), 5 (1).
    booked_with: [
      ["1", 31],
      ["2", 2],
      ["3", 3],
      ["4", 1],
      ["5", 1],
    ],
    // work_cost_center on work-creating services: DEMO-CC style codes in QA; the mock invents its own below.
  },
  numbers: {
    // duration_min 30/45/60 (utilities) and 20/60/120 (financial).
    duration_min: { min: 20, median: 45, max: 120 },
  },
  // service_offerings created 2026-10-25..2026-11-08.
  dates: { fromDaysAgo: 2, toDaysAgo: 16 },
};

export const serviceOrdersShape: TableShape = {
  table: "orders (direction=sales, fulfilment=service)",
  // Utilities has 4 service orders (all cancelled), financial and government have 0.
  totals: { utilities: 4, financial: 0, government_federal: 0 },
  source: {
    utilities: { tenant: "U1", borrowed: false },
    financial: { tenant: "U1", borrowed: true },
    government_federal: { tenant: "U1", borrowed: true },
  },
  enums: {
    // ALL status: in_progress 9, draft 8, cancelled 8, confirmed 3, completed 2, submitted 1; scheduled invented (Schedule bulk action).
    status: [
      ["in_progress", 9],
      ["draft", 8],
      ["cancelled", 8],
      ["scheduled", 4],
      ["confirmed", 3],
      ["completed", 4],
      ["submitted", 1],
    ],
    // ALL billing_state: none 21, partially_invoiced 10 (no invoiced).
    billing_state_QA: [
      ["none", 21],
      ["partially_invoiced", 10],
    ],
    // Open and cancelled rows (applied by status in the generator): QA mix.
    billing_state_open: [
      ["none", 21],
      ["partially_invoiced", 10],
    ],
    // Completed rows: the Invoiced state the column vocabulary offers (QA has none), invented.
    billing_state_completed: [
      ["invoiced", 8],
      ["partially_invoiced", 5],
      ["none", 4],
    ],
    // ALL billing_mode: per_appointment 22 (per_session), on_completion 9 (fixed).
    billing_mode: [
      ["per_session", 22],
      ["fixed", 9],
    ],
    // Counterparty is an external contact or organization.
    customer_kind: [
      ["person", 55],
      ["organization", 45],
    ],
  },
  numbers: {
    // total 0/100/250 (utilities) and 0/120/2275 (all); QA zeros are test artefacts, so the mock lifts the floor.
    total: { min: 80, median: 240, max: 2275 },
    // Share of the total already invoiced on a partially invoiced order.
    invoiced_share: { min: 0.15, median: 0.5, max: 0.85 },
  },
  // created 2026-10-25..2026-11-03.
  dates: { fromDaysAgo: 0, toDaysAgo: 16 },
};

export const internalOrdersShape: TableShape = {
  table: "orders (direction=internal, work orders)",
  // Utilities has none, financial 3 (cancelled, closed, draft), government none.
  totals: { utilities: 0, financial: 3, government_federal: 0 },
  source: {
    utilities: { tenant: "F1", borrowed: true },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "F1", borrowed: true },
  },
  enums: {
    // ALL status: closed 6, draft 5, cancelled 4, in_progress 2, scheduled 1; completed added (the Complete bulk action).
    status: [
      ["closed", 6],
      ["draft", 5],
      ["cancelled", 4],
      ["in_progress", 3],
      ["scheduled", 3],
      ["completed", 3],
    ],
    // 17 of 18 rows carry a cost_center; null on 1.
    has_cost_centre: [
      ["true", 17],
      ["false", 1],
    ],
  },
  numbers: {
    // total 0/0/5600 (mostly zero in QA); the mock lifts the floor so the column has figures.
    total: { min: 150, median: 900, max: 5600 },
  },
  // created and order_date 2026-10-25..2026-10-29.
  dates: { fromDaysAgo: 0, toDaysAgo: 16 },
};

export const timeEntriesShape: TableShape = {
  table: "time_entries",
  // Utilities 0, financial 2 (approved), government 0; QA has one submitted entry overall.
  totals: { utilities: 0, financial: 2, government_federal: 0 },
  source: {
    utilities: { tenant: "any", borrowed: true },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "any", borrowed: true },
  },
  enums: {
    // ALL status: approved 8, invoiced 7, draft 6, submitted 1. The approval queue would be empty, so the mock invents a mix with exact counts (weights sum to the row count).
    status: [
      ["submitted", 12],
      ["approved", 14],
      ["costed", 9],
      ["rejected", 5],
    ],
    // ALL billable: false 15, true 7.
    billable: [
      ["false", 15],
      ["true", 7],
    ],
    // QA notes are null everywhere; invented share with notes.
    has_notes: [
      ["true", 55],
      ["false", 45],
    ],
  },
  numbers: {
    // QA minutes 0..3 are test artefacts; the appendix asks for 15..480 minute entries (0.5 to 9 hours here).
    hours: { min: 0.5, median: 3.5, max: 9 },
  },
  // time_entries created and started 2026-10-25..2026-10-30.
  dates: { fromDaysAgo: 0, toDaysAgo: 14 },
};

export const outagesShape: TableShape = {
  table: "outages",
  // Rows 40 on utilities, 1 on financial, 0 on government.
  totals: { utilities: 40, financial: 1, government_federal: 0 },
  source: {
    utilities: { tenant: "U1", borrowed: false },
    // Financial has a single closed-or-live row and government none: the whole-QA shape applies.
    financial: { tenant: "any", borrowed: true },
    government_federal: { tenant: "any", borrowed: true },
  },
  enums: {
    // ALL status: closed 40, confirmed 6, crew_on_site 2, restored 2, reported 1, crew_assigned 1, crew_en_route 1 (53 rows); cancelled invented (planned maintenance only).
    status: [
      ["closed", 40],
      ["confirmed", 6],
      ["crew_on_site", 2],
      ["restored", 2],
      ["reported", 1],
      ["crew_assigned", 1],
      ["crew_en_route", 1],
      ["cancelled", 3],
    ],
    // ALL type: unplanned 27, planned 21, emergency 4, partial 1.
    type: [
      ["unplanned", 27],
      ["planned", 21],
      ["emergency", 4],
      ["partial", 1],
    ],
    // ALL cause: null 31, maintenance 8, weather 6, vehicle 4, equipment 2, vegetation 1, animal 1.
    cause: [
      ["none", 31],
      ["maintenance", 8],
      ["weather", 6],
      ["vehicle", 4],
      ["equipment", 2],
      ["vegetation", 1],
      ["animal", 1],
    ],
    // Causes for unplanned rows: the unplanned QA causes with null kept.
    cause_unplanned: [
      ["none", 31],
      ["weather", 6],
      ["vehicle", 4],
      ["equipment", 2],
      ["vegetation", 1],
      ["animal", 1],
    ],
    // estimated_restoration_at is set on 13 of 40 (utilities).
    has_ert: [
      ["true", 13],
      ["false", 27],
    ],
  },
  numbers: {
    // customers_affected is 0 for every utilities row (max 414 in all QA); the mock lifts the floor so the column has figures.
    customers_affected: { min: 12, median: 90, max: 414 },
  },
  // reported/created 2026-07-23..2026-10-19 (utilities).
  dates: { fromDaysAgo: 22, toDaysAgo: 110 },
};

export const serviceAreasShape: TableShape = {
  table: "service_areas",
  // Utilities has none, financial 1 (5 across 4 tenants), government none.
  totals: { utilities: 0, financial: 1, government_federal: 0 },
  source: {
    utilities: { tenant: "any", borrowed: true },
    financial: { tenant: "F1", borrowed: false },
    government_federal: { tenant: "any", borrowed: true },
  },
  enums: {
    // is_active true on all 5 rows.
    is_active: [["true", 5]],
  },
  numbers: {
    // match_criteria holds postalCodes; the mock shows a locality count per area.
    localities: { min: 2, median: 5, max: 9 },
  },
  // created 2026-07-21..2026-08-05.
  dates: { fromDaysAgo: 97, toDaysAgo: 112 },
};
