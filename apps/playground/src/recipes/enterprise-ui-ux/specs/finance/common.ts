import { ANCHOR } from "../../mock/random.js";
import { DAY } from "../common.js";
import type { Persona } from "../types.js";

// The shared helpers live in `../common.js`; re-exported so finance imports keep working.
export {
  type AnyList,
  adjust,
  capitalise,
  compactMoney,
  DAY,
  empty,
  includes,
  lead,
  sameDay,
  searchBy,
  statusChips,
} from "../common.js";

export const money = (persona: Persona) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: persona.currency,
    maximumFractionDigits: 0,
  });

/** Days from the mock anchor to a date (negative when in the past). */
export const daysAhead = (date: Date) =>
  (date.getTime() - ANCHOR.getTime()) / DAY;
