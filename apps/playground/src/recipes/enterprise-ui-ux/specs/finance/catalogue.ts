import {
  Archive,
  Copy,
  ExternalLink,
  Pencil,
  Plus,
  Upload,
  X,
  Zap,
} from "lucide-react";
import {
  type FinanceProduct,
  type FinanceRateCard,
  type FinanceSubscription,
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
import type { ColumnSpec, SegmentSpec } from "../types.js";

const productColumns: ColumnSpec<FinanceProduct>[] = [
  {
    key: "name",
    header: "Name",
    format: "party",
    accessor: (row) => ({
      name: row.name,
      ...(row.sku ? { subline: row.sku } : {}),
    }),
    sortable: false,
  },
  {
    key: "type",
    header: "Type",
    format: "badge",
    accessor: (row) => capitalise(row.type),
    sortable: false,
  },
  { key: "source", header: "Source", format: "badge", sortable: false },
  {
    key: "category",
    header: "Category",
    format: "text",
    accessor: (row) => capitalise(row.category),
    sortable: false,
  },
  {
    key: "defaultPrice",
    header: "Default price",
    format: "money",
    align: "end",
    sortable: false,
  },
  { key: "stock", header: "Stock", format: "count", sortable: false },
  {
    key: "status",
    header: "Status",
    format: "status",
    accessor: (row) => capitalise(row.status),
    sortable: false,
  },
];

const subscriptionColumns: ColumnSpec<FinanceSubscription>[] = [
  { key: "number", header: "Subscription", format: "link", sortable: false },
  { key: "customer", header: "Customer", format: "party", sortable: false },
  { key: "plan", header: "Plan", format: "text", sortable: false },
  {
    key: "status",
    header: "Status",
    format: "status",
    accessor: (row) => capitalise(row.status),
    sortable: false,
  },
  {
    key: "billingMode",
    header: "Billing mode",
    format: "badge",
    accessor: (row) => capitalise(row.billingMode),
    sortable: false,
  },
  { key: "nextBill", header: "Next bill", format: "date", sortable: false },
  {
    key: "amount",
    header: "Amount",
    format: "money",
    align: "end",
    sortable: false,
  },
];

const rateCardColumns: ColumnSpec<FinanceRateCard>[] = [
  { key: "name", header: "Name", format: "text", sortable: false },
  {
    key: "kind",
    header: "Kind",
    format: "badge",
    accessor: (row) => capitalise(row.kind),
    sortable: false,
  },
  { key: "appliesTo", header: "Applies to", format: "text", sortable: false },
  {
    key: "rate",
    header: "Rate",
    format: "money",
    align: "end",
    sortable: false,
  },
  {
    key: "effectiveFrom",
    header: "Effective from",
    format: "date",
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

const productsSegment: SegmentSpec<FinanceProduct> = {
  key: "products",
  label: (t) => t.products,
  rows: (persona) => financeData(persona).products,
  total: (persona) => financeData(persona).totals.products,
  columns: productColumns,
  chips: (["product", "service", "plan"] as const).map((type) => ({
    key: type,
    label: capitalise(type),
    predicate: (row) => row.type === type,
  })),
  // Utilities archives most of its catalogue, so the list is not filtered by default.
  selects: [
    {
      key: "status",
      label: "Status",
      options: (["active", "archived"] as const).map((status) => ({
        value: status,
        label: capitalise(status),
        predicate: (row: FinanceProduct) => row.status === status,
      })),
    },
  ],
  rowActions: [
    { label: "Open", icon: ExternalLink },
    { label: "Edit", icon: Pencil },
    { label: "Archive", icon: Archive },
  ],
  empty: empty("No products found", adjust),
};

const subscriptionsSegment: SegmentSpec<FinanceSubscription> = {
  key: "subscriptions",
  label: "Subscriptions",
  rows: (persona) => financeData(persona).subscriptions,
  total: (persona) => financeData(persona).totals.subscriptions,
  columns: subscriptionColumns,
  chips: statusChips([
    "active",
    "canceled",
    "past_due",
    "trialing",
    "paused",
    "draft",
  ]),
  rowActions: [
    { label: "Open", icon: ExternalLink },
    { label: "Generate invoice", icon: Zap },
    { label: "Cancel", icon: X, variant: "destructive" },
  ],
  empty: empty("No subscriptions found", adjust),
};

const rateCardsSegment: SegmentSpec<FinanceRateCard> = {
  key: "rate-cards",
  label: "Rate cards",
  rows: (persona) => financeData(persona).rateCards,
  total: (persona) => financeData(persona).totals.rateCards,
  columns: rateCardColumns,
  chips: statusChips(["active", "scheduled", "expired"]),
  rowActions: [
    { label: "Edit", icon: Pencil },
    { label: "Duplicate", icon: Copy },
  ],
  empty: empty("No rate cards found", adjust),
};

export const catalogueSpec: AnyList = {
  key: "catalogue",
  title: "Catalogue",
  description: "Products, subscriptions and rate cards.",
  ...lead(productsSegment),
  pageActions: [
    {
      label: "Import",
      icon: Upload,
      variant: "outline",
      gap: "file-import",
    },
    { label: "Add item", icon: Plus },
  ],
  search: searchBy("name", "sku", "number", "customer", "plan"),
  segments: [productsSegment, subscriptionsSegment, rateCardsSegment],
};
