import { applyInlineProperties } from "./tokens.js";

/** The two colours `theme-seeded` derives a whole theme from. */
export interface ThemeSeeds {
  /** Text and solid controls. Written to `--seed-primary`. */
  primary: string;
  /** The page background. Written to `--seed-background`. */
  background: string;
}

const SEED_PROPERTIES = {
  primary: "--seed-primary",
  background: "--seed-background",
} as const satisfies Record<keyof ThemeSeeds, string>;

/**
 * Sets `--seed-primary` / `--seed-background` inline on `target` (default `<html>`); the
 * returned function restores what was there. The element, or the elements inside it that
 * should change, must carry `theme-seeded` and a mode utility for the seeds to take effect.
 */
export function applyThemeSeeds(
  seeds: Partial<ThemeSeeds>,
  target?: HTMLElement,
): () => void {
  const properties: [string, string][] = [];
  for (const key of Object.keys(SEED_PROPERTIES) as (keyof ThemeSeeds)[]) {
    const value = seeds[key];
    if (typeof value === "string")
      properties.push([SEED_PROPERTIES[key], value]);
  }
  return applyInlineProperties(properties, target);
}
