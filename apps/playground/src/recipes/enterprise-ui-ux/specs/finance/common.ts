import { ANCHOR } from "../../mock/random.js";
import type {
  ChipSpec,
  EmptyCopy,
  ListSpec,
  Persona,
  Row,
  SegmentSpec,
} from "../types.js";

export const DAY = 86_400_000;

export const includes = (value: string, query: string) =>
  value.toLowerCase().includes(query.trim().toLowerCase());

export const capitalise = (value: string) => {
  const spaced = value.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

/** Case-insensitive match over the named string fields of a row. */
export const searchBy =
  (...keys: string[]) =>
  (row: Row, query: string) =>
    keys.some((key) => {
      const value = row[key];
      return typeof value === "string" && includes(value, query);
    });

export const statusChips = <R extends Row>(statuses: string[]): ChipSpec<R>[] =>
  statuses.map((status) => ({
    key: status,
    label: capitalise(status),
    predicate: (row) => row.status === status,
  }));

export const empty = (title: string, description: string): EmptyCopy => ({
  title,
  description,
});

export const adjust = "Try adjusting your search criteria.";

export const compactMoney = (value: number) => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${Math.round(value)}`;
};

export const money = (persona: Persona) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: persona.currency,
    maximumFractionDigits: 0,
  });

/** Days from the mock anchor to a date (negative when in the past). */
export const daysAhead = (date: Date) =>
  (date.getTime() - ANCHOR.getTime()) / DAY;

/** The list-level fields a segmented item shows for its first segment. */
export const lead = <R extends Row>(segment: SegmentSpec<R>) => ({
  rows: segment.rows,
  columns: segment.columns ?? [],
  chips: segment.chips ?? [],
  rowActions: segment.rowActions ?? [],
  empty: segment.empty ?? empty("No rows found", adjust),
  ...(segment.total ? { total: segment.total } : {}),
  ...(segment.selects ? { selects: segment.selects } : {}),
});

// biome-ignore lint/suspicious/noExplicitAny: items are heterogeneous in their row type
export type AnyList = ListSpec<any>;
