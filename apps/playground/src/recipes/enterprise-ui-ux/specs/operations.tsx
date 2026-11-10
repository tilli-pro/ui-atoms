import {
  Ban,
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  Download,
  ExternalLink,
  Map as MapIcon,
  Pencil,
  Plus,
  Power,
  RotateCcw,
  Table2,
  ThumbsDown,
  ThumbsUp,
  Wrench,
} from "lucide-react";
import {
  type OperationsAppointment,
  type OperationsOutage,
  type OperationsService,
  type OperationsStaff,
  type OperationsTimesheet,
  type OperationsWorkOrder,
  operationsData,
  type ServiceLocation,
  type WorkOrderKind,
} from "../mock/operations.js";
import { ANCHOR } from "../mock/random.js";
import { personaKeys, personas } from "../personas.js";
import {
  type AnyList,
  adjust,
  capitalise,
  DAY,
  empty,
  includes,
  lead,
  searchBy,
  statusChips,
} from "./finance/common.js";
import type {
  ActionSpec,
  ColumnSpec,
  ListSpec,
  ModuleSpecs,
  Persona,
  SegmentSpec,
  SelectFilterSpec,
} from "./types.js";

const locationLabels: Record<ServiceLocation, string> = {
  in_person: "In person",
  phone: "Phone",
  video: "Video",
  on_site: "On site",
};

const pad = (value: number) => String(value).padStart(2, "0");
const clock = (date: Date) =>
  `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
const timeRange = (row: OperationsAppointment) =>
  `${clock(row.startsAt)}–${clock(row.endsAt)}`;

const dayStart = Date.UTC(
  ANCHOR.getUTCFullYear(),
  ANCHOR.getUTCMonth(),
  ANCHOR.getUTCDate(),
);
const weekStart = dayStart - ((ANCHOR.getUTCDay() + 6) % 7) * DAY;

const startsBetween = (from: number, to: number) => (row: { startsAt: Date }) =>
  row.startsAt.getTime() >= from && row.startsAt.getTime() < to;
const isToday = startsBetween(dayStart, dayStart + DAY);
const isThisWeek = startsBetween(weekStart, weekStart + 7 * DAY);

const open = (label = "Open"): ActionSpec => ({ label, icon: ExternalLink });

/* ------------------------------------------------------------- Calendar */

const appointmentColumns: ColumnSpec<OperationsAppointment>[] = [
  {
    key: "staff",
    header: "Staff",
    format: "party",
    accessor: (row) => ({ name: row.staff }),
    sortable: false,
  },
  {
    key: "time",
    header: "Time",
    format: "text",
    accessor: timeRange,
    sortable: false,
  },
  { key: "title", header: "Title", format: "text", sortable: false },
  { key: "customer", header: "Customer", format: "text", sortable: false },
  {
    key: "status",
    header: "Status",
    format: "status",
    accessor: (row) => capitalise(row.status),
    sortable: false,
  },
  {
    key: "location",
    header: "Location",
    format: "badge",
    accessor: (row) => locationLabels[row.location],
    sortable: false,
  },
  {
    key: "orderNumber",
    header: "Order",
    format: "link",
    sortable: false,
  },
];

const byStart = (a: OperationsAppointment, b: OperationsAppointment) =>
  a.startsAt.getTime() - b.startsAt.getTime();

const staffNames = [
  ...new Set(
    personaKeys.flatMap((key) =>
      operationsData(personas[key]).staff.map((member) => member.name),
    ),
  ),
].sort();

const staffSelect: SelectFilterSpec<OperationsAppointment> = {
  key: "staff",
  label: "staff",
  options: staffNames.map((name) => ({
    value: name,
    label: name,
    predicate: (row) => row.staff === name,
  })),
};

const appointmentSegment = (
  key: string,
  label: string,
  within: (row: OperationsAppointment) => boolean,
  emptyTitle: string,
): SegmentSpec<OperationsAppointment> => ({
  key,
  label,
  rows: (persona) =>
    operationsData(persona).appointments.filter(within).sort(byStart),
  columns: appointmentColumns,
  chips: statusChips<OperationsAppointment>([
    "booked",
    "confirmed",
    "checked_in",
    "completed",
    "cancelled",
    "held",
    "no_show",
  ]),
  selects: [staffSelect],
  rowActions: [
    open(),
    { label: "Reschedule", icon: CalendarClock, gap: "drag-calendar" },
    { label: "Cancel", icon: Ban, variant: "destructive" },
  ],
  empty: empty(emptyTitle, adjust),
});

const calendarSpec: AnyList = {
  key: "calendar",
  title: "Calendar",
  description: "Appointments by staff member.",
  ...lead(appointmentSegment("day", "Day", isToday, "No appointments today")),
  segments: [
    appointmentSegment("day", "Day", isToday, "No appointments today"),
    appointmentSegment("week", "Week", isThisWeek, "No appointments this week"),
  ],
  pageActions: [{ label: "Book appointment", icon: CalendarPlus }],
  search: searchBy("title", "customer", "staff", "number", "orderNumber"),
  gaps: ["drag-calendar"],
  empty: empty("No appointments found", adjust),
};

/* ------------------------------------------------------------- Services */

const servicesSpec: ListSpec<OperationsService> = {
  key: "services",
  title: "Services",
  description: "Bookable services, their length, location and billing.",
  rows: (persona) => operationsData(persona).services,
  total: (persona) => operationsData(persona).totals.services,
  columns: [
    {
      key: "name",
      header: "Name",
      format: "party",
      accessor: (row) => ({ name: row.name, subline: row.slug }),
      sortable: false,
    },
    {
      key: "durationMinutes",
      header: "Length",
      format: "duration",
      sortable: false,
    },
    {
      key: "location",
      header: "Location",
      format: "badge",
      accessor: (row) => locationLabels[row.location],
      sortable: false,
    },
    {
      key: "bookedWith",
      header: "Booked with",
      format: "text",
      accessor: (row) =>
        row.assignment === "any_available"
          ? "Any available"
          : `${row.bookedWith} ${row.bookedWith === 1 ? "person" : "people"}`,
      sortable: false,
    },
    {
      key: "creates",
      header: "Creates",
      format: "party",
      accessor: (row) => {
        const name = capitalise(
          row.creates === "none" ? "nothing" : row.creates,
        );
        return row.workCostCentre
          ? { name, subline: row.workCostCentre }
          : { name };
      },
      sortable: false,
    },
    {
      key: "billing",
      header: "Billing",
      format: "text",
      accessor: (row) =>
        row.billing === "none" ? "Not billed" : capitalise(row.billing),
      sortable: false,
    },
    { key: "active", header: "Active", format: "boolean", sortable: false },
  ],
  chips: (Object.keys(locationLabels) as ServiceLocation[]).map((location) => ({
    key: location,
    label: locationLabels[location],
    predicate: (row) => row.location === location,
  })),
  rowActions: [
    { label: "Edit", icon: Pencil },
    { label: "Retire", icon: Power, variant: "destructive" },
  ],
  pageActions: [{ label: "New service", icon: Plus }],
  search: searchBy("name", "slug"),
  gaps: ["time-inputs"],
  empty: empty("No services yet", adjust),
};

/* ---------------------------------------------------------------- Staff */

const staffSpec: ListSpec<OperationsStaff> = {
  key: "staff",
  title: "Staff",
  description: "Staff profiles, availability and rates.",
  rows: (persona) => operationsData(persona).staff,
  total: (persona) => operationsData(persona).totals.staff,
  columns: [
    {
      key: "name",
      header: "Name",
      format: "party",
      accessor: (row) => ({ name: row.name, subline: row.email }),
      sortable: false,
    },
    { key: "timeZone", header: "Time zone", format: "text", sortable: false },
    { key: "bookable", header: "Bookable", format: "boolean", sortable: false },
    {
      key: "buffers",
      header: "Buffers",
      format: "text",
      accessor: (row) =>
        `${row.bufferBeforeMinutes} / ${row.bufferAfterMinutes} min`,
      sortable: false,
    },
    {
      key: "maxPerDay",
      header: "Max per day",
      format: "count",
      align: "end",
      sortable: false,
    },
    {
      key: "billRate",
      header: "Bill rate",
      format: "money",
      align: "end",
      sortable: false,
    },
    {
      key: "costRate",
      header: "Cost rate",
      format: "money",
      align: "end",
      sortable: false,
    },
    {
      key: "weeklyHours",
      header: "Weekly hours",
      format: "text",
      sortable: false,
    },
  ],
  chips: [
    {
      key: "bookable",
      label: "Bookable",
      predicate: (row) => row.bookable,
    },
    {
      key: "not_bookable",
      label: "Not bookable",
      predicate: (row) => !row.bookable,
    },
  ],
  rowActions: [
    { label: "Edit", icon: Pencil },
    { label: "Deactivate", icon: Power, variant: "destructive" },
  ],
  pageActions: [{ label: "New staff profile", icon: Plus }],
  search: searchBy("name", "email"),
  gaps: ["time-inputs"],
  empty: empty("No staff profiles yet", adjust),
};

/* ----------------------------------------------------------- Work orders */

const serviceStatuses = [
  "draft",
  "submitted",
  "confirmed",
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
];
const internalStatuses = [
  "draft",
  "scheduled",
  "in_progress",
  "completed",
  "closed",
  "cancelled",
];

const workOrderSegment = (
  kind: WorkOrderKind,
  label: string,
  statuses: string[],
  columns: ColumnSpec<OperationsWorkOrder>[],
  rowActions: ActionSpec[],
): SegmentSpec<OperationsWorkOrder> => ({
  key: kind,
  label,
  rows: (persona) =>
    operationsData(persona).workOrders.filter((row) => row.kind === kind),
  total: (persona) =>
    operationsData(persona).workOrders.filter((row) => row.kind === kind)
      .length,
  columns,
  chips: statusChips<OperationsWorkOrder>(statuses),
  rowActions,
  empty: empty(`No ${label.toLowerCase()} orders yet`, adjust),
});

const orderLead: ColumnSpec<OperationsWorkOrder>[] = [
  { key: "number", header: "Order", format: "link", sortable: true },
  {
    key: "status",
    header: "Status",
    format: "status",
    accessor: (row) => capitalise(row.status),
    sortable: false,
  },
];

const billingLabels = {
  none: "Not invoiced",
  partially_invoiced: "Partially invoiced",
  invoiced: "Invoiced",
} as const;

const serviceOrderColumns: ColumnSpec<OperationsWorkOrder>[] = [
  ...orderLead,
  {
    key: "billingState",
    header: "Billing",
    format: "text",
    accessor: (row) =>
      row.billingState ? billingLabels[row.billingState] : null,
    sortable: false,
  },
  { key: "date", header: "Date", format: "date", sortable: true },
  {
    key: "customer",
    header: "Customer",
    format: "party",
    accessor: (row) => (row.customer ? { name: row.customer } : null),
    sortable: false,
  },
  {
    key: "total",
    header: "Total",
    format: "money",
    align: "end",
    sortable: true,
  },
  {
    key: "invoiced",
    header: "Invoiced",
    format: "money",
    align: "end",
    sortable: false,
  },
  {
    key: "uninvoiced",
    header: "Uninvoiced",
    format: "money",
    align: "end",
    sortable: false,
  },
];

const internalOrderColumns: ColumnSpec<OperationsWorkOrder>[] = [
  ...orderLead,
  { key: "costCentre", header: "Cost centre", format: "text", sortable: false },
  { key: "date", header: "Date", format: "date", sortable: true },
  { key: "requester", header: "Requester", format: "text", sortable: false },
  {
    key: "total",
    header: "Total",
    format: "money",
    align: "end",
    sortable: true,
  },
];

const serviceOrders = workOrderSegment(
  "service",
  "Service",
  serviceStatuses,
  serviceOrderColumns,
  [
    open(),
    { label: "Schedule", icon: CalendarClock },
    { label: "Complete", icon: CheckCircle2 },
  ],
);
const internalOrders = workOrderSegment(
  "internal",
  "Internal",
  internalStatuses,
  internalOrderColumns,
  [open(), { label: "Approve", icon: ThumbsUp }, { label: "Close", icon: Ban }],
);

const workOrdersSpec: AnyList = {
  key: "work-orders",
  title: "Work orders",
  description: "Service orders for customers and internal work orders.",
  ...lead(serviceOrders),
  segments: [serviceOrders, internalOrders],
  selectable: true,
  pageActions: [
    { label: "Export to CSV", icon: Download, variant: "outline" },
    { label: "New work order", icon: Wrench },
    {
      label: "Columns",
      icon: Table2,
      variant: "outline",
      gap: "data-grid",
    },
  ],
  search: searchBy("number", "customer", "requester", "costCentre"),
  gaps: ["data-grid"],
  empty: empty("No work orders yet", adjust),
};

/* ----------------------------------------------------------- Timesheets */

const timesheetsSpec: ListSpec<OperationsTimesheet> = {
  key: "timesheets",
  title: "Timesheets",
  description: "Time logged against orders, waiting for approval.",
  rows: (persona) => operationsData(persona).timesheets,
  total: (persona) => operationsData(persona).totals.timesheets,
  columns: [
    { key: "orderNumber", header: "Order", format: "link", sortable: false },
    {
      key: "staff",
      header: "Staff",
      format: "party",
      accessor: (row) => ({ name: row.staff }),
      sortable: false,
    },
    { key: "startedAt", header: "Started", format: "datetime", sortable: true },
    {
      key: "hours",
      header: "Hours",
      format: "text",
      accessor: (row) => row.hours.toFixed(1),
      align: "end",
      sortable: true,
    },
    { key: "notes", header: "Notes", format: "text", sortable: false },
    {
      key: "cost",
      header: "Cost",
      format: "money",
      align: "end",
      sortable: false,
    },
    { key: "billable", header: "Billable", format: "boolean", sortable: false },
    {
      key: "status",
      header: "Status",
      format: "status",
      accessor: (row) => capitalise(row.status),
      sortable: false,
    },
  ],
  chips: statusChips<OperationsTimesheet>([
    "submitted",
    "approved",
    "rejected",
    "costed",
  ]),
  rowActions: [
    { label: "Approve", icon: ThumbsUp },
    { label: "Reject", icon: ThumbsDown, variant: "destructive" },
    open(),
  ],
  pageActions: [{ label: "Export", icon: Download, variant: "outline" }],
  search: searchBy("orderNumber", "staff", "notes"),
  empty: empty("No time is waiting for approval", adjust),
};

/* -------------------------------------------------------------- Outages */

const outageWindow = (row: OperationsOutage) => {
  if (row.type === "planned" && row.windowStart && row.windowEnd) {
    return `${isoMinute(row.windowStart)} – ${isoMinute(row.windowEnd)}`;
  }
  if (row.windowEnd) return `ERT ${isoMinute(row.windowEnd)}`;
  return `Reported ${isoMinute(row.reportedAt)}`;
};
const isoMinute = (date: Date) =>
  `${date.toISOString().slice(0, 10)} ${clock(date)}`;

const outageTypeLabel = (type: OperationsOutage["type"]) =>
  type === "planned" ? "Scheduled maintenance" : capitalise(type);

const outageSpec: ListSpec<OperationsOutage> = {
  key: "outages",
  title: (terms) => terms.outages,
  description: (terms) =>
    `Report and track ${terms.outages.toLowerCase()} and planned maintenance.`,
  rows: (persona) => operationsData(persona).outages,
  total: (persona) => operationsData(persona).totals.outages,
  columns: [
    {
      key: "title",
      header: (terms) => terms.outages,
      format: "party",
      accessor: (row) => ({ name: row.title, subline: row.number }),
      sortable: false,
    },
    {
      key: "type",
      header: "Type",
      format: "text",
      accessor: (row) => outageTypeLabel(row.type),
      sortable: false,
    },
    { key: "area", header: "Area", format: "text", sortable: false },
    {
      key: "customersAffected",
      header: "Customers",
      format: "count",
      align: "end",
      sortable: false,
    },
    {
      key: "window",
      header: "Window / ERT",
      format: "text",
      accessor: outageWindow,
      sortable: false,
    },
    {
      key: "status",
      header: "Status",
      format: "status",
      accessor: (row) => capitalise(row.status),
      sortable: false,
    },
  ],
  chips: statusChips<OperationsOutage>([
    "reported",
    "confirmed",
    "crew_assigned",
    "crew_en_route",
    "crew_on_site",
    "restored",
    "closed",
  ]),
  selects: [
    {
      key: "type",
      label: "types",
      options: (["unplanned", "planned", "emergency", "partial"] as const).map(
        (type) => ({
          value: type,
          label: outageTypeLabel(type),
          predicate: (row: OperationsOutage) => row.type === type,
        }),
      ),
    },
  ],
  rowActions: [
    open(),
    { label: "Update status", icon: Pencil },
    { label: "Restore", icon: RotateCcw },
  ],
  pageActions: [
    { label: "Manage areas", icon: MapIcon, variant: "outline" },
    { label: "Schedule maintenance", icon: CalendarPlus },
  ],
  search: (row, query) =>
    includes(row.title, query) ||
    includes(row.number, query) ||
    includes(row.area, query),
  gaps: ["map"],
  empty: {
    title: (terms) => `No ${terms.outages.toLowerCase()} found`,
    description:
      "Report an outage or schedule maintenance to notify and track impacted customers.",
  },
};

/* ------------------------------------------------------------ Dashboard */

const dashboard = (persona: Persona) => {
  const data = operationsData(persona);
  const today = data.appointments.filter(isToday).sort(byStart);
  const openOrders = data.workOrders.filter(
    (row) =>
      row.status !== "completed" &&
      row.status !== "closed" &&
      row.status !== "cancelled",
  );
  const submitted = data.timesheets.filter((row) => row.status === "submitted");
  const submittedHours = submitted.reduce((sum, row) => sum + row.hours, 0);
  const activeOutages = data.outages.filter(
    (row) => row.status !== "restored" && row.status !== "closed",
  );
  const affected = activeOutages.reduce(
    (sum, row) => sum + row.customersAffected,
    0,
  );
  return {
    stats: [
      {
        label: "Appointments today",
        value: today.length,
        hint: "Starting on the anchor day, UTC",
      },
      {
        label: "Work orders open",
        value: openOrders.length,
        hint: "Not completed, closed or cancelled",
      },
      {
        label: "Timesheets to approve",
        value: submitted.length,
        hint: `${submittedHours.toFixed(1)} hours submitted`,
      },
      {
        label: "Active outages",
        value: data.activeOutages,
        hint: `${affected.toLocaleString("en-US")} customers affected`,
      },
    ],
    panels: [
      {
        kind: "placeholder" as const,
        title: "Outage map",
        description: "Active outages and affected areas.",
        gap: "map" as const,
        message: `${data.activeOutages} active outages would be plotted here.`,
      },
      {
        kind: "table" as const,
        title: "Today's calendar",
        description: "Appointments starting today, by time.",
        columns: [
          { key: "time", header: "Time", format: "text" as const },
          { key: "staff", header: "Staff", format: "text" as const },
          { key: "title", header: "Title", format: "text" as const },
          { key: "customer", header: "Customer", format: "text" as const },
          {
            key: "statusLabel",
            header: "Status",
            format: "status" as const,
          },
        ],
        rows: today.slice(0, 6).map((row) => ({
          id: row.id,
          time: timeRange(row),
          staff: row.staff,
          title: row.title,
          customer: row.customer,
          statusLabel: capitalise(row.status),
        })),
      },
      {
        kind: "table" as const,
        title: "Approval queue",
        description: "Submitted timesheets waiting for approval.",
        columns: [
          { key: "orderNumber", header: "Order", format: "link" as const },
          { key: "staff", header: "Staff", format: "text" as const },
          { key: "hoursLabel", header: "Hours", format: "text" as const },
          { key: "cost", header: "Cost", format: "money" as const },
        ],
        rows: submitted.slice(0, 6).map((row) => ({
          id: row.id,
          orderNumber: row.orderNumber,
          staff: row.staff,
          hoursLabel: row.hours.toFixed(1),
          cost: row.cost,
        })),
      },
    ],
  };
};

export const operationsSpecs: ModuleSpecs = {
  items: {
    calendar: calendarSpec,
    services: servicesSpec,
    staff: staffSpec,
    "work-orders": workOrdersSpec,
    timesheets: timesheetsSpec,
    outages: outageSpec,
  },
  dashboard,
};
