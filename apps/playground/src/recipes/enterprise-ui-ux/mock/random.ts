import type { Persona } from "../specs/types.js";

/** Fixed "today" for every mock row, so generated dates never drift. */
export const ANCHOR = new Date("2026-11-10T12:00:00Z");

export type Weighted<T> = readonly (readonly [T, number])[];

export type NumRange = { min: number; median: number; max: number };

export type Rng = {
  next(): number;
  int(min: number, max: number): number;
  bool(p?: number): boolean;
  pick<T>(items: readonly T[]): T;
  weighted<T>(items: Weighted<T>): T;
  range(r: NumRange, decimals?: number): number;
  daysAgo(min: number, max: number): Date;
  daysAhead(min: number, max: number): Date;
  reference(prefix: string, width?: number): string;
  shuffle<T>(items: readonly T[]): T[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** Deterministic generator (mulberry32): the same seed always yields the same sequence. */
export const createRng = (seed: number): Rng => {
  let state = seed >>> 0;
  const counters = new Map<string, number>();

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const int = (min: number, max: number): number =>
    min + Math.floor(next() * (max - min + 1));

  const pick = <T>(items: readonly T[]): T =>
    items[int(0, items.length - 1)] as T;

  const weighted = <T>(items: Weighted<T>): T => {
    const total = items.reduce((sum, [, weight]) => sum + weight, 0);
    let roll = next() * total;
    for (const [value, weight] of items) {
      roll -= weight;
      if (roll < 0) return value;
    }
    return (items[items.length - 1] as readonly [T, number])[0];
  };

  const range = ({ min, median, max }: NumRange, decimals = 2): number => {
    const u = next();
    const span = max - min;
    const factor = 10 ** decimals;
    // A triangular sampler cannot reach a median below ~29% of the span, so
    // skewed shapes drew far above the request: sample each half around the
    // requested median instead, leaving the degenerate shapes unchanged.
    if (span > 0 && median > min && median < max) {
      const value =
        u < 0.5
          ? median - (median - min) * (1 - 2 * u) ** 2
          : median + (max - median) * (2 * u - 1) ** 2;
      return Math.round(value * factor) / factor;
    }
    const split = span === 0 ? 0 : (median - min) / span;
    const value =
      u < split
        ? min + Math.sqrt(u * span * (median - min))
        : max - Math.sqrt((1 - u) * span * (max - median));
    return Math.round(value * factor) / factor;
  };

  const withTimeOfDay = (dayOffset: number, sign: 1 | -1): Date => {
    const startOfAnchorDay = Date.UTC(
      ANCHOR.getUTCFullYear(),
      ANCHOR.getUTCMonth(),
      ANCHOR.getUTCDate(),
    );
    const time =
      startOfAnchorDay +
      sign * dayOffset * DAY_MS +
      Math.floor(next() * DAY_MS);
    return new Date(
      sign === -1
        ? Math.min(time, ANCHOR.getTime())
        : Math.max(time, ANCHOR.getTime()),
    );
  };

  const daysAgo = (min: number, max: number): Date =>
    withTimeOfDay(int(min, max), -1);

  const daysAhead = (min: number, max: number): Date =>
    withTimeOfDay(int(min, max), 1);

  const reference = (prefix: string, width = 5): string => {
    const n = (counters.get(prefix) ?? 0) + 1;
    counters.set(prefix, n);
    return `${prefix}-${String(n).padStart(width, "0")}`;
  };

  const shuffle = <T>(items: readonly T[]): T[] => {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
      const j = int(0, i);
      [out[i], out[j]] = [out[j] as T, out[i] as T];
    }
    return out;
  };

  return {
    next,
    int,
    bool: (p = 0.5) => next() < p,
    pick,
    weighted,
    range,
    daysAgo,
    daysAhead,
    reference,
    shuffle,
  };
};

/** Small deterministic string hash (FNV-1a), reduced to `[0, 1000)`. */
const hashKey = (key: string): number => {
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h % 1000;
};

/** One independent, stable seed per persona and dataset key. */
export const seedFor = (persona: Persona, key: string): number =>
  persona.seed * 1000 + hashKey(key);
