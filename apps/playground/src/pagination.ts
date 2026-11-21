export const PAGE_SIZE = 16;

const POSITIVE_INTEGER = /^[1-9]\d*$/;

/** `?page=` value -> 1-based page number; anything malformed is page 1. */
export function parsePage(param: string | null): number {
  return param !== null && POSITIVE_INTEGER.test(param) ? Number(param) : 1;
}

export interface Page<T> {
  items: T[];
  /** 1-based, clamped into `1..pageCount`. */
  page: number;
  pageCount: number;
}

export function paginate<T>(
  items: readonly T[],
  requestedPage: number,
  pageSize: number = PAGE_SIZE,
): Page<T> {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(Math.max(1, Math.trunc(requestedPage)), pageCount);
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), page, pageCount };
}

export type PageLink = number | "start-ellipsis" | "end-ellipsis";

/** First, last, and the current page with one neighbour each side; gaps become ellipses. */
export function pageLinks(page: number, pageCount: number): PageLink[] {
  const pages = new Set([1, pageCount, page - 1, page, page + 1]);
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= pageCount)
    .sort((a, b) => a - b);
  const out: PageLink[] = [];
  for (const [i, p] of sorted.entries()) {
    const prev = sorted[i - 1];
    if (prev !== undefined && p - prev === 2) out.push(prev + 1);
    else if (prev !== undefined && p - prev > 2)
      out.push(p === pageCount ? "end-ellipsis" : "start-ellipsis");
    out.push(p);
  }
  return out;
}
