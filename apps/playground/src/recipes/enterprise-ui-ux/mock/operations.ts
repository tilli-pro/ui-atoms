import {
  byDateAsc,
  DAY_MS,
  numberRange,
  plusDays,
  round2,
  weights,
} from "./finance/common.js";
import { moneyFrom } from "./money.js";
import {
  emailFor,
  organizationsByIndustry,
  personName,
  productsByIndustry,
  serviceAreas as serviceAreaNames,
  staffNames,
} from "./names.js";
import { ANCHOR, createRng, type Rng, seedFor } from "./random.js";
import {
  appointmentsShape,
  internalOrdersShape,
  outagesShape,
  serviceAreasShape,
  serviceOrdersShape,
  servicesShape,
  staffShape,
  timeEntriesShape,
} from "./shapes/operations.js";
import type { Persona, PersonaKey, Row } from "../specs/types.js";

export type AppointmentStatus =
  | "held"
  | "booked"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "no_show"
  | "cancelled";
export type ServiceLocation = "in_person" | "phone" | "video" | "on_site";
export type ServiceCreates = "service_order" | "work_order" | "none";
export type ServiceBilling = "fixed" | "per_session" | "time_material" | "none";
export type WorkOrderKind = "service" | "internal";
export type WorkOrderStatus =
  | "draft"
  | "submitted"
  | "confirmed"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "closed"
  | "cancelled";
export type BillingState = "none" | "partially_invoiced" | "invoiced";
export type TimesheetStatus = "submitted" | "approved" | "rejected" | "costed";
export type OutageType = "unplanned" | "planned" | "emergency" | "partial";
export type OutageStatus =
  | "reported"
  | "confirmed"
  | "crew_assigned"
  | "crew_en_route"
  | "crew_on_site"
  | "restored"
  | "closed";

/** staff_profiles. Money is a plain USD number; null when the profile has no rate. */
export type OperationsStaff = Row & {
  name: string;
  email: string;
  /** IANA zone (US zones). */
  timeZone: string;
  bookable: boolean;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  /** null renders as "--". */
  maxPerDay: number | null;
  billRate: number | null;
  costRate: number | null;
  /** e.g. "Mon–Fri 8:00–17:00". */
  weeklyHours: string;
};

/** service_offerings. */
export type OperationsService = Row & {
  name: string;
  slug: string;
  durationMinutes: number;
  location: ServiceLocation;
  /** Staff count the service is booked with. */
  bookedWith: number;
  /** "specific" shows "A named person", "any_available" shows "Any available person". */
  assignment: "specific" | "any_available";
  /** The appendix also has work_order (8 of 39 in QA). */
  creates: ServiceCreates;
  /** Muted subline under Creates when creates is work_order. */
  workCostCentre: string | null;
  /** The appendix also has time_material (12 of 39 in QA). */
  billing: ServiceBilling;
  active: boolean;
};

/** appointments. Times are UTC instants; render in `timeZone`. */
export type OperationsAppointment = Row & {
  /** `APT-` reference, assigned in start order. */
  number: string;
  /** The service name. */
  title: string;
  service: string;
  serviceId: string;
  staff: string;
  staffId: string;
  /** Person or organization. */
  customer: string;
  startsAt: Date;
  /** startsAt plus the service length. */
  endsAt: Date;
  /** The host's zone. */
  timeZone: string;
  status: AppointmentStatus;
  location: ServiceLocation;
  /** Linked SVC order number, or null. */
  orderNumber: string | null;
  notes: string | null;
};

/** orders with fulfilment service (SVC-) or internal work (WO-). */
export type OperationsWorkOrder = Row & {
  number: string;
  kind: WorkOrderKind;
  status: WorkOrderStatus;
  /** Internal orders: cost centre code (null on a few). */
  costCentre: string | null;
  /** Service orders: billing mode (per_appointment is per_session, on_completion is fixed). */
  billing: "fixed" | "per_session" | null;
  /** Service orders: the Billing column text (Not invoiced, Partially invoiced, Invoiced). */
  billingState: BillingState | null;
  date: Date;
  /** Internal orders: the literal "Internal" (as in QA), else null. */
  requester: string | null;
  /** Service orders: person or organization, else null. */
  customer: string | null;
  total: number;
  /** Service orders only; 0 on internal orders. */
  invoiced: number;
  /** total minus invoiced for live service orders; 0 on internal and cancelled orders. */
  uninvoiced: number;
  currency: "USD";
};

/** time_entries (synthetic: QA has one submitted entry). */
export type OperationsTimesheet = Row & {
  /** SVC- or WO- number of the order. */
  orderNumber: string;
  staff: string;
  startedAt: Date;
  /** Quarter-hour steps, 0.5 to 9. */
  hours: number;
  notes: string | null;
  /** hours times the staff cost rate; null when the staff has no rate. */
  cost: number | null;
  status: TimesheetStatus;
  billable: boolean;
};

/** outages. `planned` shows as "Scheduled maintenance". */
export type OperationsOutage = Row & {
  /** `OUT-` reference, assigned in report order. */
  number: string;
  title: string;
  type: OutageType;
  /** A service area name. */
  area: string;
  customersAffected: number;
  reportedAt: Date;
  /** Planned work start; null for unplanned rows. */
  windowStart: Date | null;
  /** Planned end or ERT; null when unknown. */
  windowEnd: Date | null;
  status: OutageStatus;
  cause: string | null;
};

export type OperationsServiceArea = Row & {
  name: string;
  /** Localities (cities and postal codes) in the area. */
  localities: number;
  /** Outages in this area that are not restored, closed or cancelled. */
  outagesActive: number;
};

export type OperationsRowSet =
  | "staff"
  | "services"
  | "appointments"
  | "workOrders"
  | "timesheets"
  | "outages"
  | "serviceAreas";

export type OperationsData = {
  staff: OperationsStaff[];
  services: OperationsService[];
  appointments: OperationsAppointment[];
  workOrders: OperationsWorkOrder[];
  timesheets: OperationsTimesheet[];
  outages: OperationsOutage[];
  serviceAreas: OperationsServiceArea[];
  /** Outages that are not restored, closed or cancelled. */
  activeOutages: number;
  /** Live counts per row set for this persona (never below the rows generated). */
  totals: Record<OperationsRowSet, number>;
};

const COUNTS = {
  extraStaff: 2,
  services: 12,
  appointmentsToday: 16,
  appointmentsWeek: 18,
  appointmentsEarlier: 12,
  serviceOrders: 26,
  internalOrders: 22,
  timesheets: 40,
  outages: 40,
} as const;
const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;
/** Standard-time UTC offsets (hours) for the US zones in use. */
const UTC_OFFSET: Record<string, number> = {
  "America/New_York": -5,
  "America/Chicago": -6,
  "America/Denver": -7,
  "America/Phoenix": -7,
  "America/Los_Angeles": -8,
};
const INACTIVE_OUTAGE = new Set<OutageStatus>(["restored", "closed"]);

const flag = (
  rng: Rng,
  shape: { enums: Record<string, never> | object },
  name: string,
) => rng.weighted(weights<string>(shape.enums as never, name)) === "true";

const kebab = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const dayStartUtc = (offsetDays: number): number =>
  Date.UTC(ANCHOR.getUTCFullYear(), ANCHOR.getUTCMonth(), ANCHOR.getUTCDate()) +
  offsetDays * DAY_MS;

const COST_CENTRES = [
  "OPS-NORTH",
  "OPS-SOUTH",
  "FLEET-01",
  "SAFETY-01",
  "FAC-MAINT",
  "FIELD-OPS",
] as const;

const staffExtras = (rng: Rng): string[] =>
  Array.from({ length: COUNTS.extraStaff }, () => personName(rng));

const genStaff = (persona: Persona): OperationsStaff[] => {
  const rng = createRng(seedFor(persona, "operations.staff"));
  const e = staffShape.enums;
  const names = [...staffNames.slice(0, 12), ...staffExtras(rng)];
  return names.map((name, i) => {
    const hasRates = flag(rng, staffShape, "has_rates");
    const maxPerDay = rng.weighted(weights<string>(e, "max_per_day"));
    return {
      id: `staff-${i + 1}`,
      name,
      email: emailFor(name, persona.tenantName),
      timeZone: rng.weighted(weights<string>(e, "timezone")),
      // The first rows stay bookable so the calendar always has hosts.
      bookable: i < 8 ? true : flag(rng, staffShape, "bookable"),
      bufferBeforeMinutes: Number(
        rng.weighted(weights<string>(e, "buffer_before")),
      ),
      bufferAfterMinutes: Number(
        rng.weighted(weights<string>(e, "buffer_after")),
      ),
      maxPerDay: maxPerDay === "none" ? null : Number(maxPerDay),
      billRate: hasRates
        ? Math.round(rng.range(numberRange(staffShape, "bill_rate")) / 5) * 5
        : null,
      costRate: hasRates
        ? Math.round(rng.range(numberRange(staffShape, "cost_rate")))
        : null,
      weeklyHours: rng.weighted(weights<string>(e, "weekly_hours")),
    };
  });
};

const SERVICE_SUFFIXES = [
  "Consultation",
  "Review",
  "Site Visit",
  "Walkthrough",
  "Appointment",
] as const;
const SELF_SERVICE = /(Inspection|Survey|Assistance|Retrieval|Support)/;

const genServices = (persona: Persona): OperationsService[] => {
  const rng = createRng(seedFor(persona, "operations.services"));
  const e = servicesShape.enums;
  const products = rng
    .shuffle(productsByIndustry[persona.key])
    .slice(0, COUNTS.services);
  return products.map((product, i) => {
    const name = SELF_SERVICE.test(product)
      ? product
      : `${product} ${rng.pick(SERVICE_SUFFIXES)}`;
    const creates = rng.weighted(weights<ServiceCreates>(e, "creates"));
    const assignment = rng.weighted(
      weights<"specific" | "any_available">(e, "assignment"),
    );
    return {
      id: `service-${i + 1}`,
      name,
      slug: kebab(name),
      durationMinutes:
        Math.round(
          rng.range(numberRange(servicesShape, "duration_min"), 0) / 15,
        ) * 15,
      location: rng.weighted(weights<ServiceLocation>(e, "location")),
      bookedWith:
        assignment === "any_available"
          ? 0
          : Number(rng.weighted(weights<string>(e, "booked_with"))),
      assignment,
      creates,
      workCostCentre: creates === "work_order" ? rng.pick(COST_CENTRES) : null,
      billing:
        creates === "none"
          ? "none"
          : rng.weighted(weights<ServiceBilling>(e, "billing_billed")),
      // The first two stay active so appointments always have a service to book.
      active: i < 2 ? true : flag(rng, servicesShape, "active"),
    };
  });
};

const genWorkOrders = (persona: Persona): OperationsWorkOrder[] => {
  const rng = createRng(seedFor(persona, "operations.workOrders"));
  const orgs = organizationsByIndustry[persona.key];
  const svcWindow = serviceOrdersShape.dates as {
    fromDaysAgo: number;
    toDaysAgo: number;
  };
  const intWindow = internalOrdersShape.dates as {
    fromDaysAgo: number;
    toDaysAgo: number;
  };
  const service = Array.from({ length: COUNTS.serviceOrders }, () => {
    const e = serviceOrdersShape.enums;
    const status = rng.weighted(weights<WorkOrderStatus>(e, "status"));
    const total = moneyFrom(rng, numberRange(serviceOrdersShape, "total"));
    const billingState: BillingState =
      status === "cancelled" || status === "draft" || status === "submitted"
        ? "none"
        : rng.weighted(
            weights<BillingState>(
              e,
              status === "completed"
                ? "billing_state_completed"
                : "billing_state_open",
            ),
          );
    const invoiced =
      status === "cancelled"
        ? 0
        : billingState === "invoiced"
          ? total
          : billingState === "partially_invoiced"
            ? round2(
                total *
                  rng.range(numberRange(serviceOrdersShape, "invoiced_share")),
              )
            : 0;
    const kind = rng.weighted(weights<string>(e, "customer_kind"));
    return {
      kind: "service" as const,
      status,
      costCentre: null,
      billing: rng.weighted(
        weights<"fixed" | "per_session">(e, "billing_mode"),
      ),
      billingState,
      date: rng.daysAgo(svcWindow.fromDaysAgo, svcWindow.toDaysAgo),
      requester: null,
      customer: kind === "person" ? personName(rng) : rng.pick(orgs),
      total,
      invoiced,
      uninvoiced: status === "cancelled" ? 0 : round2(total - invoiced),
      currency: "USD" as const,
    };
  });
  const internal = Array.from({ length: COUNTS.internalOrders }, () => {
    const e = internalOrdersShape.enums;
    return {
      kind: "internal" as const,
      status: rng.weighted(weights<WorkOrderStatus>(e, "status")),
      costCentre: flag(rng, internalOrdersShape, "has_cost_centre")
        ? rng.pick(COST_CENTRES)
        : null,
      billing: null,
      billingState: null,
      date: rng.daysAgo(intWindow.fromDaysAgo, intWindow.toDaysAgo),
      requester: "Internal",
      customer: null,
      total: moneyFrom(rng, numberRange(internalOrdersShape, "total")),
      invoiced: 0,
      uninvoiced: 0,
      currency: "USD" as const,
    };
  });
  // References follow date order within each kind; the list shows newest first.
  const sorted = byDateAsc([...service, ...internal], (r) => r.date);
  const refs = createRng(seedFor(persona, "operations.workOrders.ref"));
  return sorted.map((r, i) => ({
    id: `order-${i + 1}`,
    number: refs.reference(r.kind === "service" ? "SVC" : "WO", 6),
    ...r,
  }));
};

const APPOINTMENT_NOTES = [
  "Customer asked for a call ten minutes before arrival.",
  "Bring the previous visit summary.",
  "Gate code is on the account.",
  "Second visit, follow-up on the open item.",
  "Customer prefers morning slots.",
  "Interpreter requested.",
] as const;

type Slot = { start: number; end: number };

const genAppointments = (
  persona: Persona,
  staff: OperationsStaff[],
  services: OperationsService[],
  workOrders: OperationsWorkOrder[],
): OperationsAppointment[] => {
  const rng = createRng(seedFor(persona, "operations.appointments"));
  const e = appointmentsShape.enums;
  const orgs = organizationsByIndustry[persona.key];
  const hosts = staff.filter((s) => s.bookable);
  const bookable = services.filter((s) => s.active);
  const serviceOrders = workOrders.filter((o) => o.kind === "service");
  const weekdayOffsets = [-1, 1, 2, 3];
  const earlierOffsets = [-16, -15, -14, -13, -12, -9, -8, -7, -6, -5, -4, -2]
    // Skip weekends in the window (Oct 31 and Nov 1, Nov 7 and Nov 8).
    .filter((d) => {
      const dow = new Date(dayStartUtc(d)).getUTCDay();
      return dow !== 0 && dow !== 6;
    });
  const plan: number[] = [
    ...Array.from({ length: COUNTS.appointmentsToday }, () => 0),
    ...Array.from({ length: COUNTS.appointmentsWeek }, () =>
      rng.pick(weekdayOffsets),
    ),
    ...Array.from({ length: COUNTS.appointmentsEarlier }, () =>
      rng.pick(earlierOffsets),
    ),
  ];
  const taken = new Map<string, Slot[]>();
  // Round-robin over a shuffled roster so each day spreads across staff.
  const rotation = rng.shuffle(hosts);
  const rows = plan.map((dayOffset, i) => {
    const service = rng.pick(bookable);
    const duration = service.durationMinutes;
    let host = rotation[i % rotation.length] as OperationsStaff;
    let startMin = 8 * 60;
    for (let attempt = 0; attempt < 30; attempt++) {
      host = attempt === 0 ? host : rng.pick(hosts);
      startMin = rng.int(8 * 4, 16 * 4) * 15;
      const slots = taken.get(`${host.id}|${dayOffset}`) ?? [];
      if (
        slots.every((s) => startMin >= s.end || startMin + duration <= s.start)
      ) {
        break;
      }
    }
    const key = `${host.id}|${dayOffset}`;
    taken.set(key, [
      ...(taken.get(key) ?? []),
      { start: startMin, end: startMin + duration },
    ]);
    const offsetHours = UTC_OFFSET[host.timeZone] ?? -5;
    const startsAt = new Date(
      dayStartUtc(dayOffset) + startMin * MINUTE_MS - offsetHours * HOUR_MS,
    );
    const status = rng.weighted(
      weights<AppointmentStatus>(
        e,
        dayOffset === 0
          ? "status_today"
          : startsAt.getTime() < ANCHOR.getTime()
            ? "status_past"
            : "status_upcoming",
      ),
    );
    const linked =
      service.creates === "service_order" &&
      serviceOrders.length > 0 &&
      rng.weighted(weights<string>(e, "order_link")) === "linked";
    const candidates = serviceOrders.filter(
      (o) =>
        o.date.getTime() <= startsAt.getTime() &&
        (status === "cancelled" || o.status !== "cancelled"),
    );
    const order = linked && candidates.length > 0 ? rng.pick(candidates) : null;
    const kind = rng.weighted(weights<string>(e, "customer_kind"));
    return {
      title: service.name,
      service: service.name,
      serviceId: service.id,
      staff: host.name,
      staffId: host.id,
      customer:
        order?.customer ??
        (kind === "person" ? personName(rng) : rng.pick(orgs)),
      startsAt,
      endsAt: new Date(startsAt.getTime() + duration * MINUTE_MS),
      timeZone: host.timeZone,
      status,
      location: service.location,
      orderNumber: order?.number ?? null,
      notes: rng.bool(0.25) ? rng.pick(APPOINTMENT_NOTES) : null,
    };
  });
  const refs = createRng(seedFor(persona, "operations.appointments.ref"));
  return byDateAsc(rows, (r) => r.startsAt).map(
    (r, i): OperationsAppointment => ({
      id: `appointment-${i + 1}`,
      number: refs.reference("APT", 6),
      ...r,
    }),
  );
};

const TIMESHEET_NOTES = [
  "Completed the scheduled visit and logged follow-up items.",
  "Waited on site for access.",
  "Travel included.",
  "Parts pickup before the job.",
  "Second pass after the customer review.",
] as const;

const genTimesheets = (
  persona: Persona,
  staff: OperationsStaff[],
  workOrders: OperationsWorkOrder[],
): OperationsTimesheet[] => {
  const rng = createRng(seedFor(persona, "operations.timesheets"));
  const e = timeEntriesShape.enums;
  const started = workOrders.filter((o) =>
    ["scheduled", "in_progress", "completed", "closed"].includes(o.status),
  );
  const eligible = started.length > 0 ? started : workOrders;
  const rated = staff.filter((m) => m.costRate !== null);
  // Exact status counts (the shape weights sum to the row count), so the queue always has submitted rows.
  const statuses = rng.shuffle(
    (
      weights<TimesheetStatus>(e, "status") as readonly (readonly [
        TimesheetStatus,
        number,
      ])[]
    ).flatMap(([status, count]) => Array.from({ length: count }, () => status)),
  );
  const rows = Array.from({ length: COUNTS.timesheets }, (_, i) => {
    const status = statuses[i] as TimesheetStatus;
    // Costed entries need a staff cost rate.
    const member = rng.pick(
      status === "costed" && rated.length > 0 ? rated : staff,
    );
    const order = rng.pick(eligible);
    const hours = Math.min(
      9,
      Math.max(
        0.5,
        Math.round(rng.range(numberRange(timeEntriesShape, "hours")) * 4) / 4,
      ),
    );
    // Between the order date and the anchor, on a quarter hour.
    const lo = order.date.getTime();
    const raw = lo + rng.next() * (ANCHOR.getTime() - lo);
    const startedAt = new Date(
      Math.min(
        ANCHOR.getTime(),
        Math.max(lo, Math.round(raw / (15 * MINUTE_MS)) * 15 * MINUTE_MS),
      ),
    );
    return {
      orderNumber: order.number,
      staff: member.name,
      startedAt,
      hours,
      notes: flag(rng, timeEntriesShape, "has_notes")
        ? rng.pick(TIMESHEET_NOTES)
        : null,
      cost: member.costRate === null ? null : round2(hours * member.costRate),
      status,
      billable: flag(rng, timeEntriesShape, "billable"),
    };
  });
  return byDateAsc(rows, (r) => r.startedAt).map((r, i) => ({
    id: `timesheet-${i + 1}`,
    ...r,
  }));
};

type OutageTemplates = {
  unplanned: readonly string[];
  planned: readonly string[];
};

/** `{n}` is a feeder or site number, `{area}` the service area. */
const outageTemplates: Record<PersonaKey, OutageTemplates> = {
  utilities: {
    unplanned: [
      "Feeder {n} fault",
      "Transformer failure near {area}",
      "Water main break, {area}",
      "Substation breaker trip {n}",
      "Gas pressure loss in {area}",
    ],
    planned: [
      "Scheduled line work in {area}",
      "Meter bank replacement, {area}",
      "Valve maintenance, zone {n}",
    ],
  },
  financial: {
    unplanned: [
      "Online banking login errors",
      "Card processing delays, region {n}",
      "Payments gateway degradation",
      "Branch network link down, {area}",
    ],
    planned: [
      "Core platform maintenance window {n}",
      "ATM network upgrade, {area}",
      "Statement engine maintenance",
    ],
  },
  government_federal: {
    unplanned: [
      "Storm damage to {area} facility",
      "Flood watch near {area}",
      "Power loss at site {n}",
      "Wildfire smoke closure, {area}",
    ],
    planned: [
      "Generator test at site {n}",
      "Planned facility closure, {area}",
      "Evacuation drill, {area}",
    ],
  },
};

const PLANNED_REMAP: Partial<Record<OutageStatus, OutageStatus>> = {
  reported: "confirmed",
  crew_assigned: "confirmed",
  crew_en_route: "confirmed",
};

const genOutages = (persona: Persona): OperationsOutage[] => {
  const rng = createRng(seedFor(persona, "operations.outages"));
  const e = outagesShape.enums;
  const templates = outageTemplates[persona.key];
  const window = outagesShape.dates as {
    fromDaysAgo: number;
    toDaysAgo: number;
  };
  const rows = Array.from({ length: COUNTS.outages }, () => {
    const type = rng.weighted(weights<OutageType>(e, "type"));
    const planned = type === "planned";
    let status = rng.weighted(weights<OutageStatus>(e, "status"));
    // Only planned maintenance is scheduled.
    if (planned) status = PLANNED_REMAP[status] ?? status;
    const active = !INACTIVE_OUTAGE.has(status);
    const area = rng.pick(serviceAreaNames);
    const n = rng.int(2, 48);
    const title = rng
      .pick(planned ? templates.planned : templates.unplanned)
      .replace("{n}", String(n))
      .replace("{area}", area);
    const cause = planned
      ? "maintenance"
      : (() => {
          const c = rng.weighted(weights<string>(e, "cause_unplanned"));
          return c === "none" ? null : c;
        })();
    let reportedAt: Date;
    let windowStart: Date | null = null;
    let windowEnd: Date | null = null;
    if (!active) {
      reportedAt = rng.daysAgo(window.fromDaysAgo / 7, window.toDaysAgo);
      if (planned) {
        windowStart = plusDays(reportedAt, 1 + rng.next() * 2, true);
        windowEnd = new Date(windowStart.getTime() + rng.int(2, 8) * HOUR_MS);
      } else if (flag(rng, outagesShape, "has_ert")) {
        windowEnd = new Date(reportedAt.getTime() + rng.int(2, 10) * HOUR_MS);
      }
    } else if (planned) {
      // Scheduled ahead (confirmed) or under way (crew on site).
      if (status === "crew_on_site") {
        windowStart = new Date(ANCHOR.getTime() - rng.int(1, 3) * HOUR_MS);
        windowEnd = new Date(ANCHOR.getTime() + rng.int(2, 6) * HOUR_MS);
        reportedAt = rng.daysAgo(3, 9);
      } else {
        windowStart = rng.daysAhead(1, 14);
        windowEnd = new Date(windowStart.getTime() + rng.int(2, 8) * HOUR_MS);
        reportedAt = rng.daysAgo(1, 9);
      }
    } else {
      reportedAt = rng.daysAgo(0, 3);
      if (rng.bool(0.7)) {
        // An active outage's ERT is still ahead.
        windowEnd = new Date(ANCHOR.getTime() + rng.int(1, 12) * HOUR_MS);
      }
    }
    return {
      title,
      type,
      area,
      customersAffected: Math.round(
        rng.range(numberRange(outagesShape, "customers_affected")) *
          (planned ? 0.4 : 1),
      ),
      reportedAt,
      windowStart,
      windowEnd,
      status,
      cause,
    };
  });
  const refs = createRng(seedFor(persona, "operations.outages.ref"));
  return byDateAsc(rows, (r) => r.reportedAt).map(
    (r, i): OperationsOutage => ({
      id: `outage-${i + 1}`,
      number: refs.reference("OUT", 4),
      ...r,
    }),
  );
};

const genServiceAreas = (
  persona: Persona,
  outages: OperationsOutage[],
): OperationsServiceArea[] => {
  const rng = createRng(seedFor(persona, "operations.serviceAreas"));
  return serviceAreaNames.map((name, i) => ({
    id: `area-${i + 1}`,
    name,
    localities: Math.round(
      rng.range(numberRange(serviceAreasShape, "localities"), 0),
    ),
    outagesActive: outages.filter(
      (o) => o.area === name && !INACTIVE_OUTAGE.has(o.status),
    ).length,
  }));
};

const cache = new Map<PersonaKey, OperationsData>();

export const operationsData = (persona: Persona): OperationsData => {
  const cached = cache.get(persona.key);
  if (cached) return cached;
  const staff = genStaff(persona);
  const services = genServices(persona);
  const workOrders = genWorkOrders(persona);
  const appointments = genAppointments(persona, staff, services, workOrders);
  const timesheets = genTimesheets(persona, staff, workOrders);
  const outages = genOutages(persona);
  const serviceAreas = genServiceAreas(persona, outages);
  const key = persona.key;
  const live: Record<OperationsRowSet, number> = {
    staff: staffShape.totals[key],
    services: servicesShape.totals[key],
    appointments: appointmentsShape.totals[key],
    // Service plus internal orders.
    workOrders:
      serviceOrdersShape.totals[key] + internalOrdersShape.totals[key],
    timesheets: timeEntriesShape.totals[key],
    outages: outagesShape.totals[key],
    serviceAreas: serviceAreasShape.totals[key],
  };
  const counts: Record<OperationsRowSet, number> = {
    staff: staff.length,
    services: services.length,
    appointments: appointments.length,
    workOrders: workOrders.length,
    timesheets: timesheets.length,
    outages: outages.length,
    serviceAreas: serviceAreas.length,
  };
  const totals = { ...live };
  for (const set of Object.keys(counts) as OperationsRowSet[]) {
    totals[set] = Math.max(live[set], counts[set]);
  }
  const data: OperationsData = {
    staff,
    services,
    appointments,
    workOrders,
    timesheets,
    outages,
    serviceAreas,
    activeOutages: outages.filter((o) => !INACTIVE_OUTAGE.has(o.status)).length,
    totals,
  };
  cache.set(key, data);
  return data;
};
