import { type FinancePayment, financeData } from "../../mock/finance.js";
import {
  type AnyList,
  capitalise,
  empty,
  searchBy,
  statusChips,
} from "./common.js";
import type { ColumnSpec } from "../types.js";

const columns: ColumnSpec<FinancePayment>[] = [
  { key: "date", header: "Date", format: "date", sortable: true },
  { key: "document", header: "Document", format: "link", sortable: false },
  { key: "party", header: "Party", format: "party", sortable: false },
  {
    key: "amount",
    header: "Amount",
    format: "money",
    align: "end",
    sortable: true,
  },
  {
    key: "direction",
    header: "Direction",
    format: "badge",
    accessor: (row) => (row.direction === "in" ? "In" : "Out"),
    sortable: false,
  },
  {
    key: "method",
    header: "Method",
    format: "text",
    accessor: (row) => capitalise(row.method),
    sortable: false,
  },
  {
    key: "status",
    header: "Status",
    format: "status",
    accessor: (row) => capitalise(row.status),
    sortable: false,
  },
  { key: "reference", header: "Reference", format: "text", sortable: false },
  {
    key: "source",
    header: "Source",
    format: "badge",
    accessor: (row) =>
      row.source === "tillipay" ? "TilliPay" : capitalise(row.source),
    sortable: false,
  },
];

const sources: { value: FinancePayment["source"]; label: string }[] = [
  { value: "internal", label: "Internal" },
  { value: "tillipay", label: "TilliPay" },
  { value: "terminal", label: "Terminal" },
];

export const paymentsSpec: AnyList = {
  key: "payments",
  title: (t) => t.payments,
  description: "Money in and out across every source.",
  rows: (persona) => financeData(persona).payments,
  total: (persona) => financeData(persona).totals.payments,
  columns,
  chips: statusChips([
    "completed",
    "pending",
    "processing",
    "failed",
    "reversed",
    "refunded",
  ]),
  selects: [
    {
      key: "source",
      label: "Source",
      options: sources.map((source) => ({
        value: source.value,
        label: source.label,
        predicate: (row: FinancePayment) => row.source === source.value,
      })),
    },
  ],
  rowActions: [],
  pageActions: [],
  search: searchBy("document", "party", "reference"),
  empty: empty(
    "No payments match these filters.",
    "Collect a payment from an invoice detail page.",
  ),
};
