import type { NumRange, Rng } from "./random.js";

/** Appendix money shapes can be 0/0/max (median = min): model the zero share as a point mass, then a skewed tail. */
export const moneyFrom = (rng: Rng, r: NumRange): number =>
  r.median === r.min
    ? rng.bool(0.55)
      ? r.min
      : rng.range({ min: r.min, median: r.max * 0.05, max: r.max })
    : rng.range(r);
