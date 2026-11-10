import type { PersonaKey } from "../../specs/types.js";
import type { NumRange, Weighted } from "../random.js";

/** U1 utilities persona tenant, U2 the utilities tenant with the AR volume, F1 financial persona, G1 government persona, any = whole QA. */
export type SourceTenant = "U1" | "U2" | "F1" | "G1" | "any";

export type TableShape = {
  table: string;
  totals: Record<PersonaKey, number>;
  source: Record<PersonaKey, { tenant: SourceTenant; borrowed: boolean }>;
  enums: Record<string, Weighted<string>>;
  numbers?: Record<string, NumRange>;
  dates?: { fromDaysAgo: number; toDaysAgo: number };
};
