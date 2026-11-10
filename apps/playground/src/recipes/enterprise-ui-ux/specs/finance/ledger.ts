import { Download, Pencil, PowerOff } from "lucide-react";
import {
  type FinanceAccount,
  type FinanceLedgerEntry,
  type FinanceTrialBalanceRow,
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

const accountTypes = [
  "asset",
  "liability",
  "equity",
  "revenue",
  "expense",
] as const;

const moneyColumn = <R extends { id: string }>(
  key: string,
  header: string,
  sortable: boolean,
): ColumnSpec<R> => ({
  key,
  header,
  format: "money",
  align: "end",
  sortable,
});

const journalColumns: ColumnSpec<FinanceLedgerEntry>[] = [
  { key: "date", header: "Date", format: "date", sortable: true },
  { key: "journal", header: "Journal #", format: "link", sortable: false },
  {
    key: "description",
    header: "Description",
    format: "text",
    sortable: false,
  },
  { key: "account", header: "Account", format: "text", sortable: false },
  {
    key: "category",
    header: "Category",
    format: "text",
    accessor: (row) => capitalise(row.category),
    sortable: false,
  },
  moneyColumn("debit", "Debit", true),
  moneyColumn("credit", "Credit", true),
  moneyColumn("balance", "Balance", false),
  {
    key: "status",
    header: "Status",
    format: "status",
    accessor: (row) => capitalise(row.status),
    sortable: false,
  },
];

const accountColumns: ColumnSpec<FinanceAccount>[] = [
  { key: "code", header: "Code", format: "text", sortable: false },
  {
    key: "name",
    header: "Name",
    format: "text",
    accessor: (row) => `${" ".repeat(row.depth * 2)}${row.name}`,
    sortable: false,
  },
  {
    key: "type",
    header: "Type",
    format: "badge",
    accessor: (row) => capitalise(row.type),
    sortable: false,
  },
  moneyColumn("balance", "Balance", false),
  { key: "active", header: "Active", format: "boolean", sortable: false },
];

const trialColumns: ColumnSpec<FinanceTrialBalanceRow>[] = [
  { key: "code", header: "Code", format: "text", sortable: false },
  { key: "name", header: "Name", format: "text", sortable: false },
  moneyColumn("debit", "Debit", false),
  moneyColumn("credit", "Credit", false),
];

const typeChips: ChipSpec<FinanceAccount>[] = accountTypes.map((type) => ({
  key: type,
  label: capitalise(type),
  predicate: (row) => row.type === type,
}));

const journalSegment: SegmentSpec<FinanceLedgerEntry> = {
  key: "journal",
  label: "Journal",
  rows: (persona) => financeData(persona).ledger,
  total: (persona) => financeData(persona).totals.ledger,
  columns: journalColumns,
  chips: statusChips(["posted", "pending", "voided"]),
  selects: [
    {
      key: "accountType",
      label: "Account type",
      options: accountTypes.map((type) => ({
        value: type,
        label: capitalise(type),
        predicate: (row: FinanceLedgerEntry) => row.category === type,
      })),
    },
  ],
  empty: empty("No entries found", adjust),
};

const accountsSegment: SegmentSpec<FinanceAccount> = {
  key: "chart-of-accounts",
  label: "Chart of accounts",
  rows: (persona) => financeData(persona).chartOfAccounts,
  total: (persona) => financeData(persona).totals.chartOfAccounts,
  columns: accountColumns,
  chips: typeChips,
  rowActions: [
    { label: "Edit", icon: Pencil },
    { label: "Deactivate", icon: PowerOff, variant: "destructive" },
  ],
  gaps: ["nested-rows"],
  empty: empty("No accounts found", adjust),
};

const trialSegment: SegmentSpec<FinanceTrialBalanceRow> = {
  key: "trial-balance",
  label: "Trial balance",
  rows: (persona) => financeData(persona).trialBalance.rows,
  total: (persona) => financeData(persona).trialBalance.rows.length,
  columns: trialColumns,
  chips: [],
  empty: empty("No balances found", adjust),
};

export const ledgerSpec: AnyList = {
  key: "ledger",
  title: "Ledger",
  description: "Journal entries, chart of accounts and trial balance.",
  ...lead(journalSegment),
  pageActions: [{ label: "Export CSV", icon: Download, variant: "outline" }],
  search: searchBy("journal", "description", "account", "code", "name"),
  segments: [journalSegment, accountsSegment, trialSegment],
};
