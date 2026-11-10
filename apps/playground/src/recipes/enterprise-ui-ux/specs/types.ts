import type { LucideIcon } from "lucide-react";
import type { GapId } from "../gaps.js";

export type PersonaKey = "utilities" | "financial" | "government_federal";

/** Nomenclature per persona; keys map 1:1 onto the `industry-config.ts` terms. */
export type Terms = {
  contacts: string;
  organizations: string;
  invoices: string;
  bills: string;
  payments: string;
  tickets: string;
  leads: string;
  opportunities: string;
  products: string;
  outages: string;
  contact: string;
  organization: string;
  invoice: string;
  lead: string;
  opportunity: string;
  personCustomer: string;
  personVendor: string;
  personEmployee: string;
  orgCustomer: string;
  orgVendor: string;
  orgEmployee: string;
  createContact: string;
  createOrganization: string;
  createLead: string;
  createOpportunity: string;
};

export type Persona = {
  key: PersonaKey;
  label: string;
  tenantName: string;
  seed: number;
  currency: "USD";
  terms: Terms;
};

/** A literal string, or a function of the active persona's terms. */
export type Label = string | ((terms: Terms) => string);

export type Format =
  | "text"
  | "money"
  | "date"
  | "datetime"
  | "status"
  | "party"
  | "count"
  | "link"
  | "boolean"
  | "duration"
  | "percent"
  | "badge";

export type Row = { id: string } & Record<string, unknown>;

export type ColumnSpec<R extends Row = Row> = {
  key: string;
  header: Label;
  format: Format;
  accessor?: (row: R) => unknown;
  align?: "start" | "end";
  sortable?: boolean;
};

export type ChipSpec<R extends Row = Row> = {
  key: string;
  label: Label;
  predicate: (row: R) => boolean;
};

/** A second, single-select filter dimension beside the chips (channel, status, date preset...). */
export type SelectOption<R extends Row = Row> = {
  value: string;
  label: Label;
  predicate: (row: R) => boolean;
};

export type SelectFilterSpec<R extends Row = Row> = {
  key: string;
  label: Label;
  options: SelectOption<R>[] | ((persona: Persona) => SelectOption<R>[]);
};

/** A select whose options have been resolved for the active persona. */
export type ResolvedSelect<R extends Row = Row> = Omit<
  SelectFilterSpec<R>,
  "options"
> & { options: SelectOption<R>[] };

export type ActionSpec = {
  label: Label;
  icon?: LucideIcon;
  variant?: "default" | "outline" | "ghost" | "destructive";
  gap?: GapId;
};

export type EmptyCopy = { title: Label; description: Label };

export type SegmentSpec<R extends Row = Row> = {
  key: string;
  label: Label;
  rows: (persona: Persona) => R[];
  columns?: ColumnSpec<R>[];
  chips?: ChipSpec<R>[];
  selects?: SelectFilterSpec<R>[];
  empty?: EmptyCopy;
  rowActions?: ActionSpec[];
  total?: (persona: Persona) => number;
  gaps?: GapId[];
};

export type ListSpec<R extends Row = Row> = {
  key: string;
  title: Label;
  description?: Label;
  rows: (persona: Persona) => R[];
  total?: (persona: Persona) => number;
  columns: ColumnSpec<R>[];
  chips: ChipSpec<R>[];
  selects?: SelectFilterSpec<R>[];
  segments?: SegmentSpec<R>[];
  rowActions: ActionSpec[];
  pageActions: ActionSpec[];
  search: (row: R, query: string) => boolean;
  empty: EmptyCopy;
  selectable?: boolean;
  gaps?: GapId[];
};

export type StatSpec = {
  label: Label;
  value: number | string;
  hint: Label;
  gap?: GapId;
};

export type PanelSpec = {
  title: Label;
  description: Label;
  gap?: GapId;
} & (
  | { kind: "table"; columns: ColumnSpec[]; rows: Row[] }
  | { kind: "list"; items: { label: string; value: string; hint?: string }[] }
  | {
      kind: "meters";
      meters: { label: string; value: number; max: number; display: string }[];
    }
  | { kind: "placeholder"; message: string }
);

export type DashboardSpec = { stats: StatSpec[]; panels: PanelSpec[] };

export type ModuleSpecs = {
  dashboard: (persona: Persona) => DashboardSpec;
  // biome-ignore lint/suspicious/noExplicitAny: lists are heterogeneous in their row type
  items: Record<string, ListSpec<any>>;
};

export const resolveLabel = (label: Label, terms: Terms): string =>
  typeof label === "function" ? label(terms) : label;
