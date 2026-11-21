import { describe, expect, it } from "vitest";
import {
  PAGE_SIZE,
  pageLinks,
  paginate,
  parsePage,
} from "../src/pagination.js";

describe("parsePage", () => {
  it.each([
    [null, 1],
    ["", 1],
    ["0", 1],
    ["-2", 1],
    ["1.5", 1],
    ["abc", 1],
    ["02", 1],
    ["3", 3],
  ] as const)("%j -> %d", (param, page) => {
    expect(parsePage(param)).toBe(page);
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 35 }, (_, i) => i);

  it("pages 16 at a time", () => {
    expect(PAGE_SIZE).toBe(16);
    expect(paginate(items, 1)).toEqual({
      items: items.slice(0, 16),
      page: 1,
      pageCount: 3,
    });
    expect(paginate(items, 3).items).toEqual([32, 33, 34]);
  });

  it("clamps out-of-range pages", () => {
    expect(paginate(items, 99).page).toBe(3);
    expect(paginate(items, 0).page).toBe(1);
  });

  it("has one (empty) page when there is nothing to show", () => {
    expect(paginate([], 4)).toEqual({ items: [], page: 1, pageCount: 1 });
  });
});

describe("pageLinks", () => {
  it("lists every page when there are few", () => {
    expect(pageLinks(1, 1)).toEqual([1]);
    expect(pageLinks(2, 4)).toEqual([1, 2, 3, 4]);
  });

  it("collapses long runs into ellipses", () => {
    expect(pageLinks(1, 10)).toEqual([1, 2, "end-ellipsis", 10]);
    expect(pageLinks(5, 10)).toEqual([
      1,
      "start-ellipsis",
      4,
      5,
      6,
      "end-ellipsis",
      10,
    ]);
    expect(pageLinks(10, 10)).toEqual([1, "start-ellipsis", 9, 10]);
  });

  it("fills a gap of exactly one page instead of eliding it", () => {
    expect(pageLinks(4, 10)).toEqual([1, 2, 3, 4, 5, "end-ellipsis", 10]);
  });
});
