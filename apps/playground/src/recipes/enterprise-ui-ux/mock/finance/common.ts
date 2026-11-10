import { moneyFrom } from "../money.js";
import { organizationsByIndustry, personName } from "../names.js";
import { ANCHOR, type NumRange, type Rng, type Weighted } from "../random.js";
import type { Persona, PersonaKey } from "../../specs/types.js";
import type { DayWindow } from "../shapes/finance.js";

export const DAY_MS = 24 * 60 * 60 * 1000;

export const weights = <T extends string>(
  enums: Record<string, Weighted<string>>,
  name: string,
) => enums[name] as unknown as Weighted<T>;

/** Source tenant of a shape for the persona. */
export const tenantOf = <T extends string>(
  shape: { source: Record<PersonaKey, { tenant: string }> },
  key: PersonaKey,
): T => shape.source[key].tenant as T;

/** `date` plus whole days, never past the anchor when `clamp` is set. */
export const plusDays = (date: Date, days: number, clamp = false): Date => {
  const out = new Date(date.getTime() + days * DAY_MS);
  return clamp && out.getTime() > ANCHOR.getTime() ? ANCHOR : out;
};

export const round2 = (n: number): number => Math.round(n * 100) / 100;

export const byDateAsc = <T>(rows: T[], get: (row: T) => Date): T[] =>
  rows.sort((a, b) => get(a).getTime() - get(b).getTime());

/** Customer or vendor name: about a third people, the rest organizations. */
export const partyName = (rng: Rng, persona: Persona): string =>
  rng.bool(0.33)
    ? personName(rng)
    : rng.pick(organizationsByIndustry[persona.key]);

const OVERDUE_LIKE = new Set(["overdue"]);
const SETTLED_LIKE = new Set(["paid", "void", "written_off"]);

/** Issue date from the window, due date after it; overdue rows are due before the anchor. */
export const documentDates = (
  rng: Rng,
  status: string,
  window: DayWindow,
  termsDays: number,
): { issueDate: Date; dueDate: Date; createdAt: Date } => {
  let issueDate = rng.daysAgo(window.fromDaysAgo, window.toDaysAgo);
  let dueDate = plusDays(issueDate, termsDays);
  if (OVERDUE_LIKE.has(status) && dueDate.getTime() >= ANCHOR.getTime()) {
    issueDate = plusDays(ANCHOR, -(termsDays + rng.int(1, 30)));
    dueDate = plusDays(issueDate, termsDays);
  }
  // Created the day of issue or shortly after, never past the anchor.
  const createdAt = plusDays(issueDate, rng.next() * 2, true);
  return { issueDate, dueDate, createdAt };
};

/** Outstanding balance: 0 for settled rows, a share for partial ones, else the total. */
export const balanceFor = (rng: Rng, status: string, total: number): number => {
  if (SETTLED_LIKE.has(status)) return 0;
  if (status === "partially_paid") {
    return round2(total * rng.range({ min: 0.1, median: 0.5, max: 0.9 }));
  }
  return total;
};

export const numberRange = (
  shape: { numbers?: Record<string, NumRange> },
  name: string,
): NumRange => (shape.numbers ?? {})[name] as NumRange;

export const money = (
  rng: Rng,
  shape: { numbers?: Record<string, NumRange> },
  name: string,
): number => moneyFrom(rng, numberRange(shape, name));
