import {
  Ban,
  CreditCard,
  Download,
  ExternalLink,
  Layers,
  Pause,
  Plus,
  RotateCw,
  Send,
  ThumbsUp,
  TriangleAlert,
  Zap,
} from "lucide-react";
import {
  type FinanceInvoice,
  type FinanceOutboxMessage,
  type FinanceReadyToInvoice,
  type FinanceRecurring,
  type FinanceSettlement,
  financeData,
} from "../../mock/finance.js";
import {
  type AnyList,
  adjust,
  capitalise,
  empty,
  lead,
  searchBy,
  statusChips,
} from "./common.js";
import type { ChipSpec, ColumnSpec, SegmentSpec } from "../types.js";

const date = (value: Date | null) =>
  value
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(value)
    : null;

const invoiceColumns: ColumnSpec<FinanceInvoice>[] = [
  {
    key: "number",
    header: (t) => `${t.invoice} #`,
    format: "link",
    sortable: true,
  },
  {
    key: "status",
    header: "Status",
    format: "status",
    accessor: (row) => capitalise(row.status),
    sortable: false,
  },
  { key: "source", header: "Source", format: "badge", sortable: false },
  { key: "customer", header: "Customer", format: "party", sortable: false },
  { key: "issueDate", header: "Issue date", format: "date", sortable: true },
  {
    key: "total",
    header: "Total",
    format: "money",
    align: "end",
    sortable: true,
  },
  { key: "dueDate", header: "Due date", format: "date", sortable: true },
];

const recurringColumns: ColumnSpec<FinanceRecurring>[] = [
  { key: "number", header: "Schedule", format: "link", sortable: false },
  {
    key: "status",
    header: "Status",
    format: "status",
    accessor: (row) => capitalise(row.status),
    sortable: false,
  },
  {
    key: "frequency",
    header: "Frequency",
    format: "text",
    accessor: (row) => capitalise(row.frequency),
    sortable: false,
  },
  { key: "customer", header: "Customer", format: "party", sortable: false },
  { key: "nextRun", header: "Next run", format: "date", sortable: false },
  {
    key: "lastRun",
    header: "Last run",
    format: "text",
    accessor: (row) =>
      row.lastRunFailed
        ? `Failed · ${date(row.lastRun) ?? "n/a"}`
        : date(row.lastRun),
    sortable: false,
  },
  {
    key: "amount",
    header: "Amount",
    format: "money",
    align: "end",
    sortable: false,
  },
];

const outboxColumns: ColumnSpec<FinanceOutboxMessage>[] = [
  {
    key: "recipient",
    header: "Recipient",
    format: "party",
    accessor: (row) => ({ name: row.recipient, subline: row.contact }),
    sortable: false,
  },
  { key: "document", header: "Document", format: "link", sortable: false },
  {
    key: "channel",
    header: "Channel",
    format: "badge",
    accessor: (row) => capitalise(row.channel),
    sortable: false,
  },
  {
    key: "status",
    header: "Status",
    format: "status",
    accessor: (row) => capitalise(row.status),
    sortable: false,
  },
  { key: "sentAt", header: "Sent", format: "datetime", sortable: false },
];

const readyColumns: ColumnSpec<FinanceReadyToInvoice>[] = [
  { key: "order", header: "Order", format: "link", sortable: false },
  { key: "customer", header: "Customer", format: "party", sortable: false },
  {
    key: "status",
    header: "Status",
    format: "status",
    accessor: (row) => capitalise(row.status),
    sortable: false,
  },
  {
    key: "unbilled",
    header: "Unbilled",
    format: "money",
    align: "end",
    sortable: false,
  },
  { key: "unbilledItems", header: "Items", format: "text", sortable: false },
  {
    key: "reasons",
    header: "Reasons",
    format: "text",
    accessor: (row) => row.reasons.join("; "),
    sortable: false,
  },
];

export const settlementColumns: ColumnSpec<FinanceSettlement>[] = [
  { key: "period", header: "Period", format: "text", sortable: false },
  { key: "partner", header: "Partner", format: "party", sortable: false },
  {
    key: "accrued",
    header: "Accrued",
    format: "money",
    align: "end",
    sortable: false,
  },
  {
    key: "settled",
    header: "Settled",
    format: "money",
    align: "end",
    sortable: false,
  },
  {
    key: "status",
    header: "Status",
    format: "status",
    accessor: (row) => capitalise(row.status),
    sortable: false,
  },
  { key: "disputes", header: "Disputes", format: "count", sortable: false },
];

export const settlementStatuses = ["sent", "paid", "pending_review"];

const readyChips: ChipSpec<FinanceReadyToInvoice>[] = [
  {
    key: "now",
    label: "Can invoice now",
    predicate: (row) => row.canInvoiceNow,
  },
  { key: "blocked", label: "Blocked", predicate: (row) => !row.canInvoiceNow },
];

const invoicesSegment: SegmentSpec<FinanceInvoice> = {
  key: "invoices",
  label: (t) => t.invoices,
  rows: (persona) => financeData(persona).invoices,
  total: (persona) => financeData(persona).totals.invoices,
  columns: invoiceColumns,
  chips: statusChips([
    "draft",
    "open",
    "sent",
    "viewed",
    "overdue",
    "partially_paid",
    "paid",
    "written_off",
    "void",
  ]),
  rowActions: [
    { label: "Open", icon: ExternalLink },
    { label: "Send", icon: Send },
    { label: "Record payment", icon: CreditCard },
    { label: "Void", icon: Ban, variant: "destructive" },
  ],
  empty: {
    title: (t) => `No ${t.invoices.toLowerCase()} found`,
    description: adjust,
  },
};

const recurringSegment: SegmentSpec<FinanceRecurring> = {
  key: "recurring",
  label: "Recurring",
  rows: (persona) => financeData(persona).recurring,
  total: (persona) => financeData(persona).totals.recurring,
  columns: recurringColumns,
  chips: statusChips(["active", "cancelled"]),
  rowActions: [
    { label: "Open", icon: ExternalLink },
    { label: "Pause", icon: Pause },
    { label: "Run now", icon: Zap },
  ],
  empty: empty("No recurring schedules found", adjust),
};

const outboxSegment: SegmentSpec<FinanceOutboxMessage> = {
  key: "outbox",
  label: "Outbox",
  rows: (persona) => financeData(persona).outbox,
  total: (persona) => financeData(persona).totals.outbox,
  columns: outboxColumns,
  chips: statusChips(["sent", "failed"]),
  rowActions: [
    { label: "Open", icon: ExternalLink },
    { label: "Resend", icon: RotateCw },
  ],
  empty: empty("No messages found", adjust),
};

const readySegment: SegmentSpec<FinanceReadyToInvoice> = {
  key: "ready-to-invoice",
  label: "Ready to invoice",
  rows: (persona) => financeData(persona).readyToInvoice,
  total: (persona) => financeData(persona).totals.readyToInvoice,
  columns: readyColumns,
  chips: readyChips,
  rowActions: [
    { label: "Invoice now", icon: Zap },
    { label: "Open", icon: ExternalLink },
  ],
  empty: empty("Nothing is ready to invoice", adjust),
};

export const settlementActionLines = {
  label: "Lines",
  icon: Layers,
  variant: "ghost",
  gap: "nested-rows",
} as const;

const settlementsSegment: SegmentSpec<FinanceSettlement> = {
  key: "settlements",
  label: "Partner settlements",
  rows: (persona) =>
    financeData(persona).settlements.filter((row) => row.side === "receivable"),
  total: (persona) =>
    financeData(persona).settlements.filter((row) => row.side === "receivable")
      .length,
  columns: settlementColumns,
  chips: statusChips(settlementStatuses),
  rowActions: [
    settlementActionLines,
    { label: "Open dispute", icon: TriangleAlert },
    { label: "Mark paid", icon: ThumbsUp },
  ],
  empty: empty("No settlements found", adjust),
};

export const receivablesSpec: AnyList = {
  key: "receivables",
  title: "Receivables",
  description: "Invoices, schedules, delivery and partner settlements.",
  ...lead(invoicesSegment),
  selectable: true,
  gaps: ["data-grid"],
  pageActions: [
    { label: (t) => `New ${t.invoice}`, icon: Plus },
    { label: "Export", icon: Download, variant: "outline" },
  ],
  search: searchBy(
    "number",
    "customer",
    "recipient",
    "document",
    "order",
    "partner",
  ),
  segments: [
    invoicesSegment,
    recurringSegment,
    outboxSegment,
    readySegment,
    settlementsSegment,
  ],
};
