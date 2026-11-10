import {
  Ban,
  Check,
  CreditCard,
  ExternalLink,
  Eye,
  FilePlus,
  Plus,
  TriangleAlert,
  Upload,
} from "lucide-react";
import {
  type FinanceBill,
  type FinanceBillInboxMessage,
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
import {
  settlementActionLines,
  settlementColumns,
  settlementStatuses,
} from "./receivables.js";
import type { ColumnSpec, SegmentSpec } from "../types.js";

const billColumns: ColumnSpec<FinanceBill>[] = [
  { key: "number", header: "Bill #", format: "link", sortable: true },
  {
    key: "status",
    header: "Status",
    format: "status",
    accessor: (row) => capitalise(row.status),
    sortable: false,
  },
  { key: "vendor", header: "Vendor", format: "party", sortable: false },
  { key: "issueDate", header: "Issue date", format: "date", sortable: true },
  {
    key: "total",
    header: "Total",
    format: "money",
    align: "end",
    sortable: true,
  },
  { key: "dueDate", header: "Due", format: "date", sortable: true },
];

const inboxColumns: ColumnSpec<FinanceBillInboxMessage>[] = [
  {
    key: "sender",
    header: "Sender",
    format: "party",
    accessor: (row) => ({ name: row.senderName, subline: row.senderEmail }),
    sortable: false,
  },
  { key: "auto", header: "Auto", format: "boolean", sortable: false },
  { key: "subject", header: "Subject", format: "text", sortable: false },
  {
    key: "attachments",
    header: "Attachments",
    format: "count",
    sortable: false,
  },
  {
    key: "receivedAt",
    header: "Received",
    format: "datetime",
    sortable: false,
  },
  {
    key: "status",
    header: "Status",
    format: "status",
    accessor: (row) => capitalise(row.status),
    sortable: false,
  },
];

const billsSegment: SegmentSpec<FinanceBill> = {
  key: "bills",
  label: (t) => t.bills,
  rows: (persona) => financeData(persona).bills,
  total: (persona) => financeData(persona).totals.bills,
  columns: billColumns,
  chips: statusChips([
    "draft",
    "pending_review",
    "on_hold",
    "rejected",
    "approved",
    "scheduled",
    "partially_paid",
    "paid",
    "overdue",
    "disputed",
    "void",
  ]),
  rowActions: [
    { label: "Open", icon: ExternalLink },
    { label: "Approve", icon: Check },
    { label: "Pay", icon: CreditCard },
    { label: "Dispute", icon: Ban, variant: "destructive" },
  ],
  empty: empty("No bills found", adjust),
};

const inboxSegment: SegmentSpec<FinanceBillInboxMessage> = {
  key: "inbox",
  label: "Inbox",
  rows: (persona) => financeData(persona).billInbox,
  total: (persona) => financeData(persona).totals.billInbox,
  columns: inboxColumns,
  chips: statusChips(["received", "processed", "error"]),
  rowActions: [
    { label: "Open", icon: ExternalLink },
    { label: "Preview", icon: Eye, gap: "pdf-preview" },
    { label: "Create bill", icon: FilePlus },
  ],
  empty: empty("No inbound messages found", adjust),
};

const payableSettlements = (persona: Parameters<SegmentSpec["rows"]>[0]) =>
  financeData(persona).settlements.filter(
    (row): row is FinanceSettlement => row.side === "payable",
  );

const settlementsSegment: SegmentSpec<FinanceSettlement> = {
  key: "settlements",
  label: "Partner settlements",
  rows: payableSettlements,
  total: (persona) => payableSettlements(persona).length,
  columns: settlementColumns,
  chips: statusChips(settlementStatuses),
  rowActions: [
    settlementActionLines,
    { label: "Confirm received", icon: Check },
    { label: "Report again", icon: TriangleAlert },
  ],
  empty: empty("No settlements found", adjust),
};

export const payablesSpec: AnyList = {
  key: "payables",
  title: "Payables",
  description: "Vendor bills, the bill inbox and partner settlements.",
  ...lead(billsSegment),
  selectable: true,
  gaps: ["data-grid"],
  pageActions: [
    {
      label: "Upload bill",
      icon: Upload,
      variant: "outline",
      gap: "file-import",
    },
    { label: "Create bill", icon: Plus },
  ],
  search: searchBy("number", "vendor", "senderName", "subject", "partner"),
  segments: [billsSegment, inboxSegment, settlementsSegment],
};
