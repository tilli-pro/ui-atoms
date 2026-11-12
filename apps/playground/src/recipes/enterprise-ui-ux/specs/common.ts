import type {
  ChipSpec,
  EmptyCopy,
  FooterFn,
  ListSpec,
  Row,
  SegmentSpec,
} from "./types.js";

export const DAY = 86_400_000;

const WHITESPACE = /\s+/;
const UNDERSCORES = /_/g;
const CAMEL_BOUNDARY = /([a-z0-9])([A-Z])/g;

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
  const abs = Math.abs(value);
  const sign = value < 0 ? "−" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000)}K`;
  return `${sign}$${Math.round(abs)}`;
};

export const sameDay = (a: Date, b: Date) =>
  a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);

/**
 * The list-level fields a segmented item shows for its first segment. Segments
 * are authoritative for chips, selects, row actions and totals, so only the
 * rows, columns and empty copy are mirrored here.
 */
export const lead = <R extends Row>(segment: SegmentSpec<R>) => ({
  rows: segment.rows,
  columns: segment.columns ?? [],
  chips: [],
  rowActions: [],
  empty: segment.empty ?? empty("No rows found", adjust),
});

// biome-ignore lint/suspicious/noExplicitAny: items are heterogeneous in their row type
export type AnyList = ListSpec<any>;

/** Footer sums (compact money, labelled with the persona currency) over the filtered rows. */
export const sumFooter =
  <R extends Row>(
    parts: readonly (readonly [label: string, pick: (row: R) => number])[],
  ): FooterFn<R> =>
  (rows, persona) =>
    parts.map(([label, pick]) => ({
      label: `${label} ${persona.currency}`,
      value: compactMoney(rows.reduce((acc, row) => acc + pick(row), 0)),
    }));

/** "Ada Lovelace" → "AL"; a single word gives its first two letters. */
export const initialsOf = (name: string): string => {
  const words = name.trim().split(WHITESPACE).filter(Boolean);
  const letters =
    words.length > 1
      ? `${words[0]?.charAt(0) ?? ""}${words[1]?.charAt(0) ?? ""}`
      : (words[0] ?? "").slice(0, 2);
  return letters.toUpperCase();
};

const HUMAN_KEYS: Record<string, string> = {
  sap_s4hanaId: "SAP S/4HANA id",
  oracle_ccnbId: "Oracle CC&B id",
  quickbooksId: "QuickBooks id",
  qaGovPayerKey: "Payer key",
};

/** "follow_up_status" → "Follow up status"; camelCase splits on capitals. */
export const humanise = (key: string): string => {
  const mapped = HUMAN_KEYS[key];
  if (mapped) return mapped;
  const spaced = key
    .replace(UNDERSCORES, " ")
    .replace(CAMEL_BOUNDARY, "$1 $2")
    .toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};
