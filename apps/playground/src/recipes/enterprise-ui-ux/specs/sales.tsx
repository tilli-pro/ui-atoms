import {
  ArrowRightCircle,
  Check,
  Columns3,
  Copy,
  Download,
  ExternalLink,
  FileUp,
  Kanban,
  Pencil,
  Plus,
  Trophy,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { ANCHOR } from "../mock/random.js";
import {
  type DealStatus,
  type LeadStatus,
  type OrderDirection,
  type OrderStatus,
  type QuoteStatus,
  type SalesDeal,
  type SalesLead,
  type SalesOrder,
  type SalesQuote,
  salesData,
} from "../mock/sales.js";
import {
  leadsShape,
  opportunitiesShape,
  ordersShape,
  pipelineStagesF1,
  quotesShape,
} from "../mock/shapes/sales.js";
import type {
  ActionSpec,
  ChipSpec,
  ColumnSpec,
  ModuleSpecs,
  Persona,
} from "./types.js";

const DAY = 86_400_000;

const includes = (value: string, query: string) =>
  value.toLowerCase().includes(query.trim().toLowerCase());

const capitalise = (value: string) => {
  const spaced = value.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

const count = <T,>(rows: T[], test: (row: T) => boolean) =>
  rows.filter(test).length;

const compactMoney = (value: number) => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${Math.round(value)}`;
};

const leadStatuses: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "unqualified",
  "converted",
];
const dealStatuses: DealStatus[] = ["open", "won", "lost"];
const quoteStatuses: QuoteStatus[] = [
  "draft",
  "sent",
  "accepted",
  "rejected",
  "expired",
];

const leadTotal = (persona: Persona) => leadsShape.totals[persona.key];
const dealTotal = (persona: Persona) => opportunitiesShape.totals[persona.key];
const quoteTotal = (persona: Persona) => quotesShape.totals[persona.key];
const orderTotal = (persona: Persona) => ordersShape.totals[persona.key];

const leadColumns: ColumnSpec<SalesLead>[] = [
  {
    key: "name",
    header: "Name / Company",
    format: "party",
    sortable: false,
    accessor: (row) => ({ name: row.name, subline: row.company }),
  },
  { key: "contact", header: "Contact", format: "text", sortable: false },
  {
    key: "source",
    header: "Source",
    format: "text",
    accessor: (row) => (row.source ? capitalise(row.source) : null),
    sortable: false,
  },
  {
    key: "status",
    header: "Status",
    format: "status",
    accessor: (row) => capitalise(row.status),
    sortable: false,
  },
  {
    key: "rating",
    header: "Rating",
    format: "badge",
    accessor: (row) => capitalise(row.rating),
    sortable: false,
  },
  {
    key: "estimatedValue",
    header: "Est. value",
    format: "money",
    align: "end",
    sortable: false,
  },
];

const dealColumns: ColumnSpec<SalesDeal>[] = [
  {
    key: "name",
    header: (t) => t.opportunity,
    format: "link",
    sortable: false,
  },
  {
    key: "amount",
    header: "Amount",
    format: "money",
    align: "end",
    sortable: false,
  },
  {
    key: "stage",
    header: "Stage / Probability",
    format: "text",
    accessor: (row) => `${row.stage} · ${row.probability}%`,
    sortable: false,
  },
  { key: "closeDate", header: "Close date", format: "date", sortable: false },
  {
    key: "status",
    header: "Status",
    format: "status",
    accessor: (row) => capitalise(row.status),
    sortable: false,
  },
  { key: "account", header: "Account", format: "text", sortable: false },
];

const quoteColumns: ColumnSpec<SalesQuote>[] = [
  { key: "number", header: "Quote", format: "link", sortable: false },
  { key: "name", header: "Name", format: "text", sortable: false },
  {
    key: "status",
    header: "Status",
    format: "status",
    accessor: (row) => capitalise(row.status),
    sortable: false,
  },
  {
    key: "total",
    header: "Total",
    format: "money",
    align: "end",
    sortable: false,
  },
];

const orderColumns = (
  counterparty: "Customer" | "Supplier",
  invoiced: string,
  uninvoiced: string,
): ColumnSpec<SalesOrder>[] => [
  { key: "number", header: "Order", format: "link", sortable: true },
  { key: "type", header: "Type", format: "text", sortable: false },
  {
    key: "status",
    header: "Status",
    format: "status",
    accessor: (row) => capitalise(row.status),
    sortable: false,
  },
  { key: "date", header: "Date", format: "date", sortable: true },
  { key: "party", header: counterparty, format: "party", sortable: false },
  {
    key: "total",
    header: "Total",
    format: "money",
    align: "end",
    sortable: true,
  },
  {
    key: "invoiced",
    header: invoiced,
    format: "money",
    align: "end",
    sortable: false,
  },
  {
    key: "uninvoiced",
    header: uninvoiced,
    format: "money",
    align: "end",
    sortable: false,
  },
];

const leadChips: ChipSpec<SalesLead>[] = leadStatuses.map((status) => ({
  key: status,
  label: capitalise(status),
  predicate: (row) => row.status === status,
}));

const dealChips: ChipSpec<SalesDeal>[] = dealStatuses.map((status) => ({
  key: status,
  label: capitalise(status),
  predicate: (row) => row.status === status,
}));

const quoteChips: ChipSpec<SalesQuote>[] = quoteStatuses.map((status) => ({
  key: status,
  label: capitalise(status),
  predicate: (row) => row.status === status,
}));

const orderChips = (statuses: OrderStatus[]): ChipSpec<SalesOrder>[] =>
  statuses.map((status) => ({
    key: status,
    label: capitalise(status),
    predicate: (row) => row.status === status,
  }));

const ordersOf = (direction: OrderDirection) => (persona: Persona) =>
  salesData(persona).orders.filter((row) => row.direction === direction);

const orderExport: ActionSpec = {
  label: "Export to CSV",
  icon: Download,
  variant: "outline",
};
const orderColumnsChooser: ActionSpec = {
  label: "Columns",
  icon: Columns3,
  variant: "outline",
  gap: "data-grid",
};
const orderEmpty = {
  title: "No orders match these filters",
  description: "Try adjusting your search criteria.",
};

export const salesSpecs: ModuleSpecs = {
  items: {
    leads: {
      key: "leads",
      title: (t) => t.leads,
      description: "Prospects to qualify and convert.",
      rows: (persona) => salesData(persona).leads,
      total: leadTotal,
      columns: leadColumns,
      chips: leadChips,
      rowActions: [
        { label: "Open", icon: ExternalLink },
        { label: "Convert", icon: ArrowRightCircle },
        { label: "Edit", icon: Pencil },
      ],
      pageActions: [
        {
          label: "Import",
          icon: Upload,
          variant: "outline",
          gap: "file-import",
        },
        { label: "Export", icon: Download, variant: "outline" },
        { label: (t) => t.createLead, icon: Plus },
      ],
      search: (row: SalesLead, query) =>
        includes(row.name, query) || includes(row.company, query),
      empty: {
        title: (t) => `No ${t.leads.toLowerCase()} found`,
        description: "Try adjusting your search criteria.",
      },
    },
    deals: {
      key: "deals",
      title: (t) => t.opportunities,
      description: "Track and manage your sales pipeline.",
      rows: (persona) => salesData(persona).deals,
      total: dealTotal,
      columns: dealColumns,
      chips: dealChips,
      selects: [
        {
          key: "stage",
          label: "stages",
          options: pipelineStagesF1.map((stage) => ({
            value: stage.name,
            label: stage.name,
            predicate: (row: SalesDeal) => row.stage === stage.name,
          })),
        },
      ],
      gaps: ["kanban"],
      rowActions: [
        { label: "Open", icon: ExternalLink },
        { label: "Edit", icon: Pencil },
        { label: "Mark won", icon: Trophy },
        { label: "Mark lost", icon: XCircle, variant: "destructive" },
      ],
      pageActions: [
        {
          label: "Import",
          icon: FileUp,
          variant: "outline",
          gap: "file-import",
        },
        { label: (t) => t.createOpportunity, icon: Plus },
        { label: "Board", icon: Kanban, variant: "outline", gap: "kanban" },
      ],
      search: (row: SalesDeal, query) =>
        includes(row.name, query) || includes(row.account, query),
      empty: {
        title: (t) => `No ${t.opportunities.toLowerCase()} found`,
        description: "Try adjusting your search criteria.",
      },
    },
    quotes: {
      key: "quotes",
      title: "Quotes",
      description: "Create and manage ERP-ready quotes.",
      rows: (persona) => salesData(persona).quotes,
      total: quoteTotal,
      columns: quoteColumns,
      chips: quoteChips,
      gaps: ["filter-builder"],
      rowActions: [
        { label: "Open", icon: ExternalLink },
        { label: "Duplicate", icon: Copy },
      ],
      pageActions: [{ label: "Create quote", icon: Plus }],
      search: (row: SalesQuote, query) =>
        includes(row.number, query) || includes(row.name, query),
      empty: {
        title: "No quotes found",
        description: "Try adjusting your search criteria.",
      },
    },
    orders: {
      key: "orders",
      title: "Orders",
      description:
        "Sales and purchase orders, and orders received from partners.",
      rows: ordersOf("sales"),
      total: orderTotal,
      columns: orderColumns("Customer", "Invoiced", "Uninvoiced"),
      chips: orderChips([
        "draft",
        "submitted",
        "confirmed",
        "closed",
        "cancelled",
      ]),
      selectable: true,
      gaps: ["data-grid"],
      rowActions: [{ label: "Open", icon: ExternalLink }],
      pageActions: [
        orderExport,
        { label: "New order", icon: Plus },
        orderColumnsChooser,
      ],
      search: (row: SalesOrder, query) =>
        includes(row.number, query) || includes(row.party, query),
      empty: orderEmpty,
      segments: [
        {
          key: "sales",
          label: "Sales",
          rows: ordersOf("sales"),
          total: orderTotal,
          columns: orderColumns("Customer", "Invoiced", "Uninvoiced"),
          chips: orderChips([
            "draft",
            "submitted",
            "confirmed",
            "closed",
            "cancelled",
          ]),
          rowActions: [{ label: "Open", icon: ExternalLink }],
          empty: { ...orderEmpty, title: "No sales orders yet" },
        },
        {
          key: "purchase",
          label: "Purchase",
          rows: ordersOf("purchase"),
          total: orderTotal,
          columns: orderColumns("Supplier", "Billed", "Unbilled"),
          chips: orderChips(["submitted", "confirmed", "closed"]),
          rowActions: [{ label: "Open", icon: ExternalLink }],
          empty: { ...orderEmpty, title: "No purchase orders yet" },
        },
        {
          key: "received",
          label: "Received",
          rows: ordersOf("received"),
          total: (persona) => ordersOf("received")(persona).length,
          columns: orderColumns("Customer", "Invoiced", "Uninvoiced"),
          chips: orderChips(["received"]),
          rowActions: [
            { label: "Open", icon: ExternalLink },
            { label: "Accept", icon: Check },
            { label: "Reject", icon: X, variant: "destructive" },
          ],
          empty: {
            title: "No orders from partners are waiting",
            description: "Orders your partners send appear here.",
          },
        },
      ],
    },
  },
  dashboard: (persona) => {
    const data = salesData(persona);
    const openDeals = data.deals.filter((row) => row.status === "open");
    const won = count(data.deals, (row) => row.status === "won");
    const lost = count(data.deals, (row) => row.status === "lost");
    const winRate = won + lost === 0 ? 0 : (won / (won + lost)) * 100;
    const sentQuotes = data.quotes.filter((row) => row.status === "sent");
    const monthOrders = count(
      data.orders,
      (row) =>
        row.direction !== "received" &&
        ANCHOR.getTime() - row.date.getTime() <= 30 * DAY,
    );
    const byStage = pipelineStagesF1
      .filter((stage) => !(stage.isWon || stage.isLost))
      .map((stage) => ({
        stage: stage.name,
        amount: openDeals
          .filter((row) => row.stage === stage.name)
          .reduce((sum, row) => sum + row.amount, 0),
      }));
    const max = Math.max(1, ...byStage.map((entry) => entry.amount));
    const money = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: persona.currency,
      maximumFractionDigits: 0,
    });
    const expiring = sentQuotes
      .filter((row) => {
        const ahead = row.expiresAt.getTime() - ANCHOR.getTime();
        return ahead >= 0 && ahead <= 20 * DAY;
      })
      .sort((a, b) => a.expiresAt.getTime() - b.expiresAt.getTime())
      .slice(0, 6);
    return {
      stats: [
        {
          label: "Open deals",
          value: openDeals.length,
          hint: "Still in the pipeline",
        },
        {
          label: "Pipeline",
          value: compactMoney(openDeals.reduce((s, row) => s + row.amount, 0)),
          hint: "Sum of open amounts",
        },
        {
          label: "Win rate",
          value: `${Math.round(winRate)}%`,
          hint: "Won of closed deals",
        },
        {
          label: "Quotes awaiting",
          value: sentQuotes.length,
          hint: "Sent, no answer yet",
        },
        {
          label: "Orders this month",
          value: monthOrders,
          hint: "Dated in the last 30 days",
        },
      ],
      panels: [
        {
          kind: "meters",
          title: "Pipeline by stage",
          description: "Open amount in each stage.",
          gap: "charts",
          meters: byStage.map((entry) => ({
            label: entry.stage,
            value: entry.amount,
            max,
            display: money.format(entry.amount),
          })),
        },
        {
          kind: "table",
          title: "Quotes expiring",
          description: "Sent quotes that lapse within 20 days.",
          columns: [
            { key: "number", header: "Quote", format: "link" },
            { key: "name", header: "Name", format: "text" },
            { key: "total", header: "Total", format: "money", align: "end" },
            { key: "expiresAt", header: "Expires", format: "date" },
          ],
          rows: expiring,
        },
        {
          kind: "table",
          title: "Recent orders",
          description: "Newest sales and purchase orders.",
          columns: [
            { key: "number", header: "Order", format: "link" },
            { key: "type", header: "Type", format: "text" },
            {
              key: "status",
              header: "Status",
              format: "status",
              accessor: (row) => capitalise(String(row.status)),
            },
            { key: "party", header: "Party", format: "party" },
            { key: "total", header: "Total", format: "money", align: "end" },
          ],
          rows: data.orders
            .filter((row) => row.direction !== "received")
            .slice(0, 6),
        },
      ],
    };
  },
};
