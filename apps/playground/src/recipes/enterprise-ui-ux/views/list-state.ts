import type { ColumnSpec, Row, SelectFilterSpec } from "../specs/types.js";

export const PAGE_SIZE = 25;

export type SortState = { key: string; dir: "asc" | "desc" } | null;

export const readValue = <R extends Row>(
  column: ColumnSpec<R>,
  row: R,
): unknown => (column.accessor ? column.accessor(row) : row[column.key]);

const isNil = (value: unknown): value is null | undefined =>
  value === null || value === undefined;

const sortable = (value: unknown): unknown =>
  typeof value === "object" &&
  value !== null &&
  !(value instanceof Date) &&
  "name" in value
    ? (value as { name: unknown }).name
    : value;

const compareValues = (x: unknown, y: unknown): number => {
  const a = sortable(x);
  const b = sortable(y);
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  return String(a).localeCompare(String(b));
};

/** Stable sort; `null`/`undefined` always last regardless of direction. */
export const sortRows = <R extends Row>(
  rows: R[],
  column: ColumnSpec<R> | undefined,
  dir: "asc" | "desc",
): R[] => {
  if (!column) return rows;
  const sign = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const left = readValue(column, a);
    const right = readValue(column, b);
    if (isNil(left) && isNil(right)) return 0;
    if (isNil(left)) return 1;
    if (isNil(right)) return -1;
    return sign * compareValues(left, right);
  });
};

export const applySelects = <R extends Row>(
  rows: R[],
  selects: SelectFilterSpec<R>[],
  chosen: Record<string, string>,
): R[] =>
  selects.reduce((acc, select) => {
    const option = select.options.find((o) => o.value === chosen[select.key]);
    return option ? acc.filter(option.predicate) : acc;
  }, rows);

/** Up to five page numbers (1-based) centred on the current page. */
export const pageWindow = (page: number, pageCount: number): number[] => {
  const size = Math.min(5, pageCount);
  const start = Math.min(
    Math.max(1, page - Math.floor(size / 2)),
    pageCount - size + 1,
  );
  return Array.from({ length: size }, (_, i) => start + i);
};
